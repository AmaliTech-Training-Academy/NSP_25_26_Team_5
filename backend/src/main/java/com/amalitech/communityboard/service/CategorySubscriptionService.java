package com.amalitech.communityboard.service;

import com.amalitech.communityboard.exception.ResourceNotFoundException;
import com.amalitech.communityboard.model.Category;
import com.amalitech.communityboard.model.CategorySubscription;
import com.amalitech.communityboard.model.User;
import com.amalitech.communityboard.repository.CategoryRepository;
import com.amalitech.communityboard.repository.CategorySubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategorySubscriptionService {

    private static final Logger log = LoggerFactory.getLogger(CategorySubscriptionService.class);

    private final CategorySubscriptionRepository subscriptionRepository;
    private final CategoryRepository categoryRepository;
    private final SnsNotificationService snsNotificationService;

    @Transactional
    public CategorySubscription subscribe(User user, Long categoryId) {
        if (subscriptionRepository.existsByUserIdAndCategoryId(user.getId(), categoryId)) {
            return subscriptionRepository.findByUserIdAndCategoryId(user.getId(), categoryId)
                    .orElseThrow();
        }
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + categoryId));

        String subscriptionArn;
        try {
            subscriptionArn = snsNotificationService.subscribeEmailToCategoryTopic(categoryId, user.getEmail());
        } catch (Exception e) {
            log.warn("SNS subscribe failed for user {} category {}: {}", user.getEmail(), categoryId, e.getMessage());
            throw new IllegalStateException("Failed to subscribe to category notifications. Check AWS SNS configuration.", e);
        }

        CategorySubscription sub = CategorySubscription.builder()
                .user(user)
                .category(category)
                .snsSubscriptionArn(subscriptionArn)
                .build();
        sub = subscriptionRepository.save(sub);
        log.info("User {} subscribed to category {} ({}); confirm via email to receive notifications.",
                user.getEmail(), category.getName(), categoryId);
        return sub;
    }

    @Transactional
    public void unsubscribe(User user, Long categoryId) {
        CategorySubscription sub = subscriptionRepository.findByUserIdAndCategoryId(user.getId(), categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found for this category"));
        if (sub.getSnsSubscriptionArn() != null && !sub.getSnsSubscriptionArn().startsWith("PendingConfirmation")) {
            snsNotificationService.unsubscribe(sub.getSnsSubscriptionArn());
        }
        subscriptionRepository.delete(sub);
        log.info("User {} unsubscribed from category {}", user.getEmail(), categoryId);
    }

    public List<CategorySubscription> findByUser(User user) {
        return subscriptionRepository.findByUserOrderByCreatedAtDesc(user);
    }

    public boolean isSubscribed(User user, Long categoryId) {
        return subscriptionRepository.existsByUserIdAndCategoryId(user.getId(), categoryId);
    }
}
