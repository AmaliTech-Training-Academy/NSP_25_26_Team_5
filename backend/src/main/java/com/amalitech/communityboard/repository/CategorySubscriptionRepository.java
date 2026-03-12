package com.amalitech.communityboard.repository;

import com.amalitech.communityboard.model.CategorySubscription;
import com.amalitech.communityboard.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategorySubscriptionRepository extends JpaRepository<CategorySubscription, Long> {

    List<CategorySubscription> findByUserOrderByCreatedAtDesc(User user);

    Optional<CategorySubscription> findByUserIdAndCategoryId(Long userId, Long categoryId);

    boolean existsByUserIdAndCategoryId(Long userId, Long categoryId);

    List<CategorySubscription> findByCategoryIdAndConfirmedTrue(Long categoryId);

    Optional<CategorySubscription> findByConfirmationToken(String token);
}
