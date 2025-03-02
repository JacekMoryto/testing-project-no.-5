import { faker } from '@faker-js/faker';
import { test } from '../fixtures';
import { expect } from '@playwright/test';
import { LoginPage } from '../poms/loginPage';
import { TaskPage } from '../poms/taskPage';
import { isContext } from 'vm';

test.describe('Tasks page', () => {
  let taskName: string;

  test.beforeEach(async ({page}) => {
    taskName = faker.word.words({ count: 5 });
    await page.goto('/');
  });

  test('should create a new task assigned to the creator', async ({
    page,
    taskPage,
  }) => {
    await test.slow()
    await taskPage.createNewTask(taskName);
    await taskPage.expectNewTaskCreated(taskName);
  });

  test('should be able to mark a task as completed', async ({
    page,
    taskPage,
  }) => {
    await test.slow()
    await taskPage.createNewTask(taskName);
    await taskPage.markTaskAsCompleted(taskName)
    await taskPage.expectTaskAsCompleted(taskName)

  });

  test('should be able to delete a task', async ({
    page,
    taskPage,
  }) => {
    test.slow()
    await taskPage.createNewTask(taskName);
    await taskPage.markTaskAsCompleted(taskName)
    const completedTaskInDashboard = page.getByTestId('tasks-completed-table').getByRole('row').filter({ hasText: taskName })
    const trashIconForCompletedTask = completedTaskInDashboard.getByTestId('completed-task-delete-link')
    //await trashIconForCompletedTask.scrollIntoViewIfNeeded()
    await trashIconForCompletedTask.click()
    await expect(completedTaskInDashboard).toBeHidden()
    await expect(
      page
        .getByTestId("tasks-pending-table")
        .getByRole("row", { name: taskName })
    ).toBeHidden();

  })

  test.skip('should be able to star a task test', async ({
    page,
    taskPage,
  }) => {
    test.slow()
    //await taskPage.createNewTask(taskName);
    // const pendingSecondTaskInDashboard = page.getByTestId('tasks-pending-table').getByRole('row').nth(2)
    // const pendingSecondTaskInDashboardTitle = await pendingSecondTaskInDashboard.textContent()
    // const starIconForSecondTaskInDashboard = pendingSecondTaskInDashboard.getByTestId('pending-task-star-or-unstar-link')

    // const pendingFirstTaskInDashboard = page.getByTestId('tasks-pending-table').getByRole('row').nth(1)
    // const starIconForFirstTaskInDashboard = pendingFirstTaskInDashboard.getByTestId('pending-task-star-or-unstar-link')

    // await starIconForSecondTaskInDashboard.click()
    // await expect(starIconForFirstTaskInDashboard).toHaveClass(/ri-star-fill/i)
    // await expect(pendingFirstTaskInDashboard).toContainText(pendingSecondTaskInDashboardTitle)
  })

  test.describe('Starring tasks feature', () => {
    test.describe.configure({ mode: "serial" })
  test('should be able to star a task', async ({
    page,
    taskPage,
  }) => {
    //refactor this (starIcon) in POM
    const starIcon = page
              .getByTestId("tasks-pending-table")
              .getByRole("row", { name: taskName })
              .getByTestId("pending-task-star-or-unstar-link");
    await taskPage.createNewTask(taskName)
    await taskPage.starTask(taskName)
    expect(starIcon).toHaveClass(/ri-star-fill/i);
    await expect(page.getByTestId("tasks-pending-table").getByRole("row").nth(1)).toContainText(taskName);
  })

  test("should be able to un-star a pending task", async ({
    page,
    taskPage,
  }) => {

    await taskPage.createTask(taskName);
    await taskPage.starTask(taskName);
    const starIcon = page
      .getByTestId("tasks-pending-table")
      .getByRole("row", { name: taskName })
      .getByTestId("pending-task-star-or-unstar-link");
    await starIcon.click();
    await expect(starIcon).toHaveClass(/ri-star-line/);
  })
  });

  test("should be able to create a new task with a diffrent assignee", async ({
    page,
    taskPage,
    browser
  }) => {
    await taskPage.createNewTask({taskName, userName: 'test'})
    await taskPage.expectNewTaskCreated(taskName)

    // Creating a new browser context and a page in the browser without restoring the session
    const newUserContext = await browser.newContext({storageState: {cookies:[], origin: []}})
    const newUserPage = await newUserContext.newPage()

    // Initializing the login POM here because the fixture is configured to use the default page context
    const loginPage = new LoginPage(newUserPage)
    await newUserPage.goto("/");

    await loginPage.loginUser('test@example.com', 'welcome')
    await expect(newUserPage.getByTestId('tasks-pending-table').getByRole('row').filter({hasText: taskName})).toBeVisible()

  })
});
