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

public class ProductsPage {
    private final WebDriverWait wait;

    @FindBy(xpath = "//button[@data-test='add-to-cart-sauce-labs-backpack']")
    private WebElement addBackpackButton;

    @FindBy(xpath = "//span[@data-test='shopping-cart-badge']")
    private WebElement cartBadge;

    @FindBy(xpath = "//a[@data-test='shopping-cart-link']")
    private WebElement cartLink;

    public ProductsPage(WebDriver driver) {
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(15));
        PageFactory.initElements(driver, this);
    }

    public String addBackpackToCart() {
        return execute("add the backpack to the cart", () -> {
            wait.until(ExpectedConditions.elementToBeClickable(addBackpackButton)).click();
            return wait.until(ExpectedConditions.visibilityOf(cartBadge)).getText().trim();
        });
    }

    public void openCart() {
        execute("open the shopping cart", () -> {
            wait.until(ExpectedConditions.elementToBeClickable(cartLink)).click();
            wait.until(ExpectedConditions.visibilityOfElementLocated(
                    By.xpath("//span[@data-test='title' and normalize-space(.)='Your Cart']")));
            return null;
        });
    }

    private <T> T execute(String action, Supplier<T> operation) {
        try {
            return operation.get();
        } catch (WebDriverException exception) {
            throw new IllegalStateException("Unable to " + action + ".", exception);
        }
    }
}
