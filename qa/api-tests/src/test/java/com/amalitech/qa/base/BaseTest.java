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

    // Shared post/comment IDs reused across test classes to avoid repeated setup
    protected static int sharedPostId;
    protected static int sharedCommentId;

    // Cached tokens — reset each test class run to prevent stale tokens after Docker restart
    private static String adminToken;
    private static String userToken;

    // Dynamic user created once per JVM session — timestamp prevents duplicate email conflicts
    private static final String DYNAMIC_USER_EMAIL    = "testuser." + System.currentTimeMillis() + "@test.com";
    private static final String DYNAMIC_USER_PASSWORD = "Secure@123";

    @BeforeAll
    static void init() {
        RestAssured.baseURI = Constants.BASE_URL;
        RestAssured.enableLoggingOfRequestAndResponseIfValidationFails();

        // Reset tokens on each test class — prevents stale tokens after Docker restart
        adminToken = null;
        userToken  = null;

        // Create shared post once for the whole suite — reused by post/comment tests
        if (sharedPostId == 0) {
            sharedPostId = createPost(
                    "Community Cleanup This Saturday",
                    "Join us at the park at 9am. Bring gloves!",
                    Constants.CATEGORY_EVENT
            );

            // Comments endpoint may not be implemented yet — skip gracefully if so
            try {
                sharedCommentId = createComment(sharedPostId, "Initial comment for edit and delete tests");
            } catch (Throwable t) {
                sharedCommentId = 0;
            }

            // Clean up shared post after all tests finish
            Runtime.getRuntime().addShutdownHook(new Thread(() -> {
                if (sharedPostId != 0) deletePost(sharedPostId);
            }));
        }
    }

    // Lazy admin token — fetched once then cached per test class run
    protected static String adminToken() {
        if (adminToken == null) {
            adminToken = fetchToken(Constants.ADMIN_EMAIL, Constants.ADMIN_PASSWORD);
        }
        return adminToken;
    }

    // Lazy user token — registers a fresh dynamic user then caches the token
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

    // --- Request builders ---

    protected RequestSpecification asGuest() {
        return given().spec(guestSpec());
    }

    protected RequestSpecification asUser() {
        return given().spec(authSpec(userToken()));
    }

    protected RequestSpecification asAdmin() {
        return given().spec(authSpec(adminToken()));
    }

    // --- Response spec helpers ---

    // Expects success status + JSON content type
    protected ResponseSpecification success(int status) {
        return new ResponseSpecBuilder()
                .expectStatusCode(status)
                .expectContentType(ContentType.JSON)
                .build();
    }

    // Expects error status only — no content type assertion (error bodies vary)
    protected ResponseSpecification error(int status) {
        return new ResponseSpecBuilder()
                .expectStatusCode(status)
                .build();
    }

    // --- Shared data helpers ---

    protected static int createPost(String title, String body, int categoryId) {
        return given()
                .spec(authSpec(adminToken()))
                .body(Map.of("title", title, "body", body, "categoryId", categoryId))
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

    // --- Test data loader ---

    // Reads JSON test data files from src/test/resources
    protected static List<Map<String, Object>> loadTestData(String path) {
        try {
            InputStream stream = BaseTest.class.getClassLoader().getResourceAsStream(path);
            if (stream == null) throw new IllegalArgumentException("File not found: " + path);
            return MAPPER.readValue(stream, new TypeReference<>() {});
        } catch (Exception e) {
            throw new RuntimeException("Failed to load test data: " + path, e);
        }
    }

    // --- Spec builders (private) ---

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