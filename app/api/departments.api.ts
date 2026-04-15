import { httpPaginated } from "./http";
import type { IDepartment, IPagedResult, ISearchRequest } from "./types";

const PREFIX = "/api/v1/department";

export async function searchDepartmentsRequest(body: ISearchRequest): Promise<IPagedResult<IDepartment>>
{
    return httpPaginated<IDepartment>(`${PREFIX}/search`, {
        method: "POST",
        body: JSON.stringify(body),
    });
}
