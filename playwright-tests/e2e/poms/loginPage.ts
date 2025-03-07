import { Page, expect } from '@playwright/test';
import { TIMEOUT } from 'dns';
import { LOGIN_SELECTORS, NAVBAR_SELECTORS } from '../constants/selectors'

export class LoginPage {
  readonly page: Page;
  readonly emailField: Locator;
  readonly passwordField: Locator;
  readonly loginButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailField = this.page.getByTestId(LOGIN_SELECTORS.emailField);
    this.passwordField = this.page.getByTestId(LOGIN_SELECTORS.passwordField);
    this.loginButton = this.page.getByTestId(LOGIN_SELECTORS.loginButton);
  }

  async navigateToSignup() {
    await this.page.getByTestId(LOGIN_SELECTORS.signupLink).click();
  }

  async loginUser(email: string, password: string) {
    await this.emailField.fill(email);
    await this.passwordField.fill(password);
    await this.loginButton.click();
  }

  async expectNewUserLoggedIn(username: string) {
    await this.page.waitForResponse('/tasks');
    await Promise.all([
      expect(this.page.getByTestId(NAVBAR_SELECTORS.logoutLink)).toBeVisible(),
      expect(this.page.getByTestId(NAVBAR_SELECTORS.usernameLabel)).toContainText(
        username
      ),
    ]);
  }
}
