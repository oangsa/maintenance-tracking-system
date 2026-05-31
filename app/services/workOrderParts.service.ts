import {
    searchWorkOrderPartsRequest,
    createWorkOrderPartRequest,
    getWorkOrderPartByIdRequest,
    updateWorkOrderPartRequest,
    deleteWorkOrderPartRequest,
    deleteWorkOrderPartCollectionRequest,
    searchInventoryMovesRequest,
} from "../api/workOrderParts.api";

import type {
    IPagedResult,
    ISearchRequest,
    IDeleteCollectionRequest,
    IWorkOrderPart,
    IInventoryMove,
    IWorkOrderPartForCreate,
    IWorkOrderPartForUpdate,
} from "../api/types/types";

export async function searchWorkOrderParts(params: ISearchRequest): Promise<IPagedResult<IWorkOrderPart>>
{
    return searchWorkOrderPartsRequest(params);
}

export async function createWorkOrderPart(data: IWorkOrderPartForCreate): Promise<IWorkOrderPart>
{
    return createWorkOrderPartRequest(data);
}

export async function getWorkOrderPartById(id: number): Promise<IWorkOrderPart>
{
    return getWorkOrderPartByIdRequest(id);
}

export async function updateWorkOrderPart(id: number, data: IWorkOrderPartForUpdate): Promise<IWorkOrderPart>
{
    return updateWorkOrderPartRequest(id, data);
}

export async function deleteWorkOrderPart(id: string): Promise<void>
{
    return deleteWorkOrderPartRequest(id);
}

export async function deleteWorkOrderParts(body: IDeleteCollectionRequest): Promise<void>
{
    return deleteWorkOrderPartCollectionRequest(body);
}

export async function searchInventoryMoves(params: ISearchRequest): Promise<IPagedResult<IInventoryMove>>
{
    return searchInventoryMovesRequest(params);
}
