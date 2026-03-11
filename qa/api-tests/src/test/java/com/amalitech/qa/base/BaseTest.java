package com.amalitech.qa.base;

import com.amalitech.qa.config.Constants;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.qameta.allure.restassured.AllureRestAssured;
import io.restassured.RestAssured;
import io.restassured.builder.RequestSpecBuilder;
import io.restassured.builder.ResponseSpecBuilder;
import io.restassured.http.ContentType;
import io.restassured.specification.RequestSpecification;
import io.restassured.specification.ResponseSpecification;
import org.junit.jupiter.api.BeforeAll;

import java.io.InputStream;
import java.util.List;
import java.util.Map;

import static io.restassured.RestAssured.given;

public abstract class BaseTest {

    protected static final ObjectMapper MAPPER = new ObjectMapper();

    protected static int sharedPostId;
    protected static int sharedCommentId;

    private static String adminToken;
    private static String userToken;

    private static final String DYNAMIC_USER_EMAIL    = "testuser." + System.currentTimeMillis() + "@test.com";
    private static final String DYNAMIC_USER_PASSWORD = "Secure@123";

    @BeforeAll
    static void init() {
        RestAssured.baseURI = Constants.BASE_URL;
        RestAssured.enableLoggingOfRequestAndResponseIfValidationFails();

        if (sharedPostId == 0) {
            sharedPostId = createPost(
                    "Community Cleanup This Saturday",
                    "Join us at the park at 9am. Bring gloves!",
                    Constants.CATEGORY_EVENTS
            );

            // Comments endpoint is TODO in the backend
            // Catching Throwable because REST Assured throws AssertionError (not Exception) on status mismatch
            try {
                sharedCommentId = createComment(sharedPostId, "Initial comment for edit and delete tests");
            } catch (Throwable t) {
                sharedCommentId = 0;
            }

            // Clean up shared data after all tests finish
            Runtime.getRuntime().addShutdownHook(new Thread(() -> {
                if (sharedPostId != 0) deletePost(sharedPostId);
            }));
        }
    }

    protected static String adminToken() {
        if (adminToken == null) {
            adminToken = fetchToken(Constants.ADMIN_EMAIL, Constants.ADMIN_PASSWORD);
        }
        return adminToken;
    }

    protected static String userToken() {
        if (userToken == null) {
            given()
                    .spec(guestSpec())
                    .body(Map.of(
                            "fullName", "Test User",
                            "email",    DYNAMIC_USER_EMAIL,
                            "password", DYNAMIC_USER_PASSWORD
                    ))
                    .when()
                    .post(Constants.REGISTER);

            userToken = fetchToken(DYNAMIC_USER_EMAIL, DYNAMIC_USER_PASSWORD);
        }
        return userToken;
    }

    private static String fetchToken(String email, String password) {
        return given()
                .spec(guestSpec())
                .body(Map.of("email", email, "password", password))
                .when()
                .post(Constants.LOGIN)
                .then()
                .statusCode(200)
                .extract()
                .path(Constants.FIELD_TOKEN);
    }

    protected RequestSpecification asGuest() {
        return given().spec(guestSpec());
    }

    protected RequestSpecification asUser() {
        return given().spec(authSpec(userToken()));
    }

    protected RequestSpecification asAdmin() {
        return given().spec(authSpec(adminToken()));
    }

    protected ResponseSpecification success(int status) {
        return new ResponseSpecBuilder()
                .expectStatusCode(status)
                .expectContentType(ContentType.JSON)
                .build();
    }

    protected ResponseSpecification error(int status) {
        return new ResponseSpecBuilder()
                .expectStatusCode(status)
                .build();
    }

    protected static int createPost(String title, String body, String category) {
        return given()
                .spec(authSpec(adminToken()))
                .body(Map.of("title", title, "body", body, "category", category))
                .when()
                .post(Constants.POSTS)
                .then()
                .statusCode(200)
                .extract()
                .path(Constants.FIELD_POST_ID);
    }

    protected static int createComment(int postId, String body) {
        return given()
                .spec(authSpec(userToken()))
                .body(Map.of("body", body))
                .when()
                .post(Constants.COMMENTS, postId)
                .then()
                .statusCode(201)
                .extract()
                .path(Constants.FIELD_COMMENT_ID);
    }

    protected static void deletePost(int postId) {
        given()
                .spec(authSpec(adminToken()))
                .when()
                .delete(Constants.POST_BY_ID, postId);
    }

    protected static List<Map<String, Object>> loadTestData(String path) {
        try {
            InputStream stream = BaseTest.class.getClassLoader().getResourceAsStream(path);
            if (stream == null) throw new IllegalArgumentException("File not found: " + path);
            return MAPPER.readValue(stream, new TypeReference<>() {});
        } catch (Exception e) {
            throw new RuntimeException("Failed to load test data: " + path, e);
        }
    }

    private static RequestSpecification guestSpec() {
        return new RequestSpecBuilder()
                .setBaseUri(Constants.BASE_URL)
                .setContentType(ContentType.JSON)
                .addFilter(new AllureRestAssured())
                .build();
    }

    private static RequestSpecification authSpec(String token) {
        return new RequestSpecBuilder()
                .addRequestSpecification(guestSpec())
                .addHeader("Authorization", "Bearer " + token)
                .build();
    }
}