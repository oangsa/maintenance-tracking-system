import { http, httpPaginated } from "./http";
import type {
    IPagedResult,
    ISearchRequest,
    IDeleteCollectionRequest,
    IWorkOrderPart,
    IInventoryMove,
    IWorkOrderPartForCreate,
    IWorkOrderPartForUpdate,
} from "./types/types";

const PREFIX = "/api/v1/work-order-part";

export async function searchWorkOrderPartsRequest(body: ISearchRequest): Promise<IPagedResult<IWorkOrderPart>>
{
    return httpPaginated<IWorkOrderPart>(`${PREFIX}/search`, {
        method: "POST",
        body: JSON.stringify(body),
    });
}

export async function searchInventoryMovesRequest(body: ISearchRequest): Promise<IPagedResult<IInventoryMove>>
{
    return httpPaginated<IInventoryMove>(`/api/v1/inventory-move/search`, {
        method: "POST",
        body: JSON.stringify(body),
    });
}

export async function createWorkOrderPartRequest(body: IWorkOrderPartForCreate): Promise<IWorkOrderPart>
{
    return http<IWorkOrderPart>(PREFIX, {
        method: "POST",
        body: JSON.stringify(body),
    });
}

export async function getWorkOrderPartByIdRequest(id: number): Promise<IWorkOrderPart>
{
    return http<IWorkOrderPart>(`${PREFIX}/${id}`);
}

export async function updateWorkOrderPartRequest(id: number, body: IWorkOrderPartForUpdate): Promise<IWorkOrderPart>
{
    return http<IWorkOrderPart>(`${PREFIX}/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
    });
}

export async function deleteWorkOrderPartRequest(id: string): Promise<void>
{
    return http<void>(`${PREFIX}/${id}`, {
        method: "DELETE",
    });
}

export async function deleteWorkOrderPartCollectionRequest(body: IDeleteCollectionRequest): Promise<void>
{
    return http<void>(`${PREFIX}/collection`, {
        method: "DELETE",
        body: JSON.stringify(body),
    });
}
