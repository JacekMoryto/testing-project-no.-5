import { Page, expect } from '@playwright/test';
import { TIMEOUT } from 'dns';


export class LoginPage {
  readonly page: Page;
  readonly emailField: Locator;
  readonly passwordField: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailField = this.page.getByTestId('login-email-field');
    this.passwordField = this.page.getByTestId('login-password-field');
    this.submitButton = this.page.getByTestId('login-submit-button');
  }

  async navigateToSignup() {
    await this.page.getByTestId('login-register-link').click();
  }

  async loginUser(email: string, password: string) {
    await this.emailField.fill(email);
    await this.passwordField.fill(password);
    await this.submitButton.click();
  }

  async expectNewUserLoggedIn(username: string) {
    await this.page.waitForResponse('/tasks')
    await expect(this.page.getByTestId('navbar-logout-link')).toBeVisible();
    await expect(this.page.getByTestId('navbar-username-label')).toContainText(username);

  }
}
