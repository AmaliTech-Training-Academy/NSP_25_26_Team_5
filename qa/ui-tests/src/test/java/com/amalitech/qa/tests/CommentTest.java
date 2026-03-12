package com.amalitech.qa.tests;

import com.amalitech.qa.base.BaseTest;
import com.amalitech.qa.config.TestConfig;
import com.amalitech.qa.data.TestData;
import io.qameta.allure.*;
import org.junit.jupiter.api.*;

import static org.junit.jupiter.api.Assertions.*;

@Epic("Comments")
class CommentTest extends BaseTest {

    // BaseTest.setUp() calls prepare() — login, create post, postDetail all ready before each test
    @Override
    protected void prepare() {
        loginAndPreparePost(
                "Comment Test " + System.currentTimeMillis(),
                TestConfig.CAT_NEWS,
                "Post for comment tests."
        );
    }

    @Test
    @Feature("Add Comment")
    @Severity(SeverityLevel.BLOCKER)
    @DisplayName("Comment input is visible when logged in")
    void commentInput_visibleWhenLoggedIn() {
        assertTrue(postDetail.hasCommentInput());
    }

    @Test
    @Feature("Add Comment")
    @Severity(SeverityLevel.BLOCKER)
    @DisplayName("Adding a comment shows it in the list")
    void addComment_appearsInList() {
        postDetail.addComment(TestData.COMMENT);

        assertTrue(postDetail.isCommentVisible(TestData.COMMENT));
    }

    @Test
    @Feature("Edit Comment")
    @Severity(SeverityLevel.CRITICAL)
    @DisplayName("Editing a comment updates its text")
    void editComment_updatesText() {
        postDetail.addComment(TestData.COMMENT);
        String author = postDetail.getFirstCommentAuthor();
        postDetail.clickEditComment(author);
        postDetail.saveEditedComment(TestData.COMMENT_UPDATED);

        assertTrue(postDetail.isCommentVisible(TestData.COMMENT_UPDATED));
    }

    @Test
    @Feature("Delete Comment")
    @Severity(SeverityLevel.CRITICAL)
    @DisplayName("Deleting a comment removes it from the list")
    void deleteComment_removesFromList() {
        postDetail.addComment(TestData.COMMENT);
        int before = postDetail.commentCount();
        String author = postDetail.getFirstCommentAuthor();
        postDetail.clickDeleteComment(author).confirm();

        assertTrue(postDetail.commentCount() < before);
    }
}