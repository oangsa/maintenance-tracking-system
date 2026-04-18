import {
    getProductByIdRequest,
    searchProductsRequest,
} from "../api/products.api";
import type {
    IPagedResult,
    IProduct,
    ISearchRequest,
} from "../api/types";

export async function searchProducts(params: ISearchRequest): Promise<IPagedResult<IProduct>>
{
    return searchProductsRequest(params);
}

export async function getProductById(id: number): Promise<IProduct>
{
    return getProductByIdRequest(id);
}
