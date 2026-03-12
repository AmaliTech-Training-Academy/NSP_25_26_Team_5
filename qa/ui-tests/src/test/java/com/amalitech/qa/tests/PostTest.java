package com.amalitech.qa.tests;

import com.amalitech.qa.base.BaseTest;
import com.amalitech.qa.config.TestConfig;
import com.amalitech.qa.pages.CreatePostModal;
import com.amalitech.qa.pages.DeleteModal;
import com.amalitech.qa.pages.HomePage;
import io.qameta.allure.*;
import org.junit.jupiter.api.*;

import static org.junit.jupiter.api.Assertions.*;

@Epic("Posts")
class PostTest extends BaseTest {

    // Unique title per run to avoid clashing with existing posts
    private final String title = "Automated Post " + System.currentTimeMillis();

    private HomePage home;

    @BeforeEach
    void login() {
        loginAsAdmin();
        home = new HomePage(driver, wait);
    }

    @Test
    @Feature("Create Post")
    @Severity(SeverityLevel.NORMAL)
    @DisplayName("Create post modal opens and closes on cancel")
    void createPost_openAndCancel() {
        CreatePostModal modal = home.clickCreatePost();

        assertTrue(modal.isVisible(), "modal should open");
        modal.cancel();
        assertFalse(modal.isVisible(), "modal should close on cancel");
    }

    @Test
    @Feature("Create Post")
    @Severity(SeverityLevel.BLOCKER)
    @DisplayName("Creating a post navigates to the post detail page")
    void createPost_success_navigatesToDetail() {
        home.clickCreatePost().fillAndSubmit(title, TestConfig.CAT_NEWS, "Post body for automated test.");

        assertTrue(driver.getCurrentUrl().contains("/posts/"));
    }

    @Test
    @Feature("Edit Post")
    @Severity(SeverityLevel.CRITICAL)
    @DisplayName("Edit modal submit label says Update Post")
    void editPost_modal_hasCorrectLabel() {
        // Create a post first so we can edit it
        home.clickCreatePost().fillAndSubmit(title, TestConfig.CAT_NEWS, "Body to edit.");
        goTo(TestConfig.BASE_URL + "/");
        home = new HomePage(driver, wait);

        CreatePostModal editModal = home.clickEditOnPost(title);
        assertEquals("Update Post", editModal.getSubmitLabel());
        editModal.cancel();
    }

    @Test
    @Feature("Delete Post")
    @Severity(SeverityLevel.CRITICAL)
    @DisplayName("Delete modal shows correct title and description")
    void deletePost_modal_showsConfirmation() {
        home.clickCreatePost().fillAndSubmit(title, TestConfig.CAT_NEWS, "Body to delete.");
        goTo(TestConfig.BASE_URL + "/");
        home = new HomePage(driver, wait);

        DeleteModal modal = home.clickDeleteOnPost(title);
        assertEquals("Delete Post",                                    modal.getTitle());
        assertEquals("Are you sure you want to delete this post?",     modal.getDescription());
        modal.cancel();
    }

    @Test
    @Feature("Delete Post")
    @Severity(SeverityLevel.CRITICAL)
    @DisplayName("Confirming delete removes the post from the feed")
    void deletePost_confirm_removesPost() {
        home.clickCreatePost().fillAndSubmit(title, TestConfig.CAT_NEWS, "Body to delete.");
        goTo(TestConfig.BASE_URL + "/");
        home = new HomePage(driver, wait);

        home.clickDeleteOnPost(title).confirm();

        assertFalse(home.isPostVisible(title), "post should be gone after delete");
    }
}