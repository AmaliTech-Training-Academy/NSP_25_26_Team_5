package com.amalitech.qa.user;

import com.amalitech.qa.base.BaseTest;
import io.qameta.allure.*;
import org.junit.jupiter.api.*;

import static org.hamcrest.Matchers.*;

@Epic("CommunityBoard API")
@Feature("User Profile")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class UserTest extends BaseTest {

    @Test
    @Order(1)
    @Story("View Profile")
    @Severity(SeverityLevel.CRITICAL)
    @DisplayName("TC-046 Authenticated user can view own profile")
    void authenticatedUser_canViewOwnProfile() {
        asUser()
                .when()
                .get(UserEndpoint.ME)
                .then()
                .spec(success(200))
                .body("email",    notNullValue())
                .body("fullName", notNullValue())
                .body("role",     notNullValue());
    }

    @Test
    @Order(2)
    @Story("View Profile")
    @Severity(SeverityLevel.CRITICAL)
    @DisplayName("TC-047 Guest cannot view profile — returns 401")
    void guest_cannotViewProfile_returns401() {
        asGuest()
                .when()
                .get(UserEndpoint.ME)
                .then()
                .spec(error(401));
    }
}