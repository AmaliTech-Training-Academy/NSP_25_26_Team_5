package com.amalitech.qa.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

// Covers both CreatePostModal and EditPostModal — identical DOM structure
public class CreatePostModal {

    private final WebDriver driver;
    private final WebDriverWait wait;

    private static final By MODAL    = By.cssSelector("[role='dialog'][aria-modal='true']");
    private static final By CLOSE    = By.cssSelector("button[aria-label*='close'][aria-label*='modal' i]");
    // Title input — stable placeholder from CreatePostModal.tsx
    private static final By TITLE    = By.cssSelector("input[placeholder='Enter a clear, descriptive title']");
    // Category is a custom listbox, NOT a <select> — click to open, click option by text
    private static final By CAT_TRIGGER = By.cssSelector("input[placeholder='Select']");
    private static final By CAT_LIST    = By.cssSelector("[role='listbox'][aria-label='Post category options']");
    // Body textarea — useId() makes id dynamic, placeholder is stable
    private static final By BODY     = By.cssSelector("textarea[placeholder='Share the details of your post...']");
    private static final By SUBMIT   = By.cssSelector("button[type='submit']");
    private static final By CANCEL   = By.cssSelector("button[type='button'][class*='cancel' i]");
    private static final By ERROR    = By.cssSelector("[role='alert']");

    public CreatePostModal(WebDriver driver, WebDriverWait wait) {
        this.driver = driver;
        this.wait = wait;
        wait.until(ExpectedConditions.visibilityOfElementLocated(MODAL));
    }

    public CreatePostModal enterTitle(String title) {
        WebElement f = wait.until(ExpectedConditions.visibilityOfElementLocated(TITLE));
        f.clear();
        f.sendKeys(title);
        return this;
    }

    public CreatePostModal selectCategory(String label) {
        // Open the dropdown
        wait.until(ExpectedConditions.elementToBeClickable(CAT_TRIGGER)).click();
        wait.until(ExpectedConditions.visibilityOfElementLocated(CAT_LIST));
        // Click the matching option by visible text
        By option = By.xpath("//*[@role='listbox']//button[normalize-space()='" + label + "']");
        wait.until(ExpectedConditions.elementToBeClickable(option)).click();
        return this;
    }

    public CreatePostModal enterBody(String body) {
        WebElement f = wait.until(ExpectedConditions.visibilityOfElementLocated(BODY));
        f.clear();
        f.sendKeys(body);
        return this;
    }

    public void submit() {
        wait.until(ExpectedConditions.elementToBeClickable(SUBMIT)).click();
    }

    public void cancel() {
        wait.until(ExpectedConditions.elementToBeClickable(CANCEL)).click();
    }

    // Fill all fields and submit in one call
    public void fillAndSubmit(String title, String category, String body) {
        enterTitle(title).selectCategory(category).enterBody(body).submit();
    }

    public boolean isVisible()      { return !driver.findElements(MODAL).isEmpty(); }
    public String getSubmitLabel()  { return driver.findElement(SUBMIT).getText().trim(); }
    public String getError() {
        try { return wait.until(ExpectedConditions.visibilityOfElementLocated(ERROR)).getText().trim(); }
        catch (Exception e) { return ""; }
    }
}