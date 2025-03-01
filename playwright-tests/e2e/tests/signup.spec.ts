import {test} from '../fixtures'
import { faker } from '@faker-js/faker';
import {expect, request} from '@playwright/test'

test.describe('Signup Page', () => {

    test('Signup new valid user and login', async ({page, signupPage, loginPage}) => {

        const newUserName = faker.person.fullName()
        const newEmail = faker.internet.email()
        const newPassword = faker.internet.password()
        await test.slow()
            await page.goto('/')
            await loginPage.navigateToSignup()
            await signupPage.signupNewUser(newUserName, newEmail, newPassword)
            await expect(page).toHaveURL('/login')
        await loginPage.loginUser(newEmail, newPassword)

})
})