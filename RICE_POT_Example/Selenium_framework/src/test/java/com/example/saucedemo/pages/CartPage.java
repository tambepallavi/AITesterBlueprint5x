package com.example.saucedemo.pages;

import java.time.Duration;
import java.util.List;
import java.util.function.Supplier;
import java.util.stream.Collectors;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

public class CartPage {
    private final WebDriverWait wait;

    @FindBy(xpath = "//div[@data-test='inventory-item-name']")
    private List<WebElement> itemNames;

    public CartPage(WebDriver driver) {
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(15));
        PageFactory.initElements(driver, this);
    }

    public String getTitle() {
        return execute(
                "read the cart page title",
                () -> wait.until(ExpectedConditions.visibilityOfElementLocated(
                        By.xpath("//span[@data-test='title']"))).getText().trim());
    }

    public List<String> getItemNames() {
        return execute(
                "read the cart item names",
                () -> {
                    wait.until(ExpectedConditions.visibilityOfElementLocated(
                            By.xpath("//div[@data-test='inventory-item-name']")));
                    return itemNames
                        .stream()
                        .map(element -> element.getText().trim())
                        .collect(Collectors.toList());
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
