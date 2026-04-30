import {
    createRepairRequestItemsRequest,
    createRepairRequestRequest,
    deleteRepairRequestCollectionRequest,
    deleteRepairRequestRequest,
    getRepairRequestByIdRequest,
    getRepairRequestAuditsRequest,
    searchRepairRequestItemsRequest,
    searchRepairRequestWorkOrdersRequest,
    searchRepairRequestsRequest,
    updateRepairRequestRequest,
    getRepairRequestCountGroupByStatusRequest
} from "../api/repairRequests.api";
import type {
    IDeleteCollectionRequest,
    IPagedResult,
    IRepairRequest,
    IRepairRequestForCreate,
    IRepairRequestForUpdate,
    IRepairRequestItem,
    IRepairRequestItemForCreate,
    IRepairRequestStatusLog,
    ISearchRequest,
    IWorkOrder,
    IRepairRequestCountGroupByStatus
} from "../api/types/types";

export async function searchRepairRequests(params: ISearchRequest): Promise<IPagedResult<IRepairRequest>>
{
    return searchRepairRequestsRequest(params);
}

export async function createRepairRequest(data: IRepairRequestForCreate): Promise<IRepairRequest>
{
    return createRepairRequestRequest(data);
}

export async function getRepairRequestById(id: number): Promise<IRepairRequest>
{
    return getRepairRequestByIdRequest(id);
}

export async function updateRepairRequest(id: number, data: IRepairRequestForUpdate): Promise<IRepairRequest>
{
    return updateRepairRequestRequest(id, data);
}

export async function deleteRepairRequest(id: number): Promise<void>
{
    return deleteRepairRequestRequest(id);
}

export async function searchRepairRequestItems(id: number, params: ISearchRequest): Promise<IPagedResult<IRepairRequestItem>>
{
    return searchRepairRequestItemsRequest(id, params);
}

export async function createRepairRequestItems(id: number, data: IRepairRequestItemForCreate[]): Promise<IRepairRequestItem[]>
{
    return createRepairRequestItemsRequest(id, data);
}

export async function getRepairRequestAudits(id: number): Promise<IRepairRequestStatusLog[]>
{
    return getRepairRequestAuditsRequest(id);
}

export async function searchRepairRequestWorkOrders(id: number, params: ISearchRequest): Promise<IPagedResult<IWorkOrder>>
{
    return searchRepairRequestWorkOrdersRequest(id, params);
}

export async function deleteRepairRequests(body: IDeleteCollectionRequest): Promise<void>
{
    return deleteRepairRequestCollectionRequest(body);
}

export async function getRepairRequestCountGroupByStatus(params: ISearchRequest): Promise<IPagedResult<IRepairRequestCountGroupByStatus>>
{
    return getRepairRequestCountGroupByStatusRequest(params);
}
