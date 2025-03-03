import { test } from '../fixtures'
import { STORAGE_STATE } from "../../playwright.config"; // STORAGE_STATE = "./auth/session.json"

test.describe('Login Page', () => {
  test('Login with valid credentials', async ({page, loginPage }) => {
    await test.slow()
    await page.goto('/');

    await loginPage.loginUser('oliver@example.com', 'welcome');
   await loginPage.expectNewUserLoggedIn('Oliver Smith');
    await page.context().storageState({path: STORAGE_STATE})

  })
});
