import {
    createDepartmentRequest,
    deleteDepartmentCollectionRequest,
    deleteDepartmentRequest,
    getDepartmentByIdRequest,
    searchDepartmentsRequest,
    updateDepartmentRequest,
} from "../api/departments.api";
import type {
    IDeleteCollectionRequest,
    IDepartment,
    IDepartmentForCreate,
    IDepartmentForUpdate,
    IPagedResult,
    ISearchRequest,
} from "../api/types/types";

export async function searchDepartments(params: ISearchRequest): Promise<IPagedResult<IDepartment>>
{
    return searchDepartmentsRequest(params);
}

export async function createDepartment(data: IDepartmentForCreate): Promise<IDepartment>
{
    return createDepartmentRequest(data);
}

export async function getDepartmentById(id: number): Promise<IDepartment>
{
    return getDepartmentByIdRequest(id);
}

export async function updateDepartment(id: number, data: IDepartmentForUpdate): Promise<IDepartment>
{
    return updateDepartmentRequest(id, data);
}

export async function deleteDepartment(id: number): Promise<void>
{
    return deleteDepartmentRequest(id);
}

export async function deleteDepartments(body: IDeleteCollectionRequest): Promise<void>
{
    return deleteDepartmentCollectionRequest(body);
}
