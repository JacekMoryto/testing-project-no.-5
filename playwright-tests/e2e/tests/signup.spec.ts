import {test} from '../fixtures'
import { faker } from '@faker-js/faker';
import {expect, request} from '@playwright/test'

test.describe('Signup Page', () => {

    test('Should signup new valid user and login', async ({page, signupPage, loginPage}) => {

        const newUsername = faker.person.fullName()
        const newEmail = faker.internet.email()
        const newPassword = faker.internet.password()
        await test.slow()

        await test.step('Step 1: Navigate to login page', () => page.goto('/'))

        await test.step('Step 2: Navigate to signup page', () => loginPage.navigateToSignup())

        await test.step('Step 3: Signup valid new user', () => signupPage.signupNewUser({username: newUsername, email: newEmail, password: newPassword}))

        await test.step('Step 4: Expect user to be on login page', () => expect(page).toHaveURL('/login'))

        await test.step('Step 4: Expect user to be on login page', () => loginPage.loginUser(newEmail, newPassword))
})
})