import { Page } from '@playwright/test'
import { SIGNUP_SELECTORS } from '../constants/selectors'

interface SignupUserProps {
    username: string,
    email: string,
    password: string
}

export class SignupPage {

constructor(private page:Page){
}

async signupNewUser({username, email, password}: SignupUserProps){
    await this.page.getByTestId(SIGNUP_SELECTORS.nameField).fill(username)
    await this.page.getByTestId(SIGNUP_SELECTORS.emailField).fill(email)
    await this.page.getByTestId(SIGNUP_SELECTORS.passwordField).fill(password)
    await this.page.getByTestId(SIGNUP_SELECTORS.passwordConfirmationField).fill(password)
    await this.page.getByTestId(SIGNUP_SELECTORS.signupButton).click()
}
}