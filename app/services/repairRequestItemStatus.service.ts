import {
    createRepairRequestItemStatusRequest,
    deleteRepairRequestItemStatusCollectionRequest,
    deleteRepairRequestItemStatusRequest,
    getRepairRequestItemStatusByIdRequest,
    searchRepairRequestItemStatusesRequest,
    updateRepairRequestItemStatusRequest,
} from "../api/repairRequestItemStatus.api";
import type {
    IDeleteCollectionRequest,
    IRepairRequestItemStatus,
    IRepairRequestItemStatusForCreate,
    IRepairRequestItemStatusForUpdate,
    IPagedResult,
    ISearchRequest,
} from "../api/types/types";

export async function searchRepairRequestItemStatus(params: ISearchRequest): Promise<IPagedResult<IRepairRequestItemStatus>>
{
    return searchRepairRequestItemStatusesRequest(params);
}

export async function createRepairRequestItemStatus(data: IRepairRequestItemStatusForCreate): Promise<IRepairRequestItemStatus>
{
    return createRepairRequestItemStatusRequest(data);
}

export async function getRepairRequestItemStatusById(id: number): Promise<IRepairRequestItemStatus>
{
    return getRepairRequestItemStatusByIdRequest(id);
}

export async function updateRepairRequestItemStatus(id: number, data: IRepairRequestItemStatusForUpdate): Promise<IRepairRequestItemStatus>
{
    return updateRepairRequestItemStatusRequest(id, data);
}

export async function deleteRepairRequestItemStatus(id: number): Promise<void>
{
    return deleteRepairRequestItemStatusRequest(id);
}

export async function deleteRepairRequestItemStatuss(body: IDeleteCollectionRequest): Promise<void>
{
    return deleteRepairRequestItemStatusCollectionRequest(body);
}
