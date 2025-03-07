import { LoginPage } from "../poms/loginPage"
import { TaskPage } from "../poms/taskPage"

interface UserSessionParams {
  browser: Browser;
  email: string;
  password: string;
  username: string;
}

export async function createNewUserSession ({browser, email, password, username,}: UserSessionParams){

    const newUserContext = await browser.newContext(({storageState: {cookies:[], origin: []}}))
    const newUserPage = await newUserContext.newPage()
    const loginPage = new LoginPage(newUserPage)
    const taskPage = new TaskPage(newUserPage)

    await newUserPage.goto('/');
    await loginPage.loginUser(email, password);
    await loginPage.expectNewUserLoggedIn(username)

    return {newUserContext, newUserPage, loginPage, taskPage}
}

export async function closeUserSession (newUserPage: Page, newUserContext: Browser){
    await newUserPage.close()
    await newUserContext.close()
}
