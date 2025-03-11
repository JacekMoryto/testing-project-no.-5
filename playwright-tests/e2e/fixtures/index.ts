import {test as base, expect} from '@playwright/test'
import { LoginPage } from '../poms/loginPage'
import { SignupPage } from '../poms/signupPage'
import { TaskPage } from '../poms/taskPage'
import { STORAGE_STATE } from '../../playwright.config'
import fs from 'fs';

interface ExtendedFixtures {
    loginPage: LoginPage
    signupPage: SignupPage
    taskPage: TaskPage
    createTaskViaAPI: (taskName: string, userType: string) => Promise<void>; // Fixture przyjmuje taskName jako argument
    authToken: string
    authEmail: string
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
    },
    authToken: async ({}, use) => {
      // Wczytaj storageState z pliku
      const storageState = JSON.parse(fs.readFileSync(STORAGE_STATE, 'utf-8'));

      // Pobierz authToken z localStorage
      const authToken = storageState.origins[0].localStorage.find(
        (item: { name: string }) => item.name === 'authToken'
      ).value.slice(1,-1)

      // Przekaż authToken do testów
      await use(authToken);
    },
    authEmail: async ({}, use) => {
      // Wczytaj storageState z pliku
      const storageState = JSON.parse(fs.readFileSync(STORAGE_STATE, 'utf-8'));

      // Pobierz authEmail z localStorage
      const authEmail = storageState.origins[0].localStorage.find(
        (item: { name: string }) => item.name === 'authEmail'
      ).value.slice(1,-1)

      // Przekaż authEmail do testów
      await use(authEmail);
    },
    createTaskViaAPI: async ({ request, authToken, authEmail }, use) => {
        const createTaskViaAPI = async (taskName: string, userType: string) => {
          // Pobierz ID użytkownika (jeśli potrzebne)
          const usersResponse = await request.get('/users', {
            headers: {
              "X-Auth-Email": authEmail,
              "X-Auth-Token": authToken,
              "Accept": "application/json"
            }
          });
          const responseText = await usersResponse.text()
          console.log(`to sa tokeny ${authToken}, ${authEmail}`)
          console.log(`to jest response body ${responseText}`)
          await expect(usersResponse.status()).toBe(200);

          const responseBody = await usersResponse.json();
          const testUserObject = responseBody.users.find(user => user.name === userType);
          const testUserId = testUserObject.id;

          // Utwórz zadanie przez API
          const tasksResponse = await request.post('/tasks', {
            data: {
              "assigned_user_id": testUserId,
              "title": taskName,
            },
            headers: {
              "X-Auth-Email": authEmail,
              "X-Auth-Token": authToken,
              "Accept": "application/json"
            }
          });

          await expect(tasksResponse.status()).toBe(200);
        };

        // Przekaż funkcję do testów
        await use(createTaskViaAPI);
      },
})