import { test } from '../fixtures';
import { STORAGE_STATE } from '../../playwright.config'; // STORAGE_STATE = "./auth/session.json"
import { COMMON_TEXTS } from '../constants/texts';

test.describe('Login Page', () => {
  test('Should login a user with valid credentials', async ({ page, loginPage }) => {
    await test.slow();
    await test.step('Step 1: Navigate to login page', () => page.goto('/'))

    await test.step('Step 2: Login admin user', () =>
      loginPage.loginUser(
      process.env.ADMIN_EMAIL,
      process.env.ADMIN_PASSWORD,
    ))

    await test.step('Step 3: Expect user to be logged in', () =>
    loginPage.expectNewUserLoggedIn(COMMON_TEXTS.defaultUsername)
  );

    await page.context().storageState({ path: STORAGE_STATE });
  });
});
