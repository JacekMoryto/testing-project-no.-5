import { LoginPage } from "../poms/loginPage"
import { TaskPage } from "../poms/taskPage"



export async function createNewUserSession ({browser, email, password, userName}:  {
    browser: Browser;
    email: string;
    password: string;
    userName: string;
  }){

    const newUserContext = await browser.newContext(({storageState: {cookies:[], origin: []}}))
    const newUserPage = await newUserContext.newPage()
    const loginPage = new LoginPage(newUserPage)
    const taskPage = new TaskPage(newUserPage)

    await newUserPage.goto('/');
    await loginPage.loginUser(email, password);
    await loginPage.expectNewUserLoggedIn(userName)

    return {newUserContext, newUserPage, loginPage, taskPage}
}

export async function closeUserSession (newUserPage: Page, newUserContext: Browser){
    await newUserPage.close()
    await newUserContext.close()
}
