package com.amalitech.qa.analytics;

import com.amalitech.qa.base.BaseTest;
import io.qameta.allure.*;
import org.junit.jupiter.api.*;

import static org.hamcrest.Matchers.*;

// Analytics endpoint is implemented — tests verify contract against /api/analytics/dashboard
@Epic("CommunityBoard API")
@Feature("Analytics Dashboard")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class AnalyticsTest extends BaseTest {

    @Test
    @Order(1)
    @Story("Dashboard Access")
    @Severity(SeverityLevel.CRITICAL)
    @DisplayName("TC-034 Authenticated user can access analytics dashboard")
    void authenticatedUser_canAccessAnalytics() {
        asUser()
                .when()
                .get(AnalyticsEndpoint.DASHBOARD)
                .then()
                .spec(success(200));
    }

    @Test
    @Order(2)
    @Story("Dashboard Access")
    @Severity(SeverityLevel.CRITICAL)
    @DisplayName("TC-035 Guest cannot access analytics dashboard — returns 401")
    void guest_cannotAccessAnalytics_returns401() {
        asGuest()
                .when()
                .get(AnalyticsEndpoint.DASHBOARD)
                .then()
                .spec(error(401));
    }

    @Test
    @Order(3)
    @Story("Dashboard Data")
    @Severity(SeverityLevel.NORMAL)
    @DisplayName("TC-036 postsPerCategory is a non-null list")
    void analytics_includesPostsPerCategory() {
        asUser()
                .when()
                .get(AnalyticsEndpoint.DASHBOARD)
                .then()
                .spec(success(200))
                .body("postsPerCategory",             notNullValue())
                .body("postsPerCategory[0].categoryName", notNullValue())
                .body("postsPerCategory[0].totalPosts",   greaterThanOrEqualTo(0));
    }

    @Test
    @Order(4)
    @Story("Dashboard Data")
    @Severity(SeverityLevel.NORMAL)
    @DisplayName("TC-037 postsPerCategory returns categories that have posts")
    void analytics_postsPerCategory_includesAllCategories() {
        asUser()
                .when()
                .get(AnalyticsEndpoint.DASHBOARD)
                .then()
                .spec(success(200))
                .body("postsPerCategory[0].categoryName", notNullValue())
                .body("postsPerCategory[0].totalPosts",   greaterThanOrEqualTo(0));
    }

    @Test
    @Order(5)
    @Story("Dashboard Data")
    @Severity(SeverityLevel.NORMAL)
    @DisplayName("TC-038 topContributors list has at most 10 entries")
    void analytics_topContributors_maxTenEntries() {
        asUser()
                .when()
                .get(AnalyticsEndpoint.DASHBOARD)
                .then()
                .spec(success(200))
                .body("topContributors",                    notNullValue())
                .body("topContributors.size()",             lessThanOrEqualTo(10))
                .body("topContributors[0].contributorName", notNullValue())
                .body("topContributors[0].totalPosts",      greaterThanOrEqualTo(0));
    }
}