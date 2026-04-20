import { http, httpPaginated } from "./http";
import type { IPagedResult, IRepairRequestItemStatus, ISearchRequest } from "./types/types";

const PREFIX = "/api/v1/repair-request-item-status";

export async function searchRepairRequestItemStatusesRequest(body: ISearchRequest): Promise<IPagedResult<IRepairRequestItemStatus>>
{
    return httpPaginated<IRepairRequestItemStatus>(`${PREFIX}/search`, {
        method: "POST",
        body: JSON.stringify(body),
    });
}

export async function getRepairStatusByIdRequest(id: number): Promise<IRepairRequestItemStatus>
{
    return http<IRepairRequestItemStatus>(`${PREFIX}/${id}`);
}
