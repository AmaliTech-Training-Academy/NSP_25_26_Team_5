package com.amalitech.qa.tests;

import com.amalitech.qa.base.BaseTest;
import com.amalitech.qa.config.TestConfig;
import com.amalitech.qa.pages.LoginPage;
import com.amalitech.qa.pages.RegisterPage;
import io.qameta.allure.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;
import org.openqa.selenium.support.ui.ExpectedConditions;

import static org.junit.jupiter.api.Assertions.*;

@Epic("Authentication")
class AuthTest extends BaseTest {

    // ── Login ──────────────────────────────────────────────────────────────

    @Test
    @Feature("Login")
    @Severity(SeverityLevel.NORMAL)
    @DisplayName("Login page renders all required fields")
    void loginPage_rendersAllFields() {
        goTo(TestConfig.LOGIN);
        LoginPage page = new LoginPage(driver, wait);

        assertTrue(page.hasEmailField(),    "email input missing");
        assertTrue(page.hasPasswordField(), "password input missing");
        assertTrue(page.hasSubmitButton(),  "submit button missing");
    }

    @Test
    @Feature("Login")
    @Severity(SeverityLevel.BLOCKER)
    @DisplayName("Valid credentials redirect away from /login")
    void login_validCredentials_redirects() {
        goTo(TestConfig.LOGIN);
        new LoginPage(driver, wait).login(TestConfig.ADMIN_EMAIL, TestConfig.ADMIN_PASSWORD);

        // Wait for the SPA redirect — without this the assertion races against React Router
        wait.until(ExpectedConditions.not(ExpectedConditions.urlContains("/login")));
        assertFalse(driver.getCurrentUrl().contains("/login"));
    }

    @ParameterizedTest(name = "[{2}]")
    @MethodSource("com.amalitech.qa.data.TestData#invalidLogins")
    @Feature("Login")
    @Severity(SeverityLevel.CRITICAL)
    @DisplayName("Invalid credentials stay on login or show an error")
    void login_invalidCredentials_fail(String email, String password, String scenario) {
        goTo(TestConfig.LOGIN);
        LoginPage page = new LoginPage(driver, wait);
        page.login(email, password);

        boolean stayedOnLogin = driver.getCurrentUrl().contains("/login");
        boolean hasError      = !page.getError().isEmpty();
        assertTrue(stayedOnLogin || hasError, "login should fail for: " + scenario);
    }

    @Test
    @Feature("Login")
    @Severity(SeverityLevel.MINOR)
    @DisplayName("Register link on login page navigates to /register")
    void loginPage_registerLink_navigates() {
        goTo(TestConfig.LOGIN);
        new LoginPage(driver, wait).clickRegisterLink();

        assertTrue(driver.getCurrentUrl().contains("/register"));
    }

    // ── Register ───────────────────────────────────────────────────────────

    @Test
    @Feature("Register")
    @Severity(SeverityLevel.NORMAL)
    @DisplayName("Register page renders all required fields")
    void registerPage_rendersAllFields() {
        goTo(TestConfig.REGISTER);
        RegisterPage page = new RegisterPage(driver, wait);

        assertTrue(page.hasNameField(),     "name input missing");
        assertTrue(page.hasEmailField(),    "email input missing");
        assertTrue(page.hasPasswordField(), "password input missing");
        assertTrue(page.hasConfirmField(),  "confirm password input missing");
        assertTrue(page.hasSubmitButton(),  "submit button missing");
    }

    @ParameterizedTest(name = "[{4}]")
    @MethodSource("com.amalitech.qa.data.TestData#invalidRegistrations")
    @Feature("Register")
    @Severity(SeverityLevel.CRITICAL)
    @DisplayName("Invalid registration inputs stay on register or show an error")
    void register_invalidInputs_fail(String name, String email,
                                     String password, String confirm, String scenario) {
        goTo(TestConfig.REGISTER);
        RegisterPage page = new RegisterPage(driver, wait);
        page.register(name, email, password, confirm);

        boolean stayedOnRegister = driver.getCurrentUrl().contains("/register");
        boolean hasError         = !page.getError().isEmpty();
        assertTrue(stayedOnRegister || hasError, "registration should fail for: " + scenario);
    }

    @ParameterizedTest(name = "valid registration")
    @MethodSource("com.amalitech.qa.data.TestData#validRegistration")
    @Feature("Register")
    @Severity(SeverityLevel.CRITICAL)
    @DisplayName("Valid registration redirects away from /register")
    void register_validData_redirects(String name, String email,
                                      String password, String confirm) {
        goTo(TestConfig.REGISTER);
        new RegisterPage(driver, wait).register(name, email, password, confirm);

        // App redirects to /login on success — assert we LEFT /register (not that we avoided /login)
        wait.until(ExpectedConditions.not(ExpectedConditions.urlContains("/register")));
        assertFalse(driver.getCurrentUrl().contains("/register"),
                "should leave /register on success. URL: " + driver.getCurrentUrl());
    }

    @Test
    @Feature("Register")
    @Severity(SeverityLevel.MINOR)
    @DisplayName("Login link on register page navigates back to /login")
    void registerPage_loginLink_navigates() {
        goTo(TestConfig.REGISTER);
        new RegisterPage(driver, wait).clickLoginLink();

        assertTrue(driver.getCurrentUrl().contains("/login"));
    }
}