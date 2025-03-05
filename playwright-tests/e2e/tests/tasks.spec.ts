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

test.describe('Tasks page', () => {
  let taskName: string;
  let commentBody: string;

  test.beforeEach(async ({ page, taskPage }, testInfo) => {
    taskName = faker.word.words({ count: 4 });
    commentBody = faker.word.words({ count: 7 });
    if (testInfo.title.includes('[SKIP_SETUP')) return;
    await page.goto('/');
    await taskPage.createNewTask({ taskName });
  });

  test.afterEach(async ({ page, taskPage }, testInfo) => {
    if (testInfo.title.includes('[SKIP_CLEANUP]')) return;
    await page.goto('/');
    await taskPage.markTaskAsCompleted(taskName);
    const completedTaskInDashboard = page
      .getByTestId('tasks-completed-table')
      .getByRole('row', {name: taskName})
    const trashIconForCompletedTask = completedTaskInDashboard.getByTestId(
      'completed-task-delete-link'
    );
    //await trashIconForCompletedTask.scrollIntoViewIfNeeded()
    await trashIconForCompletedTask.click();
    await expect(completedTaskInDashboard).toBeHidden();
    await expect(
      page
        .getByTestId('tasks-pending-table')
        .getByRole('row', { name: taskName })
    ).toBeHidden();
  });

  test('should create a new task assigned to the creator', async ({
    page,
    taskPage,
  }) => {
    await test.slow();
    await taskPage.expectNewTaskCreated(taskName);
  });

  test('should be able to mark a task as completed', async ({
    page,
    taskPage,
  }) => {
    await test.slow();

    await taskPage.markTaskAsCompleted(taskName);
    await taskPage.expectTaskAsCompleted(taskName);
  });

  test('should be able to delete a task [SKIP_CLEANUP]', async ({
    page,
    taskPage,
  }) => {
    test.slow();
    await taskPage.markTaskAsCompleted(taskName);
    const completedTaskInDashboard = page
      .getByTestId('tasks-completed-table')
      .getByRole('row')
      .filter({ hasText: taskName });
    const trashIconForCompletedTask = completedTaskInDashboard.getByTestId(
      'completed-task-delete-link'
    );
    //await trashIconForCompletedTask.scrollIntoViewIfNeeded()
    await trashIconForCompletedTask.click();
    await expect(completedTaskInDashboard).toBeHidden();
    await expect(
      page
        .getByTestId('tasks-pending-table')
        .getByRole('row', { name: taskName })
    ).toBeHidden();
  });

  test('should be able to create a new task with a diffrent assignee [SKIP_SETUP]', async ({
    page,
    taskPage,
    browser,
  }) => {
    await page.goto('/');
    await taskPage.createNewTask({ taskName, userName: 'test' });
    await taskPage.expectNewTaskCreated(taskName);

    // Creating a new browser context and a page in the browser without restoring the session
    const newUserContext = await browser.newContext({
      storageState: { cookies: [], origin: [] },
    });
    const newUserPage = await newUserContext.newPage();

    // Initializing the login POM here because the fixture is configured to use the default page context
    const loginPage = new LoginPage(newUserPage);
    await newUserPage.goto('/');

    await loginPage.loginUser('test@example.com', 'welcome');
    const pendingTask = newUserPage
      .getByTestId('tasks-pending-table')
      .getByRole('row')
      .filter({ hasText: taskName });
    await pendingTask.scrollIntoViewIfNeeded();
    await expect(pendingTask).toBeVisible();
    await newUserPage.close();
    await newUserContext.close();
  });

  test('should be able to add a comment as a creator to a task [SKIP_SETUP]', async ({
    page,
    taskPage,
    browser,
  }) => {
    test.slow();
    await test.step('Step 1: Create a new task and assign it to another user', async () => {
        await page.goto('/');
        await taskPage.createNewTask({ taskName, userName: 'test' });
    })

    await test.step('Step 2: Add a comment to the task', async () => {
    await taskPage.addCommentToGivenTask(taskName, commentBody);
    })

    await test.step('Step 3: Expect the comment to be visible and comment count increased to the task cretor', async () => {
    await taskPage.expectCommentVisible(commentBody);
    await page.goto('/');
    await taskPage.expectCommentCountIncreased(taskName);
    })

    await test.step('Step 4 & 5: Login as an assignee and check comment and count visibility', async () => {
    const { newUserContext, newUserPage, loginPage, taskPage: taskPage1 } =
    await createNewUserSession({browser, email:'test@example.com', password:'welcome', userName: 'test'});

    await taskPage1.expectCommentCountIncreased(taskName);
    await newUserPage.getByText(taskName).click();
    await taskPage1.expectCommentVisible(commentBody);

    await closeUserSession(newUserPage, newUserContext);
    })
  });


      test('should be able to add a comment as an assignee to a task [SKIP_SETUP]', async ({
        page,
        taskPage,
        browser,
      }) => {
        test.slow();

        await test.step('Step 1: Create a new task and assign it to another user', async () => {
          await page.goto('/');
          await taskPage.createNewTask({ taskName, userName: 'test' });
        })

        await test.step('Step 3&4: Add a comment as an assignee and expect comment visibility and comment count increased' , async () => {
        const {
          newUserContext: newUserContext1,
          newUserPage: newUserPage1,
          loginPage: loginPage1,
          taskPage: taskPage1,
        } = await createNewUserSession({browser, email:'test@example.com', password:'welcome', userName: 'test'});

        await taskPage1.addCommentToGivenTask(taskName, commentBody);

        await taskPage1.expectCommentVisible(commentBody);
        await newUserPage1.goto('/');
        await newUserPage1.waitForResponse('/tasks')
        await taskPage1.expectCommentCountIncreased(taskName);
        await closeUserSession(newUserPage1, newUserContext1);
      })

      await test.step('Step 4: Expect the comment is visible and comment count increased to the creator', async () => {
        await page.goto('/')
        await taskPage.expectCommentCountIncreased(taskName)
        await page.getByText(taskName).click();
        await taskPage.expectCommentVisible(commentBody);
      });

       // const {
        //   newUserContext: newUserContext2,
        //   newUserPage: newUserPage2,
        //   loginPage: loginPage2,
        //   taskPage: taskPage2,
        // } = await createNewUserSession(browser, 'oliver@example.com', 'welcome');

        // await taskPage2.expectCommentCountIncreased(taskName);
        // await newUserPage2.getByText(taskName).click();
        // await taskPage2.expectCommentVisible(commentBody);

        // await closeUserSession(newUserPage2, newUserContext2);
})


  test.describe('Starring tasks feature', () => {
    test.describe.configure({ mode: 'serial' });
    test('should be able to star a task', async ({ page, taskPage }) => {
      //refactor this (starIcon) in POM
      const starIcon = page
        .getByTestId('tasks-pending-table')
        .getByRole('row', { name: taskName })
        .getByTestId('pending-task-star-or-unstar-link');

      await taskPage.starTask(taskName);
      expect(starIcon).toHaveClass(/ri-star-fill/i);
      await expect(
        page.getByTestId('tasks-pending-table').getByRole('row').nth(1)
      ).toContainText(taskName);
    });

    test('should be able to un-star a pending task', async ({
      page,
      taskPage,
    }) => {
      await taskPage.starTask(taskName);
      const starIcon = page
        .getByTestId('tasks-pending-table')
        .getByRole('row', { name: taskName })
        .getByTestId('pending-task-star-or-unstar-link');
      await starIcon.click();
      await expect(starIcon).toHaveClass(/ri-star-line/);
    });
  });
});
