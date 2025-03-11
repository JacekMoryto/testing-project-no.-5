import { APIRequestContext } from '@playwright/test';

export async function getUsers(request: APIRequestContext, authEmail: string, authToken: string) {
    const response = await request.get('/users', {
        headers: {
            "X-Auth-Email": authEmail,
            "X-Auth-Token": authToken,
            "Accept": "application/json"
        }
    });

    if (response.status() !== 200) {
        throw new Error(`Failed to fetch users: ${response.status()}`);
    }

    return (await response.json()).users;
}

export async function createTask(request: APIRequestContext, assignedUserId: string, taskName: string, authEmail: string, authToken: string) {
    const response = await request.post('/tasks/', {
        data: {
            "assigned_user_id": assignedUserId,
            "title": taskName
        },
        headers: {
            "X-Auth-Email": authEmail,
            "X-Auth-Token": authToken,
            "Accept": "application/json"
        }
    });

    if (response.status() !== 200) {
        throw new Error(`Failed to create task: ${response.status()}`);
    }

    return await response.json();
}