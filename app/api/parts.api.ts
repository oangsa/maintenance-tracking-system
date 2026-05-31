import { http, httpPaginated } from "./http";
import type {
    IDeleteCollectionRequest,
    IPart,
    IPartForCreate,
    IPartForUpdate,
    IPartStockConsumeRequest,
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

export async function consumeStockRequest(id: number, body: IPartStockConsumeRequest): Promise<IPart>
{
    const payload: Record<string, unknown> = {
        quantity: body.quantity,
    };

    if (body.note)
    {
        payload.note = body.note;
    }

    if (typeof body.workOrderPartId === "number" && Number.isFinite(body.workOrderPartId) && body.workOrderPartId > 0)
    {
        // Keep both keys for backend compatibility across camel/snake parsing.
        payload.workOrderPartId = body.workOrderPartId;
        payload.work_order_part_id = body.workOrderPartId;
    }

    return http<IPart>(`${PREFIX}/${id}/consume-stock`, {
        method: "POST",
        body: JSON.stringify(payload),
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
