import { http, httpPaginated } from "./http";
import type {
    IDeleteCollectionRequest,
    IDepartment,
    IDepartmentForCreate,
    IDepartmentForUpdate,
    IPagedResult,
    ISearchRequest,
} from "./types";

const PREFIX = "/api/v1/department";

export async function searchDepartmentsRequest(body: ISearchRequest): Promise<IPagedResult<IDepartment>>
{
    return httpPaginated<IDepartment>(`${PREFIX}/search`, {
        method: "POST",
        body: JSON.stringify(body),
    });
}

export async function createDepartmentRequest(body: IDepartmentForCreate): Promise<IDepartment>
{
    return http<IDepartment>(PREFIX, {
        method: "POST",
        body: JSON.stringify(body),
    });
}

export async function getDepartmentByIdRequest(id: number): Promise<IDepartment>
{
    return http<IDepartment>(`${PREFIX}/${id}`);
}

export async function updateDepartmentRequest(id: number, body: IDepartmentForUpdate): Promise<IDepartment>
{
    return http<IDepartment>(`${PREFIX}/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
    });
}

export async function deleteDepartmentRequest(id: number): Promise<void>
{
    return http<void>(`${PREFIX}/${id}`, {
        method: "DELETE",
    });
}

export async function deleteDepartmentCollectionRequest(body: IDeleteCollectionRequest): Promise<void>
{
    return http<void>(`${PREFIX}/collection`, {
        method: "DELETE",
        body: JSON.stringify(body),
    });
}
