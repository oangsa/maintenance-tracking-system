import {
    searchInventoryMovesRequest,
    createInventoryMoveRequest,
    getInventoryMoveByIdRequest,
    reverseInventoryMoveRequest,
    deleteInventoryMoveRequest,
    deleteInventoryMoveCollectionRequest,
} from "../api/inventoryMoves.api";

import type {
    IDeleteCollectionRequest,
    IInventoryMove,
    IInventoryMoveForCreate,
    IPagedResult,
    ISearchRequest,
} from "../api/types/types";

export async function searchInventoryMoves(params: ISearchRequest): Promise<IPagedResult<IInventoryMove>>
{
    return searchInventoryMovesRequest(params);
}

export async function createInventoryMove(data: IInventoryMoveForCreate): Promise<IInventoryMove>
{
    return createInventoryMoveRequest(data);
}

export async function getInventoryMoveById(id: number): Promise<IInventoryMove>
{
    return getInventoryMoveByIdRequest(id);
}

export async function reverseInventoryMove(id: number, body: IInventoryMoveForCreate): Promise<IInventoryMove>
{
    return reverseInventoryMoveRequest(id, body);
}

export async function deleteInventoryMove(id: number): Promise<void>
{
    return deleteInventoryMoveRequest(id);
}

export async function deleteInventoryMoves(body: IDeleteCollectionRequest): Promise<void>
{
    return deleteInventoryMoveCollectionRequest(body);
}
