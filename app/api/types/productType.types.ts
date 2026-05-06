export interface IProductType
{
    id: number;
    code: string;
    name: string;
    departmentId: number;
    departmentCode: string;
    departmentName: string;
    createdAt: string | null;
    updatedAt: string | null;
    createdBy: string | null;
    updatedBy: string | null;
}

export interface IProductTypeForCreate
{
    code: string;
    name: string;
    departmentId: number;
}

export interface IProductTypeForUpdate
{
    code?: string;
    name?: string;
    departmentId?: number;
}
