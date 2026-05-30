import {
    createPartRequest,
    getPartByIdRequest,
    updatePartRequest,
    deletePartRequest,
    deletePartCollectionRequest,
    searchPartsRequest,
    consumeStockRequest,
    type IConsumeStockPayload,
} from "../api/parts.api";

import type {
    IDeleteCollectionRequest,
    IPart,
    IPartForCreate,
    IPartForUpdate,
    IPagedResult,
    ISearchRequest,
} from "../api/types/types";

export async function searchParts(params: ISearchRequest): Promise<IPagedResult<IPart>>
{
    return searchPartsRequest(params);
}

export async function createPart(data: IPartForCreate): Promise<IPart>
{
    return createPartRequest(data);
}

export async function getPartById(id: number): Promise<IPart>
{
    return getPartByIdRequest(id);
}

export async function updatePart(id: number, data: IPartForUpdate): Promise<IPart>
{
    return updatePartRequest(id, data);
}

export async function deletePart(id: number): Promise<void>
{
    return deletePartRequest(id);
}

export async function deleteParts(body: IDeleteCollectionRequest): Promise<void>
{
    return deletePartCollectionRequest(body);
}

export async function consumeStock(id: number, payload: IConsumeStockPayload): Promise<void>
{
    return consumeStockRequest(id, payload);
}