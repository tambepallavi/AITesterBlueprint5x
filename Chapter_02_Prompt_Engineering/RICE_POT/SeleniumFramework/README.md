# Salesforce Login Selenium Framework

## Requirements

- Java 17 or newer
- Maven 3.9 or newer
- Google Chrome

Selenium Manager resolves the matching ChromeDriver automatically.

## Run headed tests

Chrome runs headed by default:

```shell
mvn verify -Dheadless=false
```

Set `-Dheadless=true` to run Chrome without a visible window.

The invalid-login test uses a reserved `.invalid` username and verifies the observed Salesforce error message and Remember Me control. The valid-login test is skipped unless all of the following environment variables are set:

- `SF_USERNAME`
- `SF_PASSWORD`
- `SF_SUCCESS_URL_FRAGMENT` - a URL fragment identifying the authenticated destination for your Salesforce org

`SF_LOGIN_URL` optionally overrides the default `https://login.salesforce.com/?locale=in`.

The Allure Maven report is generated as part of `mvn verify`; raw results are written under `target/selenium-framework-build/allure-results`.
