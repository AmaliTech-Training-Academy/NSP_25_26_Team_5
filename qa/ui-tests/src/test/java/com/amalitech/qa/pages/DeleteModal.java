package com.amalitech.qa.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

// Matches DeletePostModal — aria-labelledby="delete-post-title" is the stable anchor
public class DeleteModal {

    private final WebDriver driver;
    private final WebDriverWait wait;

    private static final By MODAL       = By.cssSelector("[aria-labelledby='delete-post-title']");
    private static final By TITLE       = By.id("delete-post-title");
    private static final By DESCRIPTION = By.id("delete-post-description");
    private static final By CANCEL      = By.xpath("//*[@aria-labelledby='delete-post-title']//button[normalize-space()='Cancel']");
    private static final By CONFIRM     = By.xpath("//*[@aria-labelledby='delete-post-title']//button[not(normalize-space()='Cancel')]");

    public DeleteModal(WebDriver driver, WebDriverWait wait) {
        this.driver = driver;
        this.wait = wait;
        wait.until(ExpectedConditions.visibilityOfElementLocated(MODAL));
    }

    public void confirm() {
        wait.until(ExpectedConditions.elementToBeClickable(CONFIRM)).click();
    }

    public void cancel() {
        wait.until(ExpectedConditions.elementToBeClickable(CANCEL)).click();
    }

    public String getTitle()       { return driver.findElement(TITLE).getText().trim(); }
    public String getDescription() { return driver.findElement(DESCRIPTION).getText().trim(); }
    public boolean isVisible()     { return !driver.findElements(MODAL).isEmpty(); }
}