package com.amalitech.communityboard.controller;

import com.amalitech.communityboard.dto.AnalyticsResponse;
import com.amalitech.communityboard.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// Analytics Controller: endpoints for the Community Board analytics dashboard.
@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @Operation(summary = "Get full Analytics Dashboard stats")
    @GetMapping("/dashboard")
    public ResponseEntity<AnalyticsResponse> getDashboardData() {
        return ResponseEntity.ok(analyticsService.getDashboardAnalytics());
    }
}
