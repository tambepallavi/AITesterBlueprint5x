package com.example.saucedemo.pages;

import java.time.Duration;
import java.util.function.Supplier;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

public class LoginPage {
    private static final String ERROR_XPATH = "//h3[@data-test='error']";
    private final WebDriverWait wait;

    @FindBy(xpath = "//input[@data-test='username']")
    private WebElement usernameInput;

    @FindBy(xpath = "//input[@data-test='password']")
    private WebElement passwordInput;

    @FindBy(xpath = "//input[@data-test='login-button']")
    private WebElement loginButton;

    public LoginPage(WebDriver driver) {
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(15));
        PageFactory.initElements(driver, this);
    }

    public void login(String username, String password) {
        execute("log in with the supplied credentials", () -> {
            wait.until(ExpectedConditions.visibilityOf(usernameInput)).sendKeys(username);
            wait.until(ExpectedConditions.visibilityOf(passwordInput)).sendKeys(password);
            wait.until(ExpectedConditions.elementToBeClickable(loginButton)).click();
            return null;
        });
    }

    public String getErrorMessage() {
        return execute(
                "read the login error message",
                () -> wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath(ERROR_XPATH))).getText().trim());
    }

    public boolean isInventoryPageDisplayed() {
        return execute(
                "verify the inventory page is displayed",
                () -> wait.until(ExpectedConditions.visibilityOfElementLocated(
                        By.xpath("//span[@data-test='title' and normalize-space(.)='Products']"))).isDisplayed());
    }

    private <T> T execute(String action, Supplier<T> operation) {
        try {
            return operation.get();
        } catch (WebDriverException exception) {
            throw new IllegalStateException("Unable to " + action + ".", exception);
        }
    }
}
