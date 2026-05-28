import { http, httpPaginated } from "./http";
import type {
    IDeleteCollectionRequest,
    IPagedResult,
    IRepairRequest,
    IRepairRequestCountGroupByStatus,
    IRepairRequestForCreate,
    IRepairRequestForUpdate,
    IRepairRequestItem,
    IRepairRequestItemForCreate,
    IRepairRequestStatusLog,
    ISearchRequest,
    IWorkOrder,
    IMonthlyRepairTrendByProductTypeReport,
} from "./types/types";

const PREFIX = "/api/v1/repair-requests";

export async function searchRepairRequestsRequest(body: ISearchRequest): Promise<IPagedResult<IRepairRequest>>
{
    return httpPaginated<IRepairRequest>(`${PREFIX}/search`, {
        method: "POST",
        body: JSON.stringify(body),
    });
}

export async function createRepairRequestRequest(body: IRepairRequestForCreate): Promise<IRepairRequest>
{
    return http<IRepairRequest>(PREFIX, {
        method: "POST",
        body: JSON.stringify(body),
    });
}

export async function getRepairRequestByIdRequest(id: number): Promise<IRepairRequest>
{
    return http<IRepairRequest>(`${PREFIX}/${id}`);
}

export async function updateRepairRequestRequest(id: number, body: IRepairRequestForUpdate): Promise<IRepairRequest>
{
    return http<IRepairRequest>(`${PREFIX}/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
    });
}

export async function deleteRepairRequestRequest(id: number): Promise<void>
{
    return http<void>(`${PREFIX}/${id}`, {
        method: "DELETE",
    });
}

export async function searchRepairRequestItemsRequest(id: number, body: ISearchRequest): Promise<IPagedResult<IRepairRequestItem>>
{
    return httpPaginated<IRepairRequestItem>(`${PREFIX}/${id}/items/search`, {
        method: "POST",
        body: JSON.stringify(body),
    });
}

export async function createRepairRequestItemsRequest(id: number, body: IRepairRequestItemForCreate[]): Promise<IRepairRequestItem[]>
{
    return http<IRepairRequestItem[]>(`${PREFIX}/${id}/items`, {
        method: "POST",
        body: JSON.stringify(body),
    });
}

export async function getRepairRequestAuditsRequest(id: number): Promise<IRepairRequestStatusLog[]>
{
    return http<IRepairRequestStatusLog[]>(`${PREFIX}/${id}/audits`);
}

export async function searchRepairRequestWorkOrdersRequest(id: number, body: ISearchRequest): Promise<IPagedResult<IWorkOrder>>
{
    return httpPaginated<IWorkOrder>(`${PREFIX}/${id}/work-orders/search`, {
        method: "POST",
        body: JSON.stringify(body),
    });
}

export async function deleteRepairRequestCollectionRequest(body: IDeleteCollectionRequest): Promise<void>
{
    return http<void>(`${PREFIX}/collection`, {
        method: "DELETE",
        body: JSON.stringify(body),
    });
}


export async function getRepairRequestCountGroupByStatusRequest(body: ISearchRequest): Promise<IPagedResult<IRepairRequestCountGroupByStatus>>
{
    return httpPaginated<IRepairRequestCountGroupByStatus>(`${PREFIX}/reports/group-by-status/search`,
        {
            method: "POST",
            body: JSON.stringify(body),
        }
    );
}


export async function searchAllRepairRequestItemsRequest(body: ISearchRequest): Promise<IPagedResult<IRepairRequestItem>>
{
    return httpPaginated<IRepairRequestItem>("/api/v1/repair-request-items/search", {
        method: "POST",
        body: JSON.stringify(body),
    });
}

export async function getMonthlyRepairTrendByProductTypeReportRequest(body: ISearchRequest): Promise<IPagedResult<IMonthlyRepairTrendByProductTypeReport>>
{
    return httpPaginated<IMonthlyRepairTrendByProductTypeReport>(`${PREFIX}/reports/monthly-product-type/search`,
        {
            method: "POST",
            body: JSON.stringify(body),
        }
    );
}