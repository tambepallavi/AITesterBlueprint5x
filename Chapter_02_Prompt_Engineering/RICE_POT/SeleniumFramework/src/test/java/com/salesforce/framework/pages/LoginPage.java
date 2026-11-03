package com.salesforce.framework.pages;

import java.time.Duration;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

public class LoginPage {
    private static final By LOGIN_BUTTON_LOCATOR = By.xpath(
            "//button[normalize-space(.)='Log In'] | //input[@type='submit' and @value='Log In']");
    private final WebDriver driver;
    private final WebDriverWait wait;

    @FindBy(xpath = "//a[normalize-space(.)='Log In with Username']")
    private WebElement usernameLoginLink;

    @FindBy(xpath = "//input[@type='text' or @type='email']")
    private WebElement usernameInput;

    @FindBy(xpath = "//input[@type='password']")
    private WebElement passwordInput;

    @FindBy(xpath = "//input[@type='checkbox']")
    private WebElement rememberMeCheckbox;

    @FindBy(xpath = "//button[normalize-space(.)='Log In'] | //input[@type='submit' and @value='Log In']")
    private WebElement loginButton;

    @FindBy(xpath = "//div[text()[contains(., 'Please check your username and password')]]")
    private WebElement loginError;

    public LoginPage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(20));
        PageFactory.initElements(driver, this);
    }

    public void openUsernameLogin() {
        wait.until(currentDriver ->
                !currentDriver.findElements(By.xpath("//a[normalize-space(.)='Log In with Username']")).isEmpty()
                        || !currentDriver.findElements(LOGIN_BUTTON_LOCATOR).isEmpty());
        if (driver.findElements(LOGIN_BUTTON_LOCATOR).isEmpty()) {
            wait.until(ExpectedConditions.elementToBeClickable(usernameLoginLink)).click();
        }
        wait.until(ExpectedConditions.visibilityOf(usernameInput));
        wait.until(ExpectedConditions.elementToBeClickable(loginButton));
    }

    public void enterUsername(String username) {
        WebElement input = wait.until(ExpectedConditions.visibilityOf(usernameInput));
        input.clear();
        input.sendKeys(username);
    }

    public void setRememberMe(boolean selected) {
        WebElement checkbox = wait.until(ExpectedConditions.visibilityOf(rememberMeCheckbox));
        if (checkbox.isSelected() != selected) {
            checkbox.click();
        }
    }

    public boolean isRememberMeSelected() {
        return wait.until(ExpectedConditions.visibilityOf(rememberMeCheckbox)).isSelected();
    }

    public void continueWithUsername() {
        wait.until(ExpectedConditions.elementToBeClickable(loginButton)).click();
        wait.until(ExpectedConditions.visibilityOf(passwordInput));
    }

    public void enterPassword(String password) {
        WebElement input = wait.until(ExpectedConditions.visibilityOf(passwordInput));
        input.clear();
        input.sendKeys(password);
    }

    public void submitLogin() {
        wait.until(ExpectedConditions.elementToBeClickable(loginButton)).click();
    }

    public String waitForLoginError() {
        return wait.until(ExpectedConditions.visibilityOf(loginError)).getText().trim();
    }

    public boolean waitForUrlFragment(String expectedFragment) {
        return wait.until(ExpectedConditions.urlContains(expectedFragment));
    }

    public String getCurrentUrl() {
        return driver.getCurrentUrl();
    }
}
