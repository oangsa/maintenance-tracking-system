import { http, httpPaginated } from "./http";
import type {
    IDeleteCollectionRequest,
    IPagedResult,
    ISearchRequest,
    IProductType,
    IProductTypeForCreate,
    IProductTypeForUpdate,
} from "./types/types";

const PREFIX = "/api/v1/product-type";

export async function searchProductTypesRequest(body: ISearchRequest): Promise<IPagedResult<IProductType>>
{
    return httpPaginated<IProductType>(`${PREFIX}/search`, {
        method: "POST",
        body: JSON.stringify(body),
    });
}

export async function createProductTypeRequest(data: IProductTypeForCreate): Promise<IProductType>
{
    return http<IProductType>(PREFIX, {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function getProductTypeByIdRequest(id: number): Promise<IProductType>
{
    return http<IProductType>(`${PREFIX}/${id}`);
}

export async function updateProductTypeRequest(id: number, data: IProductTypeForUpdate): Promise<IProductType>
{
    return http<IProductType>(`${PREFIX}/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

export async function deleteProductTypeRequest(id: number): Promise<void>
{
    return http<void>(`${PREFIX}/${id}`, {
        method: "DELETE",
    });
}

export async function deleteProductTypeCollectionRequest(body: IDeleteCollectionRequest): Promise<void>
{
    return http<void>(`${PREFIX}/collection`, {
        method: "DELETE",
        body: JSON.stringify(body),
    });
}
