import { Page, expect } from '@playwright/test'


export class TaskPage {
    readonly page:Page
    // readonly addTaskLink: Locator
    // readonly formTitleField: Locator

    constructor(page:Page){
        this.page = page
        //this.addTaskLink = page.getByTestId('navbar-add-todo-link')
        //this.formTitleField = page.getByTestId('form-title-field')

    }

    async createNewTask(taskName) {
        await this.page.getByTestId('navbar-add-todo-link').click();
        await this.page.getByTestId('form-title-field').fill(taskName);
        await this.page.locator('.css-2b097c-container').click();
        await this.page.locator('.css-26l3qy-menu').getByText('Oliver Smith').click();
        await this.page.getByTestId('form-submit-button').click();
    }

    async expectNewTaskCreated(taskName){
        const taskInDashboard = this.page.getByTestId('tasks-pending-table').getByRole('row').filter({hasText: taskName})
        //.getByRole('row', { name: new RegExp(taskName, 'i') });
        await taskInDashboard.scrollIntoViewIfNeeded();
        await expect(taskInDashboard).toBeVisible();
    }
}
