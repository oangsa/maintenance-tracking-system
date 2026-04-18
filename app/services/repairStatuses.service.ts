import {
    getRepairStatusByIdRequest,
    searchRepairStatusesRequest,
} from "../api/repairStatuses.api";
import type {
    IPagedResult,
    IRepairStatus,
    ISearchRequest,
} from "../api/types";

export async function searchRepairStatuses(params: ISearchRequest): Promise<IPagedResult<IRepairStatus>>
{
    return searchRepairStatusesRequest(params);
}

export async function getRepairStatusById(id: number): Promise<IRepairStatus>
{
    return getRepairStatusByIdRequest(id);
}
