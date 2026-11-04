package com.example.saucedemo.tests;

import com.example.saucedemo.pages.CartPage;
import com.example.saucedemo.pages.LoginPage;
import com.example.saucedemo.pages.ProductsPage;
import io.qameta.allure.Description;
import io.qameta.allure.Feature;
import io.qameta.allure.Story;
import java.time.Duration;
import java.util.List;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.testng.Assert;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.BeforeTest;
import org.testng.annotations.Test;

@Feature("SauceDemo shopping")
public class SauceDemoTests {
    private static final String DEFAULT_BASE_URL = "https://www.saucedemo.com/";
    private static final String VALID_USERNAME = "standard_user";
    private static final String VALID_PASSWORD = "secret_sauce";
    private static final String EXPECTED_PRODUCT = "Sauce Labs Backpack";
    private String baseUrl;
    private WebDriver driver;
    private LoginPage loginPage;

    @BeforeTest
    public void configureTest() {
        baseUrl = System.getProperty("baseUrl", DEFAULT_BASE_URL);
        if (baseUrl.isBlank()) {
            throw new IllegalArgumentException("The SauceDemo base URL must not be blank.");
        }
    }

    @BeforeMethod
    public void setUp() {
        try {
            ChromeOptions options = new ChromeOptions();
            options.addArguments("--window-size=1440,1000");
            if (Boolean.parseBoolean(System.getProperty("headless", "false"))) {
                options.addArguments("--headless=new");
            }
            driver = new ChromeDriver(options);
            driver.manage().timeouts().implicitlyWait(Duration.ZERO);
            driver.get(baseUrl);
            loginPage = new LoginPage(driver);
        } catch (WebDriverException exception) {
            throw new IllegalStateException("Unable to start Chrome and open SauceDemo.", exception);
        }
    }

    @Test
    @Story("Valid login")
    @Description("Logs in using the SauceDemo standard account and verifies the Products page.")
    public void validLoginDisplaysProducts() {
        loginPage.login(VALID_USERNAME, VALID_PASSWORD);
        Assert.assertTrue(loginPage.isInventoryPageDisplayed(), "A successful login should display Products.");
    }

    @Test
    @Story("Invalid login")
    @Description("Rejects invalid credentials and displays the login error.")
    public void invalidLoginDisplaysError() {
        loginPage.login("invalid_user", "invalid_password");
        Assert.assertEquals(
                loginPage.getErrorMessage(),
                "Epic sadface: Username and password do not match any user in this service");
    }

    @Test
    @Story("Add product to cart")
    @Description("Adds the backpack to the cart and verifies the cart badge count.")
    public void addProductToCartUpdatesBadge() {
        loginPage.login(VALID_USERNAME, VALID_PASSWORD);
        ProductsPage productsPage = new ProductsPage(driver);
        Assert.assertEquals(productsPage.addBackpackToCart(), "1");
    }

    @Test
    @Story("View cart")
    @Description("Adds the backpack, opens the cart, and verifies the cart title and item.")
    public void viewCartShowsAddedProduct() {
        loginPage.login(VALID_USERNAME, VALID_PASSWORD);
        ProductsPage productsPage = new ProductsPage(driver);
        productsPage.addBackpackToCart();
        productsPage.openCart();

        CartPage cartPage = new CartPage(driver);
        Assert.assertEquals(cartPage.getTitle(), "Your Cart");
        List<String> itemNames = cartPage.getItemNames();
        Assert.assertEquals(itemNames, List.of(EXPECTED_PRODUCT));
    }

    @AfterMethod(alwaysRun = true)
    public void tearDown() {
        if (driver != null) {
            try {
                driver.quit();
            } catch (WebDriverException exception) {
                throw new IllegalStateException("Unable to close the Chrome browser.", exception);
            } finally {
                driver = null;
            }
        }
    }
}
