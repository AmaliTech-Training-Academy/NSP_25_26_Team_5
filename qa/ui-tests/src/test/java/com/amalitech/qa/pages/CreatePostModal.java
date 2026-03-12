package com.amalitech.qa.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.util.List;

public class CreatePostModal {

    private final WebDriver driver;
    private final WebDriverWait wait;
    private final JavascriptExecutor js;

    private static final By MODAL       = By.cssSelector("[role='dialog'][aria-modal='true']");
    private static final By TITLE       = By.cssSelector("input[placeholder='Enter a clear, descriptive title']");
    private static final By CAT_WRAPPER = By.xpath("//input[@placeholder='Select']/parent::div");
    private static final By CAT_LIST    = By.cssSelector("[role='listbox'][aria-label='Post category options']");
    private static final By BODY        = By.cssSelector("textarea[placeholder='Share the details of your post...']");
    private static final By SUBMIT      = By.cssSelector("[role='dialog'][aria-modal='true'] button[type='submit']");
    private static final By CANCEL      = By.xpath("//button[normalize-space()='Cancel']");
    private static final By ERROR       = By.cssSelector("[role='alert']");

    public CreatePostModal(WebDriver driver, WebDriverWait wait) {
        this.driver = driver;
        this.wait   = wait;
        this.js     = (JavascriptExecutor) driver;
        wait.until(ExpectedConditions.visibilityOfElementLocated(MODAL));
    }

    public CreatePostModal enterTitle(String title) {
        WebElement f = wait.until(ExpectedConditions.visibilityOfElementLocated(TITLE));
        f.clear();
        f.sendKeys(title);
        return this;
    }

    public CreatePostModal selectCategory(String label) {
        WebElement wrapper = wait.until(ExpectedConditions.presenceOfElementLocated(CAT_WRAPPER));
        js.executeScript("arguments[0].click();", wrapper);
        wait.until(ExpectedConditions.visibilityOfElementLocated(CAT_LIST));
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
        wait.until(ExpectedConditions.invisibilityOfElementLocated(MODAL));
    }

    public void fillAndSubmit(String title, String category, String body) {
        enterTitle(title).selectCategory(category).enterBody(body).submit();
        wait.until(ExpectedConditions.invisibilityOfElementLocated(MODAL));
    }

    public boolean isVisible()     { return !driver.findElements(MODAL).isEmpty(); }
    public String getSubmitLabel() { return driver.findElement(SUBMIT).getText().trim(); }
    public String getError() {
        try { return wait.until(ExpectedConditions.visibilityOfElementLocated(ERROR)).getText().trim(); }
        catch (Exception e) { return ""; }
    }
}