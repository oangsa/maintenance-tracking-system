import {
    createRepairStatusRequest,
    deleteRepairStatusCollectionRequest,
    deleteRepairStatusRequest,
    getRepairStatusByIdRequest,
    searchRepairStatusesRequest,
    updateRepairStatusRequest
} from "../api/repairStatuses.api";
import type {
    IPagedResult,
    IRepairStatus,
    ISearchRequest,
    IDeleteCollectionRequest,
    IRepairStatusForCreate,
    IRepairStatusForUpdate
} from "../api/types/types";

export async function searchRepairStatuses(params: ISearchRequest): Promise<IPagedResult<IRepairStatus>>
{
    return searchRepairStatusesRequest(params);
}

export async function getRepairStatusById(id: number): Promise<IRepairStatus>
{
    return getRepairStatusByIdRequest(id);
}

export async function createRepairStatus(data: IRepairStatusForCreate): Promise<IRepairStatus>
{
    return createRepairStatusRequest(data);
}

export async function updateRepairStatus(id: number, data: IRepairStatusForUpdate): Promise<IRepairStatus>
{
    return updateRepairStatusRequest(id, data);
}

export async function deleteRepairStatus(id: number): Promise<void>
{
    return deleteRepairStatusRequest(id);
}

export async function deleteRepairStatuses(body: IDeleteCollectionRequest): Promise<void>
{
    return deleteRepairStatusCollectionRequest(body);
}
