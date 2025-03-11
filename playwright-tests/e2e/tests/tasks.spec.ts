import { faker } from '@faker-js/faker';
import { test } from '../fixtures';
import { expect } from '@playwright/test';
import { LoginPage } from '../poms/loginPage';
import { TaskPage } from '../poms/taskPage';
import {
  createNewUserSession,
  closeUserSession,
} from '../utils/userSessionHelper';
import { isContext } from 'vm';
import { TASKS_TABLE_SELECTORS } from '../constants/selectors';
import {COMMON_TEXTS} from '../constants/texts'

test.describe('Tasks page', () => {
  let taskName: string;
  let commentBody: string;

  test.beforeEach(async ({ page, taskPage, createTaskViaAPI }, testInfo) => {
    taskName = faker.word.words({ count: 4 });
    commentBody = faker.word.words({ count: 7 });

    if (testInfo.title.includes('[SKIP_API_SETUP]')) {
      await page.goto('/')
      await taskPage.createNewTask({ taskName});
    } else if (testInfo.title.includes('[STANDARD]')){
      await createTaskViaAPI(taskName, COMMON_TEXTS.standardUsername);
      await page.goto('/')
    } else if (testInfo.title.includes('[DEFAULT]')){
      await createTaskViaAPI(taskName, COMMON_TEXTS.defaultUsername);
      await page.goto('/')
    }
  });

  test.afterEach(async ({ page, taskPage }, testInfo) => {
    if (testInfo.title.includes('[SKIP_CLEANUP]')) return;

    const completedTaskInDashboard = page.getByTestId(TASKS_TABLE_SELECTORS.completedTasksTable).getByRole('row', {name: taskName})

    await test.step('Step 1: Go to dashboard', () => page.goto('/'));
    await test.step('Step 2: Mark a task as completed', () =>
      taskPage.markTaskAsCompleted(taskName))

    await test.step('Step 3: Delete the completed task',  () =>
      completedTaskInDashboard.getByTestId(
        TASKS_TABLE_SELECTORS.deleteTaskIcon).click()
    );

    await test.step('Step 4: Expect the task to be deleted from the dashboard', async () => {
      await expect(completedTaskInDashboard).toBeHidden();
      await expect(
        page
          .getByTestId(TASKS_TABLE_SELECTORS.pendingTasksTable)
          .getByRole('row', { name: taskName })
      ).toBeHidden();
    });
  })

  test('should create a new task assigned to the creator [SKIP_API_SETUP]', async ({
    page,
    taskPage,
  }) => {
    await test.slow();
    await test.step('Step 3: Expect the task to be visible on the dashboard', () =>
     taskPage.expectNewTaskCreated(taskName))
  });

  test('should be able to mark a task as completed [DEFAULT]', async ({
    page,
    taskPage,
  }) => {
    await test.slow();
    await test.step('Step 3: Mark the task as completed',  () =>
      taskPage.markTaskAsCompleted(taskName))

    await test.step('Step 4: Expect the task to be completed',  () =>
      taskPage.expectTaskAsCompleted(taskName))
  });

  test('should be able to delete a task [DEFAULT] [SKIP_CLEANUP]', async ({
    page,
    taskPage,
  }) => {
    test.slow();
    await page.goto('/')
    const completedTaskInDashboard = page.getByTestId(TASKS_TABLE_SELECTORS.completedTasksTable).getByRole('row').filter({ hasText: taskName });

    await test.step('Step 3: Mark the task as completed',  () =>
      taskPage.markTaskAsCompleted(taskName));

    await test.step('Step 4: Delete the completed task',  () =>
      completedTaskInDashboard.getByTestId(
        TASKS_TABLE_SELECTORS.deleteTaskIcon
      ).click())

    await test.step('Step 4: Expect the task to be removed from the dashboard', async () => {
      await expect(completedTaskInDashboard).toBeHidden()
      await expect(
        page
          .getByTestId(TASKS_TABLE_SELECTORS.pendingTasksTable)
          .getByRole('row', { name: taskName })
      ).toBeHidden();
    });
  })

  test('should be able to create a new task with a diffrent assignee [STANDARD]', async ({
    page,
    taskPage,
    browser,
  }) => {
    test.slow()
    await test.step('Step 1: Navigate to dashboard', () => page.goto('/'))

    // await test.step('Step 2: Create a new task and assign to a standard user',  () =>
    //   taskPage.createNewTask({ taskName, username: COMMON_TEXTS.standardUsername }));

    await test.step('Step 4: Expect the task to be visible on the dashboard', () =>
      taskPage.expectNewTaskCreated(taskName));

    // Creating a new browser context and a page in the browser without restoring the session
    const newUserContext = await browser.newContext({
      storageState: { cookies: [], origin: [] },
    });
    const newUserPage = await newUserContext.newPage();

    // Initializing the login POM here because the fixture is configured to use the default page context
    const loginPage = new LoginPage(newUserPage);

    await test.step('Step 5: Navigate to login page', () => newUserPage.goto('/'));

    await test.step('Step 6: Login as the standard user', () =>
      loginPage.loginUser(process.env.STANDARD_EMAIL, process.env.STANDARD_PASSWORD));

    await test.step('Step 7: Expect the assigned task to be visible to the standard user', async () => {
      const pendingTask = newUserPage
        .getByTestId(TASKS_TABLE_SELECTORS.pendingTasksTable)
        .getByRole('row')
        .filter({ hasText: taskName });
      await pendingTask.scrollIntoViewIfNeeded();
      await expect(pendingTask).toBeVisible()
    })

    await newUserPage.close()
    await newUserContext.close()
  })

  test('should be able to add a comment as a creator to a task [STANDARD]', async ({
    page,
    taskPage,
    browser,
  }) => {
    test.slow();

    await test.step('Step 1: Navigate to dashboard', () => page.goto('/'));

    // await test.step('Step 2: Create a new task assigned to the standard user', () =>
    //   taskPage.createNewTask({ taskName, username: COMMON_TEXTS.standardUsername}))

    await test.step('Step 3: Add a comment to the task', () =>
      taskPage.addCommentToGivenTask(taskName, commentBody))

    await test.step('Step 4: Expect the comment to be visible to the task cretor', () =>
      taskPage.expectCommentVisible(commentBody))

    await test.step('Step 5: Navigate to dashboard and expect that the comment count has been increased', async () => {
      await page.goto('/');
      await taskPage.expectCommentCountIncreased(taskName);
    })

    await test.step('Step 6: Login as an assignee and expect that the comment count increased and visibility of the comment', async () => {
      const { newUserContext, newUserPage, loginPage, taskPage: taskPage1 } = await
      createNewUserSession({browser, email:process.env.STANDARD_EMAIL, password:process.env.STANDARD_PASSWORD, username: COMMON_TEXTS.standardUsername});
      await taskPage1.expectCommentCountIncreased(taskName);
      await newUserPage.getByText(taskName).click();
      await taskPage1.expectCommentVisible(commentBody);
      await closeUserSession(newUserPage, newUserContext);
    })
  });


  test('should be able to add a comment as an assignee to a task [STANDARD]', async ({
    page,
    taskPage,
    browser,
  }) => {
    test.slow();
    let newUserContext1, newUserPage1, loginPage1, taskPage1;

    await test.step('Step 1: Navigate to dashboard', () => page.goto('/'));
    // await test.step('Step 2: Create a new task assigned to the standard user', () =>
    //   taskPage.createNewTask({ taskName, username: COMMON_TEXTS.standardUsername }))

    await test.step('Step 3: Login as standard user, add a comment and expect comment visibility and comment count increased' , async () => {
      const {
      newUserContext: newUserContext1,
      newUserPage: newUserPage1,
      loginPage: loginPage1,
      taskPage: taskPage1,
    } = await createNewUserSession({browser, email:process.env.STANDARD_EMAIL, password:process.env.STANDARD_PASSWORD, username: COMMON_TEXTS.standardUsername});

      await taskPage1.addCommentToGivenTask(taskName, commentBody);
      await taskPage1.expectCommentVisible(commentBody);
      await newUserPage1.goto('/');
      await newUserPage1.waitForResponse('/tasks')
      await taskPage1.expectCommentCountIncreased(taskName);
      await closeUserSession(newUserPage1, newUserContext1);
    })

    await test.step('Step 4: Expect the comment is visible and comment count increased to the creator user', async () => {
      await page.goto('/')
      await taskPage.expectCommentCountIncreased(taskName)
      await page.getByText(taskName).click();
      await taskPage.expectCommentVisible(commentBody);
    });
})


test.describe('Starring tasks feature ', () => {
  test.describe.configure({ mode: 'serial' });
    test('should be able to star a task [DEFAULT]', async ({ page, taskPage }) => {
      test.slow()
      await page.goto('/')
      await test.step('Step 3: Star a task', () => taskPage.starTask(taskName))

      await test.step('Step 4: Expect the desired task to have a star', () => {
        const starIcon = page
        .getByTestId(TASKS_TABLE_SELECTORS.pendingTasksTable)
        .getByRole('row', { name: taskName })
        .getByTestId(TASKS_TABLE_SELECTORS.starUnstarButton)

        Promise.all([expect(starIcon).toHaveClass(/ri-star-fill/i),
        expect(
          page.getByTestId(TASKS_TABLE_SELECTORS.pendingTasksTable).getByRole('row').nth(1)
        ).toContainText(taskName) // Using nth methods here since we want to verify the first row of the table
      ])
    })
  })

    test('should be able to un-star a pending task [DEFAULT]', async ({
      page,
      taskPage,
    }) => {
      test.slow()
      await page.goto('/')
      await test.step('Step 3: Star a task', () => taskPage.starTask(taskName))

      await test.step('Step 3: Un-Star the task and vefiry', async () => {
      const starIcon = page
        .getByTestId(TASKS_TABLE_SELECTORS.pendingTasksTable)
        .getByRole('row', { name: taskName })
        .getByTestId(TASKS_TABLE_SELECTORS.starUnstarButton);
      await starIcon.click();
      await expect(starIcon).toHaveClass(/ri-star-line/);
    })
  });
});

test.only('should create a new task using API [SKIP_SETUP][SKIP_CLEANUP]', async ({page, request, taskPage}) => {
  test.slow()
  await page.goto('/')
  await page.waitForResponse('/tasks')
  const authEmail = await (await page.evaluate(()=> localStorage.getItem('authEmail'))).slice(1, -1);
  const authToken = await (await page.evaluate(()=> localStorage.getItem('authToken'))).slice(1, -1);

  const usersResponse = await request.get('/users', {
    headers: {
      "X-Auth-Email":authEmail,
      "X-Auth-Token":authToken,
      "Accept": "application/json"
    }
  })
  await expect(usersResponse.status()).toBe(200)

  const responseBody = await usersResponse.json()
  const testUserObject = responseBody.users.find(user => user.name === COMMON_TEXTS.standardUsername);
  const testUserId = testUserObject.id

  const tasksResponse = await request.post('/tasks/', {
    data: {
      "assigned_user_id": testUserId,
      "title": taskName,
    },
    headers: {
      "X-Auth-Email":authEmail,
      "X-Auth-Token":authToken,
      "Accept": "application/json"
    }
    })

  await expect(tasksResponse.status()).toBe(200)
  await page.goto('/')
  await taskPage.expectNewTaskCreated(taskName)
})
});
