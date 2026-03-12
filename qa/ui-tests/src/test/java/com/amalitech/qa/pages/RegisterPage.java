package com.amalitech.qa.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

public class RegisterPage {

    private final WebDriver driver;
    private final WebDriverWait wait;

    private static final By NAME     = By.cssSelector("input[name='name'], input[placeholder*='name' i]");
    private static final By EMAIL    = By.cssSelector("input[type='email']");
    private static final By PASSWORD = By.cssSelector("input[name='password'], input[id='password']");
    private static final By CONFIRM  = By.cssSelector("input[name='confirmPassword'], input[placeholder*='confirm' i]");
    private static final By SUBMIT   = By.cssSelector("button[type='submit']");
    private static final By ERROR    = By.cssSelector("[role='alert']");
    private static final By LOGIN_LINK = By.cssSelector("a[href*='login']");

    public RegisterPage(WebDriver driver, WebDriverWait wait) {
        this.driver = driver;
        this.wait = wait;
    }

    public void register(String name, String email, String password, String confirm) {
        wait.until(ExpectedConditions.visibilityOfElementLocated(NAME)).sendKeys(name);
        driver.findElement(EMAIL).sendKeys(email);
        driver.findElement(PASSWORD).sendKeys(password);
        driver.findElement(CONFIRM).sendKeys(confirm);
        driver.findElement(SUBMIT).click();
    }

    public void clickLoginLink() {
        wait.until(ExpectedConditions.elementToBeClickable(LOGIN_LINK)).click();
    }

    public boolean hasNameField()     { return !driver.findElements(NAME).isEmpty(); }
    public boolean hasEmailField()    { return !driver.findElements(EMAIL).isEmpty(); }
    public boolean hasPasswordField() { return !driver.findElements(PASSWORD).isEmpty(); }
    public boolean hasConfirmField()  { return !driver.findElements(CONFIRM).isEmpty(); }
    public boolean hasSubmitButton()  { return !driver.findElements(SUBMIT).isEmpty(); }

    public String getError() {
        try { return wait.until(ExpectedConditions.visibilityOfElementLocated(ERROR)).getText().trim(); }
        catch (Exception e) { return ""; }
    }
}