export interface IProduct
{
    id: number;
    code: string;
    name: string;
    productTypeId: number;
    productTypeCode: string;
    productTypeName: string;
    createdAt: string | null;
    updatedAt: string | null;
    createdBy: string | null;
    updatedBy: string | null;
}

export interface IProductForCreate
{
    code: string;
    name: string;
    productTypeId: number;
}

export interface IProductForUpdate
{
    code?: string;
    name?: string;
    productTypeId?: number;
}
