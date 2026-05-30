import { http, httpPaginated } from "./http";
import type {
    IDeleteCollectionRequest,
    IInventoryMove,
    IInventoryMoveForCreate,
    IPagedResult,
    ISearchRequest,
} from "./types/types";

const PREFIX = "/api/v1/inventory-move";

export async function searchInventoryMovesRequest(body: ISearchRequest): Promise<IPagedResult<IInventoryMove>>
{
    return httpPaginated<IInventoryMove>(`${PREFIX}/search`, {
        method: "POST",
        body: JSON.stringify(body),
    });
}

export async function createInventoryMoveRequest(body: IInventoryMoveForCreate): Promise<IInventoryMove>
{
    return http<IInventoryMove>(PREFIX, {
        method: "POST",
        body: JSON.stringify(body),
    });
}

export async function getInventoryMoveByIdRequest(id: number): Promise<IInventoryMove>
{
    return http<IInventoryMove>(`${PREFIX}/${id}`);
}

export async function reverseInventoryMoveRequest(id: number, body: IInventoryMoveForCreate): Promise<IInventoryMove>
{
    return http<IInventoryMove>(`${PREFIX}/${id}/reverse`, {
        method: "POST",
        body: JSON.stringify(body),
    });
}

export async function deleteInventoryMoveRequest(id: number): Promise<void>
{
    return http<void>(`${PREFIX}/${id}`, {
        method: "DELETE",
    });
}

export async function deleteInventoryMoveCollectionRequest(body: IDeleteCollectionRequest): Promise<void>
{
    return http<void>(`${PREFIX}/collection`, {
        method: "DELETE",
        body: JSON.stringify(body),
    });
}
