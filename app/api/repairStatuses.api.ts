import { http, httpPaginated } from "./http";
import type {
    IPagedResult,
    IRepairStatus,
    ISearchRequest,
} from "./types";

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
