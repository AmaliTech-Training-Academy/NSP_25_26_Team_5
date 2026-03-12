package com.amalitech.communityboard.controller;

import com.amalitech.communityboard.dto.CategorySubscriptionResponse;
import com.amalitech.communityboard.model.CategorySubscription;
import com.amalitech.communityboard.model.User;
import com.amalitech.communityboard.service.CategorySubscriptionService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategorySubscriptionController {

    private final CategorySubscriptionService subscriptionService;

    @PostMapping("/{categoryId}/subscribe")
    @Operation(summary = "Subscribe to email notifications for this category")
    public ResponseEntity<CategorySubscriptionResponse> subscribe(
            @AuthenticationPrincipal User user,
            @PathVariable Long categoryId) {
        CategorySubscription sub = subscriptionService.subscribe(user, categoryId);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(sub));
    }

    @DeleteMapping("/{categoryId}/subscribe")
    @Operation(summary = "Unsubscribe from email notifications for this category")
    public ResponseEntity<Void> unsubscribe(
            @AuthenticationPrincipal User user,
            @PathVariable Long categoryId) {
        subscriptionService.unsubscribe(user, categoryId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{categoryId}/subscribed")
    @Operation(summary = "Check if current user is subscribed to this category")
    public ResponseEntity<Boolean> isSubscribed(
            @AuthenticationPrincipal User user,
            @PathVariable Long categoryId) {
        return ResponseEntity.ok(subscriptionService.isSubscribed(user, categoryId));
    }

    @GetMapping("/subscriptions/me")
    @Operation(summary = "List categories the current user is subscribed to")
    public ResponseEntity<List<CategorySubscriptionResponse>> mySubscriptions(@AuthenticationPrincipal User user) {
        List<CategorySubscriptionResponse> list = subscriptionService.findByUser(user).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    private CategorySubscriptionResponse toResponse(CategorySubscription sub) {
        return CategorySubscriptionResponse.builder()
                .id(sub.getId())
                .categoryId(sub.getCategory().getId())
                .categoryName(sub.getCategory().getName())
                .build();
    }
}
