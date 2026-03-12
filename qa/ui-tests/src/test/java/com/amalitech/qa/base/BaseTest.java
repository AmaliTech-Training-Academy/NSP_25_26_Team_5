package com.amalitech.qa.base;

import com.amalitech.qa.config.TestConfig;
import com.amalitech.qa.pages.LoginPage;
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
import org.openqa.selenium.support.ui.WebDriverWait;

import java.io.ByteArrayInputStream;
import java.time.Duration;

@ExtendWith(AllureJunit5.class)
public abstract class BaseTest {

    protected WebDriver driver;
    protected WebDriverWait wait;

    @BeforeEach
    void setUp() {
        WebDriverManager.chromedriver().setup();
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--headless", "--no-sandbox", "--disable-dev-shm-usage", "--window-size=1920,1080");
        driver = new ChromeDriver(options);
        wait = new WebDriverWait(driver, Duration.ofSeconds(TestConfig.WAIT));
        driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(5));
    }

    @AfterEach
    void tearDown(TestInfo info) {
        screenshot(info.getDisplayName());
        if (driver != null) driver.quit();
    }

    // Log in with the default test user
    protected void loginAsUser() {
        driver.get(TestConfig.BASE_URL + TestConfig.LOGIN);
        new LoginPage(driver, wait).login(TestConfig.EMAIL, TestConfig.PASSWORD);
    }

    // Log in with the admin account
    protected void loginAsAdmin() {
        driver.get(TestConfig.BASE_URL + TestConfig.LOGIN);
        new LoginPage(driver, wait).login(TestConfig.ADMIN_EMAIL, TestConfig.ADMIN_PASSWORD);
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