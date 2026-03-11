package com.amalitech.qa.analytics;

import com.amalitech.qa.base.BaseTest;
import com.amalitech.qa.config.Constants;
import io.qameta.allure.*;
import org.junit.jupiter.api.*;

import static org.hamcrest.Matchers.*;

// Analytics is TODO in the backend — these tests will fail until Peace implements the endpoint
// Failing tests here track implementation progress, that is intentional
@Epic("CommunityBoard API")
@Feature("Analytics Dashboard")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class AnalyticsTest extends BaseTest {

    @Test
    @Order(1)
    @Story("Dashboard Access")
    @Severity(SeverityLevel.CRITICAL)
    @DisplayName("TC-034 Authenticated user can access analytics")
    void authenticatedUser_canAccessAnalytics() {
        asUser()
                .when()
                .get(AnalyticsEndpoint.ANALYTICS)
                .then()
                .spec(success(200));
    }

    @Test
    @Order(2)
    @Story("Dashboard Access")
    @Severity(SeverityLevel.CRITICAL)
    @DisplayName("TC-035 Guest cannot access analytics")
    void guest_cannotAccessAnalytics_returns401() {
        asGuest()
                .when()
                .get(AnalyticsEndpoint.ANALYTICS)
                .then()
                .spec(error(401));
    }

    @Test
    @Order(3)
    @Story("Dashboard Data")
    @Severity(SeverityLevel.NORMAL)
    @DisplayName("TC-036 Total posts count is present and valid")
    void analytics_includesTotalPostsCount() {
        asUser()
                .when()
                .get(AnalyticsEndpoint.ANALYTICS)
                .then()
                .spec(success(200))
                .body("totalPosts", greaterThanOrEqualTo(0));
    }

    @Test
    @Order(4)
    @Story("Dashboard Data")
    @Severity(SeverityLevel.NORMAL)
    @DisplayName("TC-037 Posts by category includes all 4 categories")
    void analytics_includesAllFourCategories() {
        asUser()
                .when()
                .get(AnalyticsEndpoint.ANALYTICS)
                .then()
                .spec(success(200))
                .body("postsByCategory." + Constants.CATEGORY_EVENTS,          notNullValue())
                .body("postsByCategory." + Constants.CATEGORY_LOST_AND_FOUND,  notNullValue())
                .body("postsByCategory." + Constants.CATEGORY_RECOMMENDATIONS, notNullValue())
                .body("postsByCategory." + Constants.CATEGORY_HELP_REQUESTS,   notNullValue());
    }

    @Test
    @Order(5)
    @Story("Dashboard Data")
    @Severity(SeverityLevel.NORMAL)
    @DisplayName("TC-038 Top contributors list has at most 10 entries")
    void analytics_topContributors_maxTenEntries() {
        asUser()
                .when()
                .get(AnalyticsEndpoint.ANALYTICS)
                .then()
                .spec(success(200))
                .body("topContributors",              notNullValue())
                .body("topContributors.size()",       lessThanOrEqualTo(10))
                .body("topContributors[0].postCount", notNullValue());
    }
}