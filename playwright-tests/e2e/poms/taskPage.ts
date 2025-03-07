import { Page, expect } from '@playwright/test'
import { COMMENT_SELECTORS, CREATE_TASK_SELECTORS, NAVBAR_SELECTORS, TASKS_TABLE_SELECTORS } from '../constants/selectors'
import { COMMON_TEXTS, DASHBOARD_TEXTS } from '../constants/texts'

interface TaskName {
    taskName: string
}

interface CreateNewTaskProps extends TaskName  {
    username?: string
}

export class TaskPage {
    //readonly pendingTaskInDashboard: Locator
    //readonly CompletedTaskInDashboard: Locator
    // readonly addTaskLink: Locator
    // readonly formTitleField: Locator

    constructor(private page:Page){
        //this.pendingTaskInDashboard = page.getByTestId(TASKS_TABLE_SELECTORS.pendingTasksTable).getByRole('row').filter({ hasText: taskName });
        //this.completedTaskInDashboard = page.getByTestId(TASKS_TABLE_SELECTORS.pendingTasksTable).getByRole('row').filter({ hasText: taskName });
        //this.addTaskLink = page.getByTestId('navbar-add-todo-link')
        //this.formTitleField = page.getByTestId('form-title-field')

    }

    async createNewTask({
        taskName,
        username = COMMON_TEXTS.defaultUsername
    }: CreateNewTaskProps){
        await this.page.getByTestId(NAVBAR_SELECTORS.addTaskLink).click();
        await this.page.getByTestId(CREATE_TASK_SELECTORS.titleField).fill(taskName);
        await this.page.locator(CREATE_TASK_SELECTORS.assigneeDropdown).click();
        await this.page.locator(CREATE_TASK_SELECTORS.assigneeDropdownOption).getByText(username).click();
        await this.page.getByTestId(CREATE_TASK_SELECTORS.createTaskButton).click();
    }


    async expectNewTaskCreated(taskName: TaskName){
        const taskInDashboard = this.page.getByTestId(TASKS_TABLE_SELECTORS.pendingTasksTable).getByRole('row', {name: taskName})
        await taskInDashboard.scrollIntoViewIfNeeded();
        await expect(taskInDashboard).toBeVisible();
    }

    async markTaskAsCompleted(taskName: TaskName){
        await this.page.waitForResponse('/tasks')
        const pendingTaskInDashboard = this.page.getByTestId(TASKS_TABLE_SELECTORS.pendingTasksTable).getByRole('row', {name: taskName})
        const isTaskCompleted = await this.page.getByTestId(TASKS_TABLE_SELECTORS.completedTasksTable).getByRole("row", { name: taskName }).count()
        if(isTaskCompleted) return;
        await pendingTaskInDashboard.getByRole('checkbox').click();

    }

    async expectTaskAsCompleted(taskName: TaskName){
        const pendingTaskInDashboard = this.page.getByTestId(TASKS_TABLE_SELECTORS.pendingTasksTable).getByRole('row', {name: taskName})
        const completedTaskInDashboard = this.page.getByTestId(TASKS_TABLE_SELECTORS.completedTasksTable).getByRole('row', {name: taskName});
        await expect(pendingTaskInDashboard).toBeHidden()
        await completedTaskInDashboard.scrollIntoViewIfNeeded();
        await expect(completedTaskInDashboard).toBeVisible();
    }

    async starTask ( taskName : TaskName) {
            const starIcon = this.page
              .getByTestId(TASKS_TABLE_SELECTORS.pendingTasksTable)
              .getByRole("row", { name: taskName })
              .getByTestId(TASKS_TABLE_SELECTORS.starUnstarButton);
            await starIcon.click();

          };

    async addCommentToGivenTask (taskName: TaskName, commentBody: string) {
        await this.page.getByText(taskName).click();
        await this.page.getByTestId(COMMENT_SELECTORS.commentTextField).fill(commentBody);
        await this.page.getByTestId(COMMENT_SELECTORS.addCommentButton).click();
    }

    async expectCommentVisible (commentBody: string) {
        await expect(this.page.getByTestId(COMMENT_SELECTORS.commentItem)).toContainText(commentBody);
    }

    async expectCommentCountIncreased (taskName: TaskName){
        await expect(this.page.getByTestId(TASKS_TABLE_SELECTORS.pendingTasksTable).getByRole('row', {name: taskName}).locator('td').nth(3)).toHaveText('1'); // Using nth method here since we want to verify the 4th cell of the row
    }
    }
