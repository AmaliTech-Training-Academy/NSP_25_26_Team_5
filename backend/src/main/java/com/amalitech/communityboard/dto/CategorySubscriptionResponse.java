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
}
