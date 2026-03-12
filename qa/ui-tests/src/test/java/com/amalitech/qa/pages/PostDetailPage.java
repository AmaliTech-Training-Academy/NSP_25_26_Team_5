package com.amalitech.qa.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

// Covers PostDetail.tsx and CommentsSection.tsx
public class PostDetailPage {

    private final WebDriver driver;
    private final WebDriverWait wait;

    // Post detail
    private static final By POST_TITLE = By.cssSelector("article h1");
    private static final By CATEGORY   = By.cssSelector("article button[disabled]");

    // Composer — uniquely identified by placeholder from CommentsSection.tsx
    private static final By COMMENT_INPUT   = By.cssSelector("textarea[placeholder='Share your thoughts...']");
    // Anchored to button text — never ambiguous with Save Changes
    private static final By ADD_COMMENT_BTN = By.xpath("//button[normalize-space()='Add comment']");

    // Comment list — <p> directly inside <li>, not nested in a form or identity block
    private static final By COMMENT_AUTHORS = By.cssSelector(
            "section[aria-label='Comments'] [class*='commentMeta'] p:first-child");
    private static final By COMMENT_BODIES  = By.cssSelector(
            "section[aria-label='Comments'] li > p");

    // Edit textarea — id always starts with "edit-comment-" from CommentsSection.tsx
    private static final By EDIT_TEXTAREA = By.cssSelector("textarea[id^='edit-comment-']");
    private static final By SAVE_BTN      = By.xpath("//button[normalize-space()='Save Changes']");

    public PostDetailPage(WebDriver driver, WebDriverWait wait) {
        this.driver = driver;
        this.wait = wait;
        // No wait in constructor — waits lazily when methods are called
    }

    public String getPostTitle() {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(POST_TITLE))
                .getText().trim();
    }

    public String getCategoryBadge() {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(CATEGORY))
                .getText().trim();
    }

    public void addComment(String text) {
        WebElement ta = wait.until(ExpectedConditions.visibilityOfElementLocated(COMMENT_INPUT));
        ta.clear();
        ta.sendKeys(text);
        wait.until(ExpectedConditions.elementToBeClickable(ADD_COMMENT_BTN)).click();
    }

    // aria-label="Edit comment by {authorName}" — from CommentsSection.tsx
    public void clickEditComment(String authorName) {
        By btn = By.cssSelector("button[aria-label='Edit comment by " + authorName + "']");
        wait.until(ExpectedConditions.elementToBeClickable(btn)).click();
    }

    public void saveEditedComment(String newText) {
        WebElement ta = wait.until(ExpectedConditions.visibilityOfElementLocated(EDIT_TEXTAREA));
        ta.clear();
        ta.sendKeys(newText);
        wait.until(ExpectedConditions.elementToBeClickable(SAVE_BTN)).click();
    }

    // aria-label="Delete comment by {authorName}" — from CommentsSection.tsx
    public DeleteModal clickDeleteComment(String authorName) {
        By btn = By.cssSelector("button[aria-label='Delete comment by " + authorName + "']");
        wait.until(ExpectedConditions.elementToBeClickable(btn)).click();
        return new DeleteModal(driver, wait);
    }

    public String getFirstCommentAuthor() {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(COMMENT_AUTHORS))
                .getText().trim();
    }

    public boolean isCommentVisible(String text) {
        return driver.findElements(COMMENT_BODIES).stream()
                .anyMatch(e -> e.getText().contains(text));
    }

    public boolean hasCommentInput() { return !driver.findElements(COMMENT_INPUT).isEmpty(); }
    public int commentCount()        { return driver.findElements(COMMENT_BODIES).size(); }
}