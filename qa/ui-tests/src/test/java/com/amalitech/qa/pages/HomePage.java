package com.amalitech.qa.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.util.List;

public class HomePage {

    private final WebDriver driver;
    private final WebDriverWait wait;

    private static final By CREATE_BTN   = By.cssSelector("button[aria-label='Create post']");
    private static final By YOUR_POSTS   = By.cssSelector("button[aria-pressed]");
    private static final By POST_LIST    = By.cssSelector("ul[aria-label='Posts']");
    private static final By POST_CARDS   = By.cssSelector("ul[aria-label='Posts'] article");
    private static final By SEARCH_INPUT = By.cssSelector("section[aria-label='Post controls'] input");

    public HomePage(WebDriver driver, WebDriverWait wait) {
        this.driver = driver;
        this.wait = wait;
        wait.until(ExpectedConditions.visibilityOfElementLocated(POST_LIST));
    }

    public void searchFor(String keyword) {
        WebElement input = wait.until(ExpectedConditions.visibilityOfElementLocated(SEARCH_INPUT));
        input.clear();
        input.sendKeys(keyword);
        input.submit();
    }

    public void clickFilterPill(String label) {
        By pill = By.xpath("//button[normalize-space()='" + label + "']");
        wait.until(ExpectedConditions.elementToBeClickable(pill)).click();
    }

    public CreatePostModal clickCreatePost() {
        wait.until(ExpectedConditions.elementToBeClickable(CREATE_BTN)).click();
        return new CreatePostModal(driver, wait);
    }

    // aria-label="Edit {post.title}" — from PostCard.tsx
    public CreatePostModal clickEditOnPost(String title) {
        By btn = By.cssSelector("button[aria-label='Edit " + title + "']");
        wait.until(ExpectedConditions.elementToBeClickable(btn)).click();
        return new CreatePostModal(driver, wait);
    }

    // aria-label="Delete {post.title}" — from PostCard.tsx
    public DeleteModal clickDeleteOnPost(String title) {
        By btn = By.cssSelector("button[aria-label='Delete " + title + "']");
        wait.until(ExpectedConditions.elementToBeClickable(btn)).click();
        return new DeleteModal(driver, wait);
    }

    public void toggleYourPosts() {
        wait.until(ExpectedConditions.elementToBeClickable(YOUR_POSTS)).click();
    }

    public PostDetailPage clickPost(String title) {
        By link = By.xpath("//h2[normalize-space()='" + title + "']/ancestor::a");
        wait.until(ExpectedConditions.elementToBeClickable(link)).click();
        return new PostDetailPage(driver, wait);
    }

    public PostDetailPage clickFirstPost() {
        List<WebElement> links = wait.until(ExpectedConditions.presenceOfAllElementsLocatedBy(
                By.cssSelector("ul[aria-label='Posts'] a")));
        links.get(0).click();
        return new PostDetailPage(driver, wait);
    }

    public boolean hasCreateButton()   { return !driver.findElements(CREATE_BTN).isEmpty(); }
    public boolean hasPosts()          { return !driver.findElements(POST_CARDS).isEmpty(); }
    public int postCount()             { return driver.findElements(POST_CARDS).size(); }

    public boolean isYourPostsActive() {
        List<WebElement> btn = driver.findElements(YOUR_POSTS);
        return !btn.isEmpty() && "true".equals(btn.get(0).getAttribute("aria-pressed"));
    }

    public boolean isPostVisible(String title) {
        return !driver.findElements(
                By.xpath("//h2[normalize-space()='" + title + "']")).isEmpty();
    }
}