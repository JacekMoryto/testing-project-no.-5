import { test } from '../fixtures'

test.describe('Login Page', () => {
  test('Login with valid credentials', async ({page, loginPage }) => {

    await page.goto('http://localhost:3000/');
    await loginPage.loginUser('oliver@example.com', 'welcome');
    await loginPage.expectNewUserLoggedIn('Oliver Smith');
  });
});
