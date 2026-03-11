package com.amalitech.qa.comments;

import com.amalitech.qa.base.BaseTest;
import com.amalitech.qa.config.Constants;
import io.qameta.allure.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;

import static org.hamcrest.Matchers.*;

@Epic("CommunityBoard API")
@Feature("Comments")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class CommentTest extends BaseTest {

    @Test
    @Order(1)
    @Story("Add Comment")
    @Severity(SeverityLevel.BLOCKER)
    @DisplayName("TC-028 Authenticated user adds comment successfully")
    void authenticatedUser_addsComment_returnsCommentWithAuthor() {
        asUser()
                .body(CommentPayload.create("This is a great initiative, count me in!"))
                .when()
                .post(CommentEndpoint.COMMENTS, sharedPostId)
                .then()
                .spec(success(201))
                .body(Constants.FIELD_COMMENT_ID,          notNullValue())
                .body(Constants.FIELD_COMMENT_BODY,        equalTo("This is a great initiative, count me in!"))
                .body(Constants.FIELD_COMMENT_AUTHOR_NAME, notNullValue())
                .body(Constants.FIELD_COMMENT_CREATED_AT,  notNullValue());
    }

    @ParameterizedTest(name = "{0}")
    @Order(2)
    @Story("Add Comment")
    @Severity(SeverityLevel.NORMAL)
    @DisplayName("TC-029 Comment length boundary: max 500 chars")
    @MethodSource("com.amalitech.qa.comments.CommentDataProvider#commentBoundaries")
    void commentLength_boundaryValues(String label, int length, int expectedStatus) {
        asUser()
                .body(CommentPayload.create("A".repeat(length)))
                .when()
                .post(CommentEndpoint.COMMENTS, sharedPostId)
                .then()
                .statusCode(expectedStatus);
    }

    @Test
    @Order(3)
    @Story("Add Comment")
    @Severity(SeverityLevel.NORMAL)
    @DisplayName("TC-033 Empty comment body returns 400")
    void emptyCommentBody_returns400() {
        asUser()
                .body(CommentPayload.create(""))
                .when()
                .post(CommentEndpoint.COMMENTS, sharedPostId)
                .then()
                .spec(error(400));
    }

    @Test
    @Order(4)
    @Story("Add Comment")
    @Severity(SeverityLevel.CRITICAL)
    @DisplayName("TC-030 Guest cannot add a comment")
    void guest_addingComment_returns401() {
        asGuest()
                .body(CommentPayload.create("I am a guest"))
                .when()
                .post(CommentEndpoint.COMMENTS, sharedPostId)
                .then()
                .spec(error(401));
    }

    @Test
    @Order(5)
    @Story("Edit Comment")
    @Severity(SeverityLevel.NORMAL)
    @DisplayName("TC-031 Comment author can edit own comment")
    void commentAuthor_editsOwnComment_returnsUpdated() {
        asUser()
                .body(CommentPayload.create("Updated: I will bring extra supplies!"))
                .when()
                .put(CommentEndpoint.COMMENT_BY_ID, sharedPostId, sharedCommentId)
                .then()
                .spec(success(200))
                .body(Constants.FIELD_COMMENT_BODY, equalTo("Updated: I will bring extra supplies!"));
    }

    @Test
    @Order(6)
    @Story("Edit Comment")
    @Severity(SeverityLevel.NORMAL)
    @DisplayName("TC-031 Non-author editing a comment returns 403")
    void nonAuthor_editingComment_returns403() {
        asAdmin()
                .body(CommentPayload.create("Admin trying to edit someone else's comment"))
                .when()
                .put(CommentEndpoint.COMMENT_BY_ID, sharedPostId, sharedCommentId)
                .then()
                .spec(error(403));
    }

    @Test
    @Order(7)
    @Story("Delete Comment")
    @Severity(SeverityLevel.NORMAL)
    @DisplayName("TC-032 Admin can delete any comment")
    void admin_deletesAnyComment_succeeds() {
        asAdmin()
                .when()
                .delete(CommentEndpoint.COMMENT_BY_ID, sharedPostId, sharedCommentId)
                .then()
                .statusCode(anyOf(is(200), is(204)));
    }
}