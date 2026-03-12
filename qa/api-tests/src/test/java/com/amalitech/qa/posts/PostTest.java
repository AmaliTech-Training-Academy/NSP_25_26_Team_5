package com.amalitech.qa.posts;

import com.amalitech.qa.base.BaseTest;
import com.amalitech.qa.config.Constants;
import io.qameta.allure.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;

import static org.hamcrest.Matchers.*;

@Epic("CommunityBoard API")
@Feature("Posts")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class PostTest extends BaseTest {

    @Test
    @Order(1)
    @Story("Create Post")
    @Severity(SeverityLevel.BLOCKER)
    @DisplayName("TC-013 Valid post creation returns post with author and id")
    void validPostCreation_returnsPostWithAuthorAndId() {
        asAdmin()
                .body(PostPayload.create("New Event Post", "Details here", Constants.CATEGORY_EVENT))
                .when()
                .post(PostEndpoint.POSTS)
                .then()
                .spec(success(200))
                .body(Constants.FIELD_POST_ID,            notNullValue())
                .body(Constants.FIELD_POST_TITLE,         equalTo("New Event Post"))
                .body(Constants.FIELD_POST_CATEGORY_NAME, notNullValue())
                .body(Constants.FIELD_POST_AUTHOR_NAME,   notNullValue())
                .body(Constants.FIELD_POST_CREATED_AT,    notNullValue())
                .body("password",                         nullValue());
    }

    @ParameterizedTest(name = "{0}")
    @Order(2)
    @Story("Create Post")
    @Severity(SeverityLevel.NORMAL)
    @DisplayName("TC-015/016 Invalid post input returns 400")
    @MethodSource("com.amalitech.qa.posts.PostDataProvider#invalidPostCreationInputs")
    void invalidPostInput_returns400(String label, String title, String body, int categoryId) {
        asAdmin()
                .body(PostPayload.create(title, body, categoryId))
                .when()
                .post(PostEndpoint.POSTS)
                .then()
                .spec(error(400));
    }

    @Test
    @Order(3)
    @Story("Create Post")
    @Severity(SeverityLevel.CRITICAL)
    @DisplayName("TC-017 Guest cannot create a post — returns 401")
    void guest_creatingPost_returns401() {
        asGuest()
                .body(PostPayload.create("Unauthorized", "body", Constants.CATEGORY_EVENT))
                .when()
                .post(PostEndpoint.POSTS)
                .then()
                .spec(error(401));
    }

    @Test
    @Order(4)
    @Story("View Posts")
    @Severity(SeverityLevel.CRITICAL)
    @DisplayName("TC-018 Posts list is paginated at 10 per page")
    void postsList_isPaginated_maxTenPerPage() {
        asGuest()
                .queryParam("page", 0)
                .queryParam("size", 10)
                .when()
                .get(PostEndpoint.POSTS)
                .then()
                .spec(success(200))
                .body(Constants.FIELD_PAGE_CONTENT,             notNullValue())
                .body(Constants.FIELD_PAGE_CONTENT + ".size()", lessThanOrEqualTo(10));
    }

    @ParameterizedTest(name = "search ''{0}'' finds posts case-insensitively")
    @Order(5)
    @Story("Search Posts")
    @Severity(SeverityLevel.NORMAL)
    @DisplayName("TC-019 Keyword search is case-insensitive")
    @MethodSource("com.amalitech.qa.posts.PostDataProvider#searchKeywords")
    void keywordSearch_isCaseInsensitive(String keyword) {
        asGuest()
                .queryParam("keyword", keyword)
                .when()
                .get(PostEndpoint.POSTS_SEARCH)
                .then()
                .spec(success(200))
                .body(Constants.FIELD_PAGE_CONTENT + ".size()", greaterThan(0));
    }

    @Test
    @Order(6)
    @Story("Search Posts")
    @Severity(SeverityLevel.NORMAL)
    @DisplayName("TC-020 Search with no match returns empty list")
    void searchWithNoMatch_returnsEmptyList() {
        asGuest()
                .queryParam("keyword", "xyzq99notexist99zzzz")
                .when()
                .get(PostEndpoint.POSTS_SEARCH)
                .then()
                .spec(success(200))
                .body(Constants.FIELD_PAGE_CONTENT, empty());
    }

    @Test
    @Order(7)
    @Story("Edit Post")
    @Severity(SeverityLevel.CRITICAL)
    @DisplayName("TC-023 Author can edit own post")
    void authorEditsOwnPost_returnsUpdatedPost() {
        int postId = createPost("Original title", "Original body", Constants.CATEGORY_EVENT);

        asAdmin()
                .body(PostPayload.create("Updated title", "Updated body", Constants.CATEGORY_EVENT))
                .when()
                .put(PostEndpoint.POST_BY_ID, postId)
                .then()
                .spec(success(200))
                .body(Constants.FIELD_POST_TITLE,      equalTo("Updated title"))
                .body(Constants.FIELD_POST_UPDATED_AT, notNullValue());

        deletePost(postId);
    }

    @Test
    @Order(8)
    @Story("Edit Post")
    @Severity(SeverityLevel.CRITICAL)
    @DisplayName("TC-024 Non-author editing a post returns 403")
    void nonAuthorEditing_returns403() {
        asUser()
                .body(PostPayload.create("Hijacked title", "Should fail", Constants.CATEGORY_EVENT))
                .when()
                .put(PostEndpoint.POST_BY_ID, sharedPostId)
                .then()
                .spec(error(403));
    }

    @Test
    @Order(9)
    @Story("Edit Post")
    @Severity(SeverityLevel.NORMAL)
    @DisplayName("TC-027 Admin editing another user's post returns 403")
    void adminEditingOthersPost_returns403() {
        int userPostId = asUser()
                .body(PostPayload.create("User owned post", "Belongs to user", Constants.CATEGORY_DISCUSSION))
                .when()
                .post(PostEndpoint.POSTS)
                .then()
                .spec(success(200))
                .extract().path(Constants.FIELD_POST_ID);

        asAdmin()
                .body(PostPayload.create("Admin hijack", "Should fail", Constants.CATEGORY_EVENT))
                .when()
                .put(PostEndpoint.POST_BY_ID, userPostId)
                .then()
                .spec(error(403));

        deletePost(userPostId);
    }

    @Test
    @Order(10)
    @Story("Delete Post")
    @Severity(SeverityLevel.NORMAL)
    @DisplayName("TC-026 Admin can delete any post")
    void adminDeletesAnyPost_succeeds() {
        int postId = asUser()
                .body(PostPayload.create("To be deleted by admin", "body", Constants.CATEGORY_EVENT))
                .when()
                .post(PostEndpoint.POSTS)
                .then()
                .spec(success(200))
                .extract().path(Constants.FIELD_POST_ID);

        asAdmin()
                .when()
                .delete(PostEndpoint.POST_BY_ID, postId)
                .then()
                .statusCode(anyOf(is(200), is(204)));
    }

    @Test
    @Order(11)
    @Story("Delete Post")
    @Severity(SeverityLevel.CRITICAL)
    @DisplayName("TC-025 Author deletes own post, post returns 404 after")
    void authorDeletesOwnPost_postIsGone() {
        int postId = createPost("Temp post", "Will be deleted", Constants.CATEGORY_EVENT);

        asAdmin()
                .when()
                .delete(PostEndpoint.POST_BY_ID, postId)
                .then()
                .statusCode(anyOf(is(200), is(204)));

        asGuest()
                .when()
                .get(PostEndpoint.POST_BY_ID, postId)
                .then()
                .spec(error(404));
    }
}