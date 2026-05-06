import {
    createProductTypeRequest,
    deleteProductTypeCollectionRequest,
    deleteProductTypeRequest,
    getProductTypeByIdRequest,
    searchProductTypesRequest,
    updateProductTypeRequest,
} from "../api/productTypes.api";
import type {
    IDeleteCollectionRequest,
    IPagedResult,
    IProductType,
    IProductTypeForCreate,
    IProductTypeForUpdate,
    ISearchRequest,
} from "../api/types/types";

export async function searchProductTypes(params: ISearchRequest): Promise<IPagedResult<IProductType>>
{
    return searchProductTypesRequest(params);
}

export async function createProductType(data: IProductTypeForCreate): Promise<IProductType>
{
    return createProductTypeRequest(data);
}

export async function getProductTypeById(id: number): Promise<IProductType>
{
    return getProductTypeByIdRequest(id);
}

export async function updateProductType(id: number, data: IProductTypeForUpdate): Promise<IProductType>
{
    return updateProductTypeRequest(id, data);
}

export async function deleteProductType(id: number): Promise<void>
{
    return deleteProductTypeRequest(id);
}

export async function deleteProductTypes(body: IDeleteCollectionRequest): Promise<void>
{
    return deleteProductTypeCollectionRequest(body);
}
