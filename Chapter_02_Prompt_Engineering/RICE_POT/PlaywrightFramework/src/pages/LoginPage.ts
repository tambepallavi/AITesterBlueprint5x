import type { Locator, Page } from '@playwright/test';

export class LoginPage {
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly signInButton: Locator;
  readonly authenticationError: Locator;

  constructor(private readonly page: Page) {
    this.emailInput = page.getByRole('textbox', { name: 'Email address' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    this.signInButton = page.getByRole('button', { name: 'Sign in', exact: true });
    this.authenticationError = page.getByText(
      'Your email, password, IP address or location did not match',
      { exact: true },
    );
  }

  async open(): Promise<void> {
    await this.runAction('open the Wingify login page', async () => {
      await this.page.goto('/#/login');
      await this.emailInput.waitFor({ state: 'visible' });
      await this.passwordInput.waitFor({ state: 'visible' });
    });
  }

  async signIn(email: string, password: string): Promise<void> {
    await this.runAction('submit the Wingify sign-in form', async () => {
      await this.emailInput.fill(email);
      await this.passwordInput.fill(password);
      await this.signInButton.click();
    });
  }

  private async runAction<T>(action: string, operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      throw new Error(`Unable to ${action}: ${detail}`, { cause: error });
    }
  }
}
