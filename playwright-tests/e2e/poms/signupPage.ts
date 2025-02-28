import { Page } from '@playwright/test'

export class SignupPage {
    readonly page: Page
    readonly usernameField: Locator
    readonly emailField: Locator
    readonly passwordField: Locator
    readonly submitButton: Locator
    readonly confirmationPasswordField: Locator

constructor(page:Page){
    this.page = page
    this.usernameField = this.page.getByTestId('signup-name-field')
    this.emailField = this.page.getByTestId('signup-email-field')
    this.passwordField = this.page.getByTestId('signup-password-field')
    this.confirmationPasswordField = this.page.getByTestId('signup-password-confirmation-field')
    this.submitButton = this.page.getByTestId('signup-submit-button')

}

async signupNewUser(username: string, email: string, password: string){
    await this.usernameField.fill(username)
    await this.emailField.fill(email)
    await this.passwordField.fill(password)
    await this.confirmationPasswordField.fill(password)
    await this.submitButton.click()
}
}