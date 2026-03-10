package com.amalitech.communityboard.service;

import com.amalitech.communityboard.dto.AnalyticsActiveDayResponse;
import com.amalitech.communityboard.dto.AnalyticsCategoryResponse;
import com.amalitech.communityboard.dto.AnalyticsContributorResponse;
import com.amalitech.communityboard.dto.AnalyticsResponse;
import com.amalitech.communityboard.model.Post;
import com.amalitech.communityboard.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final PostRepository postRepository;

    public AnalyticsResponse getDashboardAnalytics() {
        List<Post> allPosts = postRepository.findAll();

        // 1. Posts Per Category (group by category string)
        Map<String, Long> postsCountByCategory = allPosts.stream()
                .filter(post -> post.getCategory() != null && !post.getCategory().isBlank())
                .collect(Collectors.groupingBy(Post::getCategory, Collectors.counting()));

        List<AnalyticsCategoryResponse> categoryResponses = postsCountByCategory.entrySet().stream()
                .map(entry -> new AnalyticsCategoryResponse(entry.getKey(), entry.getValue()))
                .collect(Collectors.toList());

        // 2. Most Active Days
        Map<String, Long> postsByDay = allPosts.stream()
                .collect(Collectors.groupingBy(
                        post -> post.getCreatedAt().getDayOfWeek().getDisplayName(TextStyle.FULL, Locale.ENGLISH),
                        Collectors.counting()
                ));

        List<AnalyticsActiveDayResponse> activeDayResponses = postsByDay.entrySet().stream()
                .map(entry -> new AnalyticsActiveDayResponse(entry.getKey(), entry.getValue()))
                .sorted((a, b) -> b.getTotalPosts().compareTo(a.getTotalPosts()))
                .collect(Collectors.toList());

        // 3. Top 5 Contributors (group by author fullName)
        Map<String, Long> postsByAuthor = allPosts.stream()
                .filter(post -> post.getAuthor() != null)
                .collect(Collectors.groupingBy(
                        post -> post.getAuthor().getFullName(),
                        Collectors.counting()
                ));

        List<AnalyticsContributorResponse> contributorResponses = postsByAuthor.entrySet().stream()
                .map(entry -> new AnalyticsContributorResponse(entry.getKey(), entry.getValue()))
                .sorted((a, b) -> b.getTotalPosts().compareTo(a.getTotalPosts()))
                .limit(5)
                .collect(Collectors.toList());

        return AnalyticsResponse.builder()
                .postsPerCategory(categoryResponses)
                .mostActiveDays(activeDayResponses)
                .topContributors(contributorResponses)
                .build();
    }
}
