package com.amalitech.qa.auth;

import com.amalitech.qa.base.BaseTest;
import com.amalitech.qa.config.Constants;
import io.qameta.allure.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;

import static org.hamcrest.Matchers.*;

@Epic("CommunityBoard API")
@Feature("Authentication")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class AuthTest extends BaseTest {

    private static final String NEW_EMAIL = "jane." + System.currentTimeMillis() + "@test.com";

    @Test
    @Order(1)
    @Story("User Registration")
    @Severity(SeverityLevel.CRITICAL)
    @DisplayName("TC-001 Valid registration returns token and account data")
    void validRegistration_returnsTokenAndAccountData() {
        asGuest()
                .body(AuthPayload.register("Jane Resident", NEW_EMAIL, "Secure@123"))
                .when()
                .post(AuthEndpoint.REGISTER)
                .then()
                .spec(success(201))
                .body(Constants.FIELD_TOKEN,     notNullValue())
                .body(Constants.FIELD_EMAIL,     equalTo(NEW_EMAIL))
                .body(Constants.FIELD_FULL_NAME, equalTo("Jane Resident"))
                .body(Constants.FIELD_ROLE,      equalTo("USER"))
                .body("password",               nullValue())
                .body("passwordHash",           nullValue());
    }

    @Test
    @Order(2)
    @Story("User Registration")
    @Severity(SeverityLevel.CRITICAL)
    @DisplayName("TC-002 Duplicate email returns 409")
    void duplicateEmail_returns409() {
        asGuest()
                .body(AuthPayload.register("Jane Resident", NEW_EMAIL, "Secure@123"))
                .when()
                .post(AuthEndpoint.REGISTER)
                .then()
                .spec(error(409))
                .body(Constants.FIELD_MESSAGE, containsStringIgnoringCase("already"));
    }

    @ParameterizedTest(name = "{0}")
    @Order(3)
    @Story("User Registration")
    @Severity(SeverityLevel.NORMAL)
    @DisplayName("TC-003/004/005 Invalid registration input returns 400")
    @MethodSource("com.amalitech.qa.auth.AuthDataProvider#invalidRegistrationInputs")
    void invalidRegistrationInput_returns400(String label, String fullName, String email, String password) {
        asGuest()
                .body(AuthPayload.register(fullName, email, password))
                .when()
                .post(AuthEndpoint.REGISTER)
                .then()
                .spec(error(400));
    }

    @Test
    @Order(4)
    @Story("User Login")
    @Severity(SeverityLevel.BLOCKER)
    @DisplayName("TC-007 Valid login returns JWT with correct fields")
    void validLogin_returnsJwt() {
        asGuest()
                .body(AuthPayload.login(Constants.ADMIN_EMAIL, Constants.ADMIN_PASSWORD))
                .when()
                .post(AuthEndpoint.LOGIN)
                .then()
                .spec(success(200))
                .body(Constants.FIELD_TOKEN, notNullValue())
                .body(Constants.FIELD_EMAIL, equalTo(Constants.ADMIN_EMAIL))
                .body(Constants.FIELD_ROLE,  equalTo("ADMIN"));
    }

    @ParameterizedTest(name = "{0}")
    @Order(5)
    @Story("User Login")
    @Severity(SeverityLevel.CRITICAL)
    @DisplayName("TC-008/009 Invalid credentials always return same generic error")
    @MethodSource("com.amalitech.qa.auth.AuthDataProvider#invalidLoginCredentials")
    void invalidCredentials_returnGenericError(String label, String email, String password) {
        asGuest()
                .body(AuthPayload.login(email, password))
                .when()
                .post(AuthEndpoint.LOGIN)
                .then()
                .spec(error(401))
                .body(Constants.FIELD_MESSAGE, equalTo("Invalid email or password"));
    }

    @Test
    @Order(6)
    @Story("Access Control")
    @Severity(SeverityLevel.CRITICAL)
    @DisplayName("TC-011 No token on protected endpoint returns 401")
    void noToken_onProtectedEndpoint_returns401() {
        asGuest()
                .when()
                .post(Constants.POSTS)
                .then()
                .spec(error(401));
    }

    @Test
    @Order(7)
    @Story("Access Control")
    @Severity(SeverityLevel.CRITICAL)
    @DisplayName("TC-012 USER token on admin endpoint returns 403")
    void userToken_onAdminEndpoint_returns403() {
        asUser()
                .when()
                .get(Constants.ADMIN_USERS)
                .then()
                .spec(error(403));
    }
}