import { http, httpPaginated } from "./http";
import type { 
    IPagedResult, 
    IRepairStatus, 
    ISearchRequest,
    IDeleteCollectionRequest,
    IRepairStatusForCreate,
    IRepairStatusForUpdate
} from "./types/types";

const PREFIX = "/api/v1/repair-status";

export async function searchRepairStatusesRequest(body: ISearchRequest): Promise<IPagedResult<IRepairStatus>>
{
    return httpPaginated<IRepairStatus>(`${PREFIX}/search`, {
        method: "POST",
        body: JSON.stringify(body),
    });
}

export async function getRepairStatusByIdRequest(id: number): Promise<IRepairStatus>
{
    return http<IRepairStatus>(`${PREFIX}/${id}`);
}

export async function createRepairStatusRequest(body: IRepairStatusForCreate): Promise<IRepairStatus>
{
    return http<IRepairStatus>(PREFIX, {
        method: "POST",
        body: JSON.stringify(body),
    });
}

export async function updateRepairStatusRequest(id: number, body: IRepairStatusForUpdate): Promise<IRepairStatus>
{
    return http<IRepairStatus>(`${PREFIX}/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
    });
}

export async function deleteRepairStatusRequest(id: number): Promise<void>
{
    return http<void>(`${PREFIX}/${id}`, {
        method: "DELETE",
    });
}

export async function deleteRepairStatusCollectionRequest(body: IDeleteCollectionRequest): Promise<void>
{
    return http<void>(`${PREFIX}/collection`, {
        method: "DELETE",
        body: JSON.stringify(body),
    });
}
