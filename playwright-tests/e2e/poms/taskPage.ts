import { Page, expect } from '@playwright/test'
import { COMMENT_SELECTORS } from '../constants/selectors/task';


interface TaskName {
    taskName: string
}

interface CreateNewTaskProps extends TaskName  {
    userName?: string
}

export class TaskPage {
    readonly page:Page
    //readonly pendingTaskInDashboard: Locator
    //readonly CompletedTaskInDashboard: Locator
    // readonly addTaskLink: Locator
    // readonly formTitleField: Locator

    constructor(page:Page){
        this.page = page
        //this.pendingTaskInDashboard = page.getByTestId('tasks-pending-table').getByRole('row').filter({ hasText: taskName });
        //this.completedTaskInDashboard = page.getByTestId('tasks-pending-table').getByRole('row').filter({ hasText: taskName });
        //this.addTaskLink = page.getByTestId('navbar-add-todo-link')
        //this.formTitleField = page.getByTestId('form-title-field')

    }

    async createNewTask({
        taskName,
        userName = 'Oliver Smith',
    }: CreateNewTaskProps){
        await this.page.getByTestId('navbar-add-todo-link').click();
        await this.page.getByTestId('form-title-field').fill(taskName);
        await this.page.locator('.css-2b097c-container').click();
        await this.page.locator('.css-26l3qy-menu').getByText(userName).click();
        await this.page.getByTestId('form-submit-button').click();
    }


    async expectNewTaskCreated(taskName: TaskName){
        const taskInDashboard = this.page.getByTestId('tasks-pending-table').getByRole('row', {name: taskName})
        //.getByRole('row', { name: new RegExp(taskName, 'i') });
        await taskInDashboard.scrollIntoViewIfNeeded();
        await expect(taskInDashboard).toBeVisible();
    }

    async markTaskAsCompleted(taskName: TaskName){
        await this.page.waitForResponse('/tasks')
        const pendingTaskInDashboard = this.page.getByTestId('tasks-pending-table').getByRole('row', {name: taskName})
        const isTaskCompleted = await this.page.getByTestId("tasks-completed-table").getByRole("row", { name: taskName }).count()
        if(isTaskCompleted) return;
        await pendingTaskInDashboard.getByRole('checkbox').click();

    }

    async expectTaskAsCompleted(taskName: TaskName){
        const pendingTaskInDashboard = this.page.getByTestId('tasks-pending-table').getByRole('row', {name: taskName})
        const completedTaskInDashboard = this.page.getByTestId('tasks-completed-table').getByRole('row', {name: taskName});
        await expect(pendingTaskInDashboard).toBeHidden()
        await completedTaskInDashboard.scrollIntoViewIfNeeded();
        await expect(completedTaskInDashboard).toBeVisible();
    }

    async starTask ( taskName : TaskName) {
            const starIcon = this.page
              .getByTestId("tasks-pending-table")
              .getByRole("row", { name: taskName })
              .getByTestId("pending-task-star-or-unstar-link");
            await starIcon.click();

          };

    async addCommentToGivenTask (taskName: TaskName, commentBody: string) {
        await this.page.getByText(taskName).click();
        await this.page.getByTestId(COMMENT_SELECTORS.textField).fill(commentBody);
        await this.page.getByTestId(COMMENT_SELECTORS.submitButton).click();
    }

    async expectCommentVisible (commentBody: string) {
        await expect(this.page.getByTestId(COMMENT_SELECTORS.commentText)).toContainText(commentBody);
    }

    async expectCommentCountIncreased (taskName: TaskName){
        await expect(this.page.getByTestId('tasks-pending-table').getByRole('row', {name: taskName}).locator('td').nth(3)).toHaveText('1');
    }
    }
