import { http, httpPaginated } from "./http";
import type {
  IWorkTask,
  IWorkTaskForCreate,
  IWorkTaskForUpdate,
  IPagedResult,
  ISearchRequest,
} from "./types/types";

const PREFIX = "/api/v1/work-task";

export async function searchWorkTasksRequest(body: ISearchRequest): Promise<IPagedResult<IWorkTask>>
{
    return httpPaginated<IWorkTask>(`${PREFIX}/search`, {
        method: "POST",
        body: JSON.stringify(body),
    });
}

export async function getWorkTaskByIdRequest(id: string): Promise<IWorkTask>
{
    return http<IWorkTask>(`${PREFIX}/${id}`);
}

export async function createWorkTaskRequest(body: IWorkTaskForCreate): Promise<IWorkTask>
{
    return http<IWorkTask>(PREFIX, {
        method: "POST",
        body: JSON.stringify(body),
    });
}

export async function updateWorkTaskRequest(id: string, body: IWorkTaskForUpdate): Promise<IWorkTask>
{
    return http<IWorkTask>(`${PREFIX}/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
    });
}
