import { searchDepartmentsRequest } from "../api/departments.api";
import type { IDepartment, IPagedResult, ISearchRequest } from "../api/types";

export async function searchDepartments(params: ISearchRequest): Promise<IPagedResult<IDepartment>>
{
    return searchDepartmentsRequest(params);
}
