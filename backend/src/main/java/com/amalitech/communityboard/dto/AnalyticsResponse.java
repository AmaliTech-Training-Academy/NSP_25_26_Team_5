package com.amalitech.communityboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalyticsResponse {

    //  New top-level fields
    private Long totalPosts;
    private Long totalComments;

    private List<AnalyticsCategoryResponse> postsPerCategory;
    private List<AnalyticsActiveDayResponse> mostActiveDays;
    private List<AnalyticsContributorResponse> topContributors;
}
