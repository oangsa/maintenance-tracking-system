export interface IPart
{
    id: number;
    code: string;
    name: string;
    productTypeId: number;
    productTypeCode: string;
    productTypeName: string;
    totalStock: number;
    createdAt: string | null;
    updatedAt: string | null;
    createdBy: string | null;
    updatedBy: string | null;
}

export interface IPartForCreate
{
    code: string;
    name: string;
    productTypeId: number;
}

export interface IPartForUpdate
{
    code?: string;
    name?: string;
    productTypeId?: number;
}

export interface IPartStockConsumeRequest
{
    quantity: number;
    note?: string;
    workOrderPartId?: number;
}
