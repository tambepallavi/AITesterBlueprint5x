import { expect, test } from '@playwright/test';
import { LoginPage } from '../src/pages/LoginPage.js';

const invalidCredentials = {
  email: 'qa-automation-check@invalid.example',
  password: 'Invalid-Test-Only-Password-9081',
};

test.describe('Wingify login', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.open();
  });

  test('rejects invalid credentials with the observed authentication error', async () => {
    await test.step('Submit reserved invalid test credentials', async () => {
      await loginPage.signIn(invalidCredentials.email, invalidCredentials.password);
    });

    await test.step('Verify the authentication error is shown', async () => {
      await expect(loginPage.authenticationError).toBeVisible();
    });
  });

  test('accepts configured valid credentials and reaches the configured destination', async ({ page }) => {
    const email = process.env.WINGIFY_USERNAME;
    const password = process.env.WINGIFY_PASSWORD;
    const successUrlFragment = process.env.WINGIFY_SUCCESS_URL_FRAGMENT;

    if (!email || !password || !successUrlFragment) {
      test.skip(
        true,
        'Set WINGIFY_USERNAME, WINGIFY_PASSWORD, and WINGIFY_SUCCESS_URL_FRAGMENT to run the valid-login test.',
      );
      return;
    }

    await test.step('Submit configured valid credentials', async () => {
      await loginPage.signIn(email, password);
    });

    await test.step('Verify the configured authenticated destination', async () => {
      await expect(page).toHaveURL((url) => url.href.includes(successUrlFragment));
    });
  });
});
