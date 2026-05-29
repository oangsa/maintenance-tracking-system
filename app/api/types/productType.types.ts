import type { IDepartment } from "./department.types";

export interface IProductType {
    id: number;
    code: string;
    name: string;
    description?: string;
    departmentId: number;
    departmentCode: string;
    departmentName: string;
    createdAt?: string;
    updatedAt?: string;
    createdBy: string | null;
    updatedBy: string | null;
}

export interface IProductTypeForCreate {
    code: string;
    name: string;
    description?: string;
    departmentId: number;
}

export interface IProductTypeForUpdate {
    code?: string;
    name?: string;
    description?: string;
    departmentId?: number;
}