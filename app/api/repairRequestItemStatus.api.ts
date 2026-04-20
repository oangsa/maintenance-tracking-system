import { http, httpPaginated } from "./http";
import type { IPagedResult, IRepairRequestItemStatus, ISearchRequest, IRepairRequestItemStatusForCreate, IRepairRequestItemStatusForUpdate, IDeleteCollectionRequest } from "./types/types";

const PREFIX = "/api/v1/repair-request-item-status";

export async function searchRepairRequestItemStatusesRequest(body: ISearchRequest): Promise<IPagedResult<IRepairRequestItemStatus>>
{
    return httpPaginated<IRepairRequestItemStatus>(`${PREFIX}/search`, {
        method: "POST",
        body: JSON.stringify(body),
    });
}

export async function getRepairRequestItemStatusByIdRequest(id: number): Promise<IRepairRequestItemStatus>
{
    return http<IRepairRequestItemStatus>(`${PREFIX}/${id}`);
}

export async function createRepairRequestItemStatusRequest(body: IRepairRequestItemStatusForCreate): Promise<IRepairRequestItemStatus>
{
    return http<IRepairRequestItemStatus>(PREFIX, {
        method: "POST",
        body: JSON.stringify(body),
    });
}

export async function updateRepairRequestItemStatusRequest(id: number, body: IRepairRequestItemStatusForUpdate): Promise<IRepairRequestItemStatus>
{
    return http<IRepairRequestItemStatus>(`${PREFIX}/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
    });
}

export async function deleteRepairRequestItemStatusRequest(id: number): Promise<void>
{
    return http<void>(`${PREFIX}/${id}`, {
        method: "DELETE",
    });
}

export async function deleteRepairRequestItemStatusCollectionRequest(body: IDeleteCollectionRequest): Promise<void>
{
    return http<void>(`${PREFIX}/collection`, {
        method: "DELETE",
        body: JSON.stringify(body),
    });
}
