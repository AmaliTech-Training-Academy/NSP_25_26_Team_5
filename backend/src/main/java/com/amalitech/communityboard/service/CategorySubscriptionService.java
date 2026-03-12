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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CategorySubscriptionService {

    private static final Logger log = LoggerFactory.getLogger(CategorySubscriptionService.class);
    private static final int CONFIRMATION_EXPIRY_HOURS = 24;

    private final CategorySubscriptionRepository subscriptionRepository;
    private final CategoryRepository categoryRepository;
    private final EmailService emailService;

    @Value("${app.base-url:}")
    private String appBaseUrl;

    @Transactional
    public CategorySubscription subscribe(User user, Long categoryId) {
        if (subscriptionRepository.existsByUserIdAndCategoryId(user.getId(), categoryId)) {
            return subscriptionRepository.findByUserIdAndCategoryId(user.getId(), categoryId)
                    .orElseThrow();
        }
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + categoryId));

        String token = UUID.randomUUID().toString().replace("-", "");
        LocalDateTime expiresAt = LocalDateTime.now().plusHours(CONFIRMATION_EXPIRY_HOURS);

        CategorySubscription sub = CategorySubscription.builder()
                .user(user)
                .category(category)
                .confirmed(false)
                .confirmationToken(token)
                .confirmationExpiresAt(expiresAt)
                .build();
        sub = subscriptionRepository.save(sub);

        String confirmLink = buildConfirmLink(token);
        emailService.sendSubscriptionConfirmation(user, category, confirmLink);
        log.info("User {} requested subscription to category {} ({}); confirmation email sent.",
                user.getEmail(), category.getName(), categoryId);
        return sub;
    }

    @Transactional
    public boolean confirmByToken(String token) {
        CategorySubscription sub = subscriptionRepository.findByConfirmationToken(token)
                .orElse(null);
        if (sub == null || sub.getConfirmationExpiresAt() == null || sub.getConfirmationExpiresAt().isBefore(LocalDateTime.now())) {
            return false;
        }
        sub.setConfirmed(true);
        sub.setConfirmationToken(null);
        sub.setConfirmationExpiresAt(null);
        subscriptionRepository.save(sub);
        log.info("Subscription {} confirmed for user {}", sub.getId(), sub.getUser().getEmail());
        return true;
    }

    @Transactional
    public void unsubscribe(User user, Long categoryId) {
        CategorySubscription sub = subscriptionRepository.findByUserIdAndCategoryId(user.getId(), categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found for this category"));
        subscriptionRepository.delete(sub);
        log.info("User {} unsubscribed from category {}", user.getEmail(), categoryId);
    }

    private String buildConfirmLink(String token) {
        String base = appBaseUrl != null ? appBaseUrl.replaceAll("/$", "") : "";
        return base + "/api/categories/subscriptions/confirm?token=" + token;
    }

    public List<CategorySubscription> findByUser(User user) {
        return subscriptionRepository.findByUserOrderByCreatedAtDesc(user);
    }

    public boolean isSubscribed(User user, Long categoryId) {
        return subscriptionRepository.existsByUserIdAndCategoryId(user.getId(), categoryId);
    }
}
