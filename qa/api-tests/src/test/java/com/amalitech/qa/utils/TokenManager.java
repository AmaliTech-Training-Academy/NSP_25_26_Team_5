package com.amalitech.qa.utils;

import com.amalitech.qa.config.TestData;
import com.amalitech.qa.models.Requests;
import com.amalitech.qa.specs.Specs;

import static io.restassured.RestAssured.given;

public final class TokenManager {

    private TokenManager() {}

    private static String adminToken;
    private static String userToken;

    public static String adminToken() {
        if (adminToken == null) {
            adminToken = login(TestData.ADMIN_EMAIL, TestData.ADMIN_PASSWORD);
        }
        return adminToken;
    }

    public static String userToken() {
        if (userToken == null) {
            userToken = login(TestData.USER_EMAIL, TestData.USER_PASSWORD);
        }
        return userToken;
    }

    private static String login(String email, String password) {
        return given()
                .spec(Specs.guestRequest())
                .body(new Requests.LoginRequest(email, password))
        .when()
                .post("/api/auth/login")
        .then()
                .statusCode(200)
                .extract()
                .path(TestData.FIELD_TOKEN);
    }
}