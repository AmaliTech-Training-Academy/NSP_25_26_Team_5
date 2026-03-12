package com.amalitech.qa.base;

import com.amalitech.qa.config.TestConfig;
import com.amalitech.qa.pages.HomePage;
import com.amalitech.qa.pages.LoginPage;
import com.amalitech.qa.pages.PostDetailPage;
import io.github.bonigarcia.wdm.WebDriverManager;
import io.qameta.allure.Allure;
import io.qameta.allure.junit5.AllureJunit5;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.TestInfo;
import org.junit.jupiter.api.extension.ExtendWith;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.io.ByteArrayInputStream;
import java.time.Duration;

@ExtendWith(AllureJunit5.class)
public abstract class BaseTest {

    protected WebDriver driver;
    protected WebDriverWait wait;
    protected HomePage home;
    protected PostDetailPage postDetail;

    @BeforeEach
    final void setUp() {
        WebDriverManager.chromedriver().setup();
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--headless", "--no-sandbox", "--disable-dev-shm-usage", "--window-size=1920,1080");
        driver = new ChromeDriver(options);
        wait = new WebDriverWait(driver, Duration.ofSeconds(TestConfig.WAIT));
        driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(5));
        prepare();
    }

    @AfterEach
    final void tearDown(TestInfo info) {
        screenshot(info.getDisplayName());
        if (driver != null) driver.quit();
    }

    protected void prepare() {}

    /** Login and land on home. Use when no session exists yet. */
    protected void loginAndPrepareHome() {
        goTo(TestConfig.LOGIN);
        new LoginPage(driver, wait).login(TestConfig.ADMIN_EMAIL, TestConfig.ADMIN_PASSWORD);
        wait.until(ExpectedConditions.not(ExpectedConditions.urlContains(TestConfig.LOGIN)));
        home = new HomePage(driver, wait);
    }

    /**
     * Navigate to home without logging in again.
     * Use when the session is already active (e.g. after fillAndSubmit).
     */
    protected void navigateHome() {
        driver.get(TestConfig.BASE_URL);
        home = new HomePage(driver, wait);
    }

    /**
     * Login, create a post, navigate home, then open the post detail page by clicking it.
     * Does NOT rely on post-creation redirect — that navigation is not guaranteed.
     */
    protected void loginAndPreparePost(String title, String category, String body) {
        loginAndPrepareHome();
        home.clickCreatePost().fillAndSubmit(title, category, body);
        navigateHome();
        postDetail = home.clickPost(title);
    }

    protected void goTo(String path) {
        driver.get(TestConfig.BASE_URL + path);
    }

    private void screenshot(String label) {
        try {
            byte[] bytes = ((TakesScreenshot) driver).getScreenshotAs(OutputType.BYTES);
            Allure.addAttachment(label, "image/png", new ByteArrayInputStream(bytes), "png");
        } catch (Exception ignored) {}
    }
}