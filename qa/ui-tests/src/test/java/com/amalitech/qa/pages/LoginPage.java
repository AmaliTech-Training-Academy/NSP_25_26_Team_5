package com.amalitech.qa.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

public class LoginPage {

    private final WebDriver driver;
    private final WebDriverWait wait;

    private static final By EMAIL    = By.cssSelector("input[type='email']");
    private static final By PASSWORD = By.cssSelector("input[type='password']");
    private static final By SUBMIT   = By.cssSelector("button[type='submit']");
    private static final By ERROR    = By.cssSelector("[role='alert']");
    private static final By REG_LINK = By.cssSelector("a[href*='register']");

    public LoginPage(WebDriver driver, WebDriverWait wait) {
        this.driver = driver;
        this.wait = wait;
    }

    public void login(String email, String password) {
        wait.until(ExpectedConditions.visibilityOfElementLocated(EMAIL)).sendKeys(email);
        driver.findElement(PASSWORD).sendKeys(password);
        driver.findElement(SUBMIT).click();
    }

    public void clickRegisterLink() {
        wait.until(ExpectedConditions.elementToBeClickable(REG_LINK)).click();
    }

    public boolean hasEmailField()    { return !driver.findElements(EMAIL).isEmpty(); }
    public boolean hasPasswordField() { return !driver.findElements(PASSWORD).isEmpty(); }
    public boolean hasSubmitButton()  { return !driver.findElements(SUBMIT).isEmpty(); }

    public String getError() {
        try { return wait.until(ExpectedConditions.visibilityOfElementLocated(ERROR)).getText().trim(); }
        catch (Exception e) { return ""; }
    }
}