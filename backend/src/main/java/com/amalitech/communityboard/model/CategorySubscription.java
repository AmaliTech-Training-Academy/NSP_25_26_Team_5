package com.amalitech.communityboard.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "category_subscriptions", uniqueConstraints = {
    @UniqueConstraint(columnNames = { "user_id", "category_id" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategorySubscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    /** SNS subscription ARN (legacy; unused when using app confirmation flow). */
    @Column(name = "sns_subscription_arn", length = 512)
    private String snsSubscriptionArn;

    /** True after user clicked the confirmation link in our email. */
    @Column(name = "confirmed", nullable = false)
    @Builder.Default
    private boolean confirmed = false;

    @Column(name = "confirmation_token", length = 64)
    private String confirmationToken;

    @Column(name = "confirmation_expires_at")
    private java.time.LocalDateTime confirmationExpiresAt;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
