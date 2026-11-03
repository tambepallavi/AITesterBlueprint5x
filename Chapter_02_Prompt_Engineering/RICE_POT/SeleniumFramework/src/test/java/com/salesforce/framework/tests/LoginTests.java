package com.salesforce.framework.tests;

import com.salesforce.framework.pages.LoginPage;
import io.qameta.allure.Description;
import io.qameta.allure.Feature;
import io.qameta.allure.Story;
import java.time.Duration;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.testng.Assert;
import org.testng.SkipException;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

@Feature("Salesforce login")
public class LoginTests {
    private static final String LOGIN_URL = System.getenv().getOrDefault(
            "SF_LOGIN_URL", "https://login.salesforce.com/?locale=in");
    private static final String INVALID_USERNAME = "selenium.invalid@example.invalid";
    private static final String INVALID_PASSWORD = "NotARealPassword-6789";
    private static final String EXPECTED_LOGIN_ERROR =
            "Error: Please check your username and password. If you still can't log in, contact your Salesforce administrator.";

    private WebDriver driver;
    private LoginPage loginPage;

    @BeforeMethod
    public void setUp() {
        ChromeOptions options = new ChromeOptions();
        if (Boolean.parseBoolean(System.getProperty("headless", "false"))) {
            options.addArguments("--headless=new");
        }
        options.addArguments("--window-size=1440,1000");
        driver = new ChromeDriver(options);
        driver.manage().timeouts().implicitlyWait(Duration.ZERO);
    }

    @BeforeMethod(dependsOnMethods = "setUp")
    public void openLoginPage() {
        driver.get(LOGIN_URL);
        loginPage = new LoginPage(driver);
        loginPage.openUsernameLogin();
    }

    @Test
    @Story("Invalid credentials")
    @Description("Rejects a reserved invalid username and password and preserves the remember-me selection.")
    public void invalidCredentialsShowLoginError() {
        loginPage.setRememberMe(true);
        Assert.assertTrue(loginPage.isRememberMeSelected(), "Remember Me should be selectable.");
        loginPage.enterUsername(INVALID_USERNAME);
        loginPage.continueWithUsername();
        loginPage.enterPassword(INVALID_PASSWORD);
        loginPage.submitLogin();
        Assert.assertEquals(loginPage.waitForLoginError(), EXPECTED_LOGIN_ERROR);
    }

    @Test
    @Story("Valid credentials")
    @Description("Authenticates with supplied Salesforce credentials and verifies the configured success URL.")
    public void validCredentialsReachConfiguredSuccessUrl() {
        String username = System.getenv("SF_USERNAME");
        String password = System.getenv("SF_PASSWORD");
        String successUrlFragment = System.getenv("SF_SUCCESS_URL_FRAGMENT");
        if (isBlank(username) || isBlank(password) || isBlank(successUrlFragment)) {
            throw new SkipException(
                    "Set SF_USERNAME, SF_PASSWORD, and SF_SUCCESS_URL_FRAGMENT to run the valid-login test.");
        }

        loginPage.enterUsername(username);
        loginPage.continueWithUsername();
        loginPage.enterPassword(password);
        loginPage.submitLogin();

        Assert.assertTrue(
                loginPage.waitForUrlFragment(successUrlFragment),
                "Salesforce did not navigate to the configured authenticated URL.");
        Assert.assertFalse(
                loginPage.getCurrentUrl().contains("login.salesforce.com"),
                "The browser remained on the Salesforce login host.");
    }

    @AfterMethod(alwaysRun = true)
    public void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
