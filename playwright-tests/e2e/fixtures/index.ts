import {test as base} from '@playwright/test'
import { LoginPage } from '../poms/loginPage'
import { SignupPage } from '../poms/signupPage'

interface ExtendedFixtures {
    loginPage: LoginPage
    signupPage: SignupPage
}

export const test = base.extend<ExtendedFixtures>({
    loginPage: async ({page}, use) => {
        const loginPage = new LoginPage(page)
        await use(loginPage)
    },

    signupPage: async ({page}, use) => {
        const signupPage = new SignupPage(page)
        await use(signupPage)
    }
})