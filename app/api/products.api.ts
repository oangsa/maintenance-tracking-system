import { http, httpPaginated } from "./http";
import type {
    IPagedResult,
    IProduct,
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

export async function getProductByIdRequest(id: number): Promise<IProduct>
{
    return http<IProduct>(`${PREFIX}/${id}`);
}
