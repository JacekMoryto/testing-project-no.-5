import {test} from '../fixtures'
import { faker } from '@faker-js/faker';
import {expect} from '@playwright/test'

test.describe('Signup Page', () => {

    test('Signup new valid user and login', async ({page, signupPage, loginPage}) => {

        const newUserName = faker.person.fullName()
        const newEmail = faker.internet.email()
        const newPassword = faker.internet.password()

        await page.goto('http://localhost:3000/')
        await loginPage.navigateToSignup()
        await signupPage.signupNewUser(newUserName, newEmail, newPassword)
        await expect(page).toHaveURL('http://localhost:3000/login')
        await loginPage.loginUser(newEmail, newPassword)
    })
})