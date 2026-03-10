package com.amalitech.qa.base;

import com.amalitech.qa.config.ApiEndpoints;
import com.amalitech.qa.config.TestData;
import com.amalitech.qa.models.Requests;
import com.amalitech.qa.specs.Specs;
import com.amalitech.qa.utils.TokenManager;
import io.restassured.RestAssured;
import io.restassured.specification.RequestSpecification;
import org.junit.jupiter.api.BeforeAll;

import static io.restassured.RestAssured.given;

public abstract class BaseApiTest {

    // Shared post and comment ids available to every test class
    protected static int sharedPostId;
    protected static int sharedCommentId;

    @BeforeAll
    static void init() {
        // Configure RestAssured once for the whole session
        RestAssured.baseURI = ApiEndpoints.BASE_URL;
        RestAssured.enableLoggingOfRequestAndResponseIfValidationFails();

        // Seed shared post used by PostApiTest, CommentApiTest, AnalyticsApiTest
        // Only created if not already done — avoids duplicate creation across suites
        if (sharedPostId == 0) {
            sharedPostId = createSharedPost();
        }

        // Seed shared comment used by CommentApiTest
        if (sharedCommentId == 0) {
            sharedCommentId = createSharedComment(sharedPostId);
        }
    }

    // Who is making the request, expressed clearly
    protected RequestSpecification asGuest() {
        return given().spec(Specs.guestRequest());
    }

    protected RequestSpecification asUser() {
        return given().spec(Specs.authenticatedRequest(TokenManager.userToken()));
    }

    protected RequestSpecification asAdmin() {
        return given().spec(Specs.authenticatedRequest(TokenManager.adminToken()));
    }

    // Reusable data creation helpers
    protected int createPost(String title, String body, String category) {
        return asAdmin()
                .body(new Requests.PostRequest(title, body, category))
                .when()
                .post(ApiEndpoints.POSTS)
                .then()
                .spec(Specs.successResponse(200))
                .extract()
                .path(TestData.FIELD_POST_ID);
    }

    protected int createComment(int postId, String body) {
        return asUser()
                .body(new Requests.CommentRequest(body))
                .when()
                .post(ApiEndpoints.COMMENTS, postId)
                .then()
                .spec(Specs.successResponse(200))
                .extract()
                .path(TestData.FIELD_COMMENT_ID);
    }

    protected void deletePost(int postId) {
        asAdmin()
                .when()
                .delete(ApiEndpoints.POST_BY_ID, postId);
    }

    protected void deleteComment(int postId, int commentId) {
        asAdmin()
                .when()
                .delete(ApiEndpoints.COMMENT_BY_ID, postId, commentId);
    }

    // Static versions used inside @BeforeAll where 'this' is not available
    private static int createSharedPost() {
        return given()
                .spec(Specs.authenticatedRequest(TokenManager.adminToken()))
                .body(new Requests.PostRequest(
                        "Community Cleanup This Saturday",
                        "Join us at the park at 9am. Bring gloves!",
                        TestData.CATEGORY_EVENTS))
                .when()
                .post(ApiEndpoints.POSTS)
                .then()
                .spec(Specs.successResponse(200))
                .extract()
                .path(TestData.FIELD_POST_ID);
    }

    private static int createSharedComment(int postId) {
        return given()
                .spec(Specs.authenticatedRequest(TokenManager.userToken()))
                .body(new Requests.CommentRequest("This is a great initiative, count me in!"))
                .when()
                .post(ApiEndpoints.COMMENTS, postId)
                .then()
                .spec(Specs.successResponse(200))
                .extract()
                .path(TestData.FIELD_COMMENT_ID);
    }
}