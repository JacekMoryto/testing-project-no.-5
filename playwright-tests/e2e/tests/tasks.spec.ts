import { faker } from '@faker-js/faker';
import { test } from '../fixtures';
import { expect } from '@playwright/test';
import { LoginPage } from '../poms/loginPage';
import { TaskPage } from '../poms/taskPage';

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

  test('should mark a task as completed', async ({
    page,
    taskPage,
  }) => {
    await test.slow()
    await taskPage.createNewTask(taskName);

    const pendingTaskInDashboard = page
      .getByTestId('tasks-pending-table')
      .getByRole('row')
      .filter({ hasText: taskName });
    await pendingTaskInDashboard.getByRole('checkbox').click();
    await expect(pendingTaskInDashboard).not.toBeVisible();

    const completedTaskInDashboard = page
      .getByTestId('tasks-completed-table')
      .filter({ hasText: taskName });
    await completedTaskInDashboard.scrollIntoViewIfNeeded();
    await expect(completedTaskInDashboard).toBeVisible();
  });
});
