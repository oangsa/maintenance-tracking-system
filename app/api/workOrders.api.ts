import { http, httpPaginated } from "./http";
import type {
    IDeleteCollectionRequest,
    IWorkOrder,
    IWorkOrderForCreate,
    IWorkOrderForUpdate,
    IPagedResult,
    ISearchRequest,
} from "./types/types";

const PREFIX = "/api/v1/work-order";

export async function searchWorkOrdersRequest(body: ISearchRequest): Promise<IPagedResult<IWorkOrder>>
{
    return httpPaginated<IWorkOrder>(`${PREFIX}/search`, {
        method: "POST",
        body: JSON.stringify(body),
    });
}

export async function createWorkOrderRequest(body: IWorkOrderForCreate): Promise<IWorkOrder>
{
    return http<IWorkOrder>(PREFIX, {
        method: "POST",
        body: JSON.stringify(body),
    });
}

export async function getWorkOrderByIdRequest(id: number): Promise<IWorkOrder>
{
    return http<IWorkOrder>(`${PREFIX}/${id}`);
}

export async function updateWorkOrderRequest(id: number, body: IWorkOrderForUpdate): Promise<IWorkOrder>
{
    return http<IWorkOrder>(`${PREFIX}/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
    });
}

export async function deleteWorkOrderRequest(id: number): Promise<void>
{
    return http<void>(`${PREFIX}/${id}`, {
        method: "DELETE",
    });
}

export async function deleteWorkOrderCollectionRequest(body: IDeleteCollectionRequest): Promise<void>
{
    return http<void>(`${PREFIX}/collection`, {
        method: "DELETE",
        body: JSON.stringify(body),
    });
}

export async function searchWorkOrdersByRepairRequestIdRequest(repairRequestId: number, body: ISearchRequest): Promise<IPagedResult<IWorkOrder>>
{
    return httpPaginated<IWorkOrder>(`/api/v1/repair-requests/${repairRequestId}/work-orders/search`, {
        method: "POST",
        body: JSON.stringify(body),
    });
}