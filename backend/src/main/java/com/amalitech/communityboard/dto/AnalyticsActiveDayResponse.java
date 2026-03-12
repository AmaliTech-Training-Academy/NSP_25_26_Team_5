package com.amalitech.communityboard.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class AnalyticsActiveDayResponse {
    private String dayOfWeek;
    private Long totalPosts;
}
