package com.amalitech.communityboard.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class AnalyticsCategoryResponse {
    private String categoryName;
    private Long totalPosts;
}
