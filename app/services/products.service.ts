import {
    createProductRequest,
    deleteProductRequest,
    deleteProductsCollectionRequest,
    getProductByIdRequest,
    searchProductsRequest,
    updateProductRequest,
} from "../api/products.api";
import type {
    IPagedResult,
    IProduct,
    IProductForCreate,
    IProductForUpdate,
    ISearchRequest,
} from "../api/types/types";

export async function searchProducts(params: ISearchRequest): Promise<IPagedResult<IProduct>>
{
    return searchProductsRequest(params);
}

export async function getProductById(id: string): Promise<IProduct>
{
    return getProductByIdRequest(id);
}

export async function createProduct(body: IProductForCreate): Promise<IProduct>
{
    return createProductRequest(body);
}

export async function updateProduct(id: string, body: IProductForUpdate): Promise<IProduct>
{
    return updateProductRequest(id, body);
}

export async function deleteProduct(id: number): Promise<void>
{
    return deleteProductRequest(String(id));
}

export async function deleteProductsCollection(ids: string[]): Promise<void>
{
    return deleteProductsCollectionRequest(ids);
}
