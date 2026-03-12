package com.amalitech.communityboard.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategorySubscriptionResponse {
    private Long id;
    private Long categoryId;
    private String categoryName;
    /** False until user clicks the confirmation link in the email. */
    private boolean confirmed;
}
