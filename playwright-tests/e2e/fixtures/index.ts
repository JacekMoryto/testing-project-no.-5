import {test as base} from '@playwright/test'
import { LoginPage } from '../poms/loginPage'
import { SignupPage } from '../poms/signupPage'
import { TaskPage } from '../poms/taskPage'

interface ExtendedFixtures {
    loginPage: LoginPage
    signupPage: SignupPage
    taskPage: TaskPage
}

export const test = base.extend<ExtendedFixtures>({
    loginPage: async ({page}, use) => {
        const loginPage = new LoginPage(page)
        await use(loginPage)
    },

    signupPage: async ({page}, use) => {
        const signupPage = new SignupPage(page)
        await use(signupPage)
    },

    taskPage: async ({page}, use) => {
        const taskPage = new TaskPage(page)
        await use(taskPage)
    }
})