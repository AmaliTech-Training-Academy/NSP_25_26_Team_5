package com.amalitech.qa.admin;

import com.amalitech.qa.base.BaseTest;
import com.amalitech.qa.config.Constants;
import io.qameta.allure.*;
import org.junit.jupiter.api.*;

import java.util.Map;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

@Epic("CommunityBoard API")
@Feature("Admin Management")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class AdminTest extends BaseTest {

    @Test
    @Order(1)
    @Story("List Users")
    @Severity(SeverityLevel.CRITICAL)
    @DisplayName("TC-039 Admin can list all users")
    void admin_canListAllUsers() {
        asAdmin()
                .when()
                .get(AdminEndpoint.ADMIN_USERS)
                .then()
                .spec(success(200))
                .body("$", not(empty()));
    }

    @Test
    @Order(2)
    @Story("List Users")
    @Severity(SeverityLevel.CRITICAL)
    @DisplayName("TC-040 Non-admin cannot list users — returns 403")
    void user_cannotListUsers_returns403() {
        // BUG: Backend returns 401 instead of 403 for authenticated USER on admin endpoint
        // Root cause: SecurityConfig missing accessDeniedHandler — logged as backend bug
        // Expected: 403 Forbidden (authenticated, wrong role)
        // Actual:   401 Unauthorized (Spring falls back to authenticationEntryPoint)
        asUser()
                .when()
                .get(AdminEndpoint.ADMIN_USERS)
                .then()
                .spec(error(403));
    }

    @Test
    @Order(3)
    @Story("List Users")
    @Severity(SeverityLevel.CRITICAL)
    @DisplayName("TC-041 Guest cannot list users — returns 401")
    void guest_cannotListUsers_returns401() {
        asGuest()
                .when()
                .get(AdminEndpoint.ADMIN_USERS)
                .then()
                .spec(error(401));
    }

    @Test
    @Order(4)
    @Story("Change User Role")
    @Severity(SeverityLevel.CRITICAL)
    @DisplayName("TC-042 Admin can promote a user to ADMIN role")
    void admin_canChangeUserRole() {
        String email = "roletest." + System.currentTimeMillis() + "@test.com";

        // Register a fresh user to promote
        given()
                .baseUri(Constants.BASE_URL)
                .contentType("application/json")
                .body(Map.of("fullName", "Role Test", "email", email, "password", "Secure@123"))
                .when()
                .post(Constants.REGISTER);

        // Find the user's id from the users list
        int userId = asAdmin()
                .when()
                .get(AdminEndpoint.ADMIN_USERS)
                .then()
                .statusCode(200)
                .extract()
                .jsonPath()
                .getInt("find { it.email == '" + email + "' }.id");

        // Promote to ADMIN and verify response
        asAdmin()
                .queryParam("role", "ADMIN")
                .when()
                .put(AdminEndpoint.ADMIN_USER_ROLE, userId)
                .then()
                .spec(success(200))
                .body("role", equalTo("ADMIN"));
    }

    @Test
    @Order(5)
    @Story("Change User Role")
    @Severity(SeverityLevel.NORMAL)
    @DisplayName("TC-043 Non-admin cannot change role — returns 403")
    void user_cannotChangeRole_returns403() {
        // BUG: Same as TC-040 — backend returns 401 instead of 403
        asUser()
                .queryParam("role", "ADMIN")
                .when()
                .put(AdminEndpoint.ADMIN_USER_ROLE, 1)
                .then()
                .spec(error(403));
    }

    @Test
    @Order(6)
    @Story("Delete User")
    @Severity(SeverityLevel.CRITICAL)
    @DisplayName("TC-044 Admin can delete a user")
    void admin_canDeleteUser() {
        String email = "delete." + System.currentTimeMillis() + "@test.com";

        // Register a fresh user to delete
        given()
                .baseUri(Constants.BASE_URL)
                .contentType("application/json")
                .body(Map.of("fullName", "Delete Me", "email", email, "password", "Secure@123"))
                .when()
                .post(Constants.REGISTER);

        // Find the user's id
        int userId = asAdmin()
                .when()
                .get(AdminEndpoint.ADMIN_USERS)
                .then()
                .statusCode(200)
                .extract()
                .jsonPath()
                .getInt("find { it.email == '" + email + "' }.id");

        // Delete and accept either 200 or 204
        asAdmin()
                .when()
                .delete(AdminEndpoint.ADMIN_USER_BY_ID, userId)
                .then()
                .statusCode(anyOf(is(200), is(204)));
    }

    @Test
    @Order(7)
    @Story("Delete User")
    @Severity(SeverityLevel.NORMAL)
    @DisplayName("TC-045 Non-admin cannot delete user — returns 403")
    void user_cannotDeleteUser_returns403() {
        // BUG: Same as TC-040 — backend returns 401 instead of 403
        asUser()
                .when()
                .delete(AdminEndpoint.ADMIN_USER_BY_ID, 1)
                .then()
                .spec(error(403));
    }
}