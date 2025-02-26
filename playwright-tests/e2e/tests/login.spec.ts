import {test,expect} from '@playwright/test'


test.describe('Login Page', () => {

    test('Login with valid credentials', async ({page}) => {

        await page.goto('http://localhost:3000/')
        await page.getByTestId('login-email-field').fill("oliver@example.com");
        await page.getByTestId('login-password-field').fill("welcome");
        await page.getByTestId('login-submit-button').click();

        await expect(page.getByTestId('navbar-username-label')).toBeVisible();
        await expect(page.getByTestId('navbar-logout-link')).toBeVisible();



    })


})
