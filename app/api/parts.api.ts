import { http, httpPaginated } from "./http";
import type {
    IDeleteCollectionRequest,
    IPart,
    IPartForCreate,
    IPartForUpdate,
    IPagedResult,
    ISearchRequest,
} from "./types/types";

const PREFIX = "/api/v1/part";

export async function searchPartsRequest(body: ISearchRequest): Promise<IPagedResult<IPart>>
{
    return httpPaginated<IPart>(`${PREFIX}/search`, {
        method: "POST",
        body: JSON.stringify(body),
    });
}

export async function createPartRequest(body: IPartForCreate): Promise<IPart>
{
    return http<IPart>(PREFIX, {
        method: "POST",
        body: JSON.stringify(body),
    });
}

export async function getPartByIdRequest(id: number): Promise<IPart>
{
    return http<IPart>(`${PREFIX}/${id}`);
}

export async function updatePartRequest(id: number, body: IPartForUpdate): Promise<IPart>
{
    return http<IPart>(`${PREFIX}/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
    });
}

export async function deletePartRequest(id: number): Promise<void>
{
    return http<void>(`${PREFIX}/${id}`, {
        method: "DELETE",
    });
}

export async function deletePartCollectionRequest(body: IDeleteCollectionRequest): Promise<void>
{
    return http<void>(`${PREFIX}/collection`, {
        method: "DELETE",
        body: JSON.stringify(body),
    });
}