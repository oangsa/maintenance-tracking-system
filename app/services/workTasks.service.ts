import {
    searchWorkTasksRequest,
    getWorkTaskByIdRequest,
    createWorkTaskRequest,
    updateWorkTaskRequest,
} from "../api/workTasks.api";
import type {
    IWorkTask,
    IWorkTaskForCreate,
    IWorkTaskForUpdate,
    IPagedResult,
    ISearchRequest,
} from "../api/types/types";

export async function searchWorkTasks(params: ISearchRequest): Promise<IPagedResult<IWorkTask>>
{
    return searchWorkTasksRequest(params);
}

export async function getWorkTaskById(id: string): Promise<IWorkTask>
{
    return getWorkTaskByIdRequest(id);
}

export async function createWorkTask(data: IWorkTaskForCreate): Promise<IWorkTask>
{
    return createWorkTaskRequest(data);
}

export async function updateWorkTask(id: string, data: IWorkTaskForUpdate): Promise<IWorkTask>
{
    return updateWorkTaskRequest(id, data);
}
