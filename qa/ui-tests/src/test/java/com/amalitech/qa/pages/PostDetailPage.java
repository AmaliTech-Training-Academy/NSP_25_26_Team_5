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

    // Post detail — h1 inside article
    private static final By POST_TITLE = By.cssSelector("article h1");
    private static final By CATEGORY   = By.cssSelector("article button[disabled]");

    // Comments — section[aria-label='Comments'] from CommentsSection.tsx
    private static final By COMMENT_INPUT   = By.cssSelector("textarea[placeholder='Share your thoughts...']");
    private static final By ADD_COMMENT_BTN = By.cssSelector("section[aria-label='Comments'] button[type='submit']");
    private static final By COMMENT_BODIES  = By.cssSelector("[class*='commentBody']");
    private static final By COMMENT_AUTHORS = By.cssSelector("[class*='commentAuthor']");

    // Edit comment inline — textarea inside the edit form
    private static final By EDIT_TEXTAREA   = By.cssSelector("section[aria-label='Comments'] form textarea");
    private static final By SAVE_BTN        = By.xpath("//button[normalize-space()='Save Changes']");

    public PostDetailPage(WebDriver driver, WebDriverWait wait) {
        this.driver = driver;
        this.wait = wait;
        wait.until(ExpectedConditions.visibilityOfElementLocated(POST_TITLE));
    }

    public String getPostTitle()    { return driver.findElement(POST_TITLE).getText().trim(); }
    public String getCategoryBadge(){ return driver.findElement(CATEGORY).getText().trim(); }

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
        WebElement f = wait.until(ExpectedConditions.visibilityOfElementLocated(EDIT_TEXTAREA));
        f.clear();
        f.sendKeys(newText);
        wait.until(ExpectedConditions.elementToBeClickable(SAVE_BTN)).click();
    }

    // aria-label="Delete comment by {authorName}" — from CommentsSection.tsx
    public DeleteModal clickDeleteComment(String authorName) {
        By btn = By.cssSelector("button[aria-label='Delete comment by " + authorName + "']");
        wait.until(ExpectedConditions.elementToBeClickable(btn)).click();
        return new DeleteModal(driver, wait);
    }

    // Get the first comment author name to use in edit/delete aria-labels
    public String getFirstCommentAuthor() {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(COMMENT_AUTHORS)).getText().trim();
    }

    public boolean isCommentVisible(String text) {
        return driver.findElements(COMMENT_BODIES).stream().anyMatch(e -> e.getText().contains(text));
    }

    public boolean hasCommentInput() { return !driver.findElements(COMMENT_INPUT).isEmpty(); }
    public int commentCount()        { return driver.findElements(COMMENT_BODIES).size(); }
}