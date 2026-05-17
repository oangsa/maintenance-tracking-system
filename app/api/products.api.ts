import { http, httpPaginated } from "./http";
import type {
    IPagedResult,
    IProduct,
    IProductForCreate,
    IProductForUpdate,
    ISearchRequest,
} from "./types/types";

const PREFIX = "/api/v1/product";

export async function searchProductsRequest(body: ISearchRequest): Promise<IPagedResult<IProduct>>
{
    return httpPaginated<IProduct>(`${PREFIX}/search`, {
        method: "POST",
        body: JSON.stringify(body),
    });
}

export async function getProductByIdRequest(id: string): Promise<IProduct>
{
    return http<IProduct>(`${PREFIX}/${id}`);
}

export async function createProductRequest(body: IProductForCreate): Promise<IProduct>
{
    return http<IProduct>(PREFIX, {
        method: "POST",
        body: JSON.stringify(body),
    });
}

export async function updateProductRequest(id: string, body: IProductForUpdate): Promise<IProduct>
{
    return http<IProduct>(`${PREFIX}/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
    });
}

export async function deleteProductRequest(id: string): Promise<void>
{
    return http<void>(`${PREFIX}/${id}`, {
        method: "DELETE",
    });
}

export async function deleteProductsCollectionRequest(ids: string[]): Promise<void>
{
    return http<void>(`${PREFIX}/collection`, {
        method: "DELETE",
        body: JSON.stringify(ids),
    });
}
