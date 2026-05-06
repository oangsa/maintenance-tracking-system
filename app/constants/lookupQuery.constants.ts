import type { ISearchCondition, ISearchRequest } from "~/api/types/types";

export interface ILookupFetchParams
{
    searchTerm: string;
    page: number;
    limit: number;
    search?: ISearchCondition[];
    sortBy?: string;
    sortDir?: "asc" | "desc";
}

export const LOOKUP_ORDER_BY = {
    department: "code asc",
    product: "code asc",
    repairRequestItem: "id asc",
    repairRequestItemStatus: "id asc",
    repairStatus: "order_sequence asc",
    part: "code asc",
    productType: "code asc",
} as const;

export const LOOKUP_SEARCH_FIELDS: Record<keyof typeof LOOKUP_ORDER_BY, string> = {
    department: "code,name",
    product: "code,name",
    repairRequestItem: "id",
    repairRequestItemStatus: "code,name",
    repairStatus: "code,name",
    part: "code,name",
    productType: "code,name",
};

type TLookupKey = keyof typeof LOOKUP_ORDER_BY;

function buildLookupOrderBy(lookupKey: TLookupKey, params: ILookupFetchParams): string
{
    if (!params.sortBy)
    {
        return LOOKUP_ORDER_BY[lookupKey];
    }

    return `${params.sortBy} ${params.sortDir === "desc" ? "desc" : "asc"}`;
}

export function buildLookupPayload(lookupKey: TLookupKey, params: ILookupFetchParams): ISearchRequest
{
    return {
        deleted: false,
        orderBy: buildLookupOrderBy(lookupKey, params),
        pageNumber: params.page,
        pageSize: params.limit,
        search: params.search,
        searchTerm: params.searchTerm
            ? {
                name: LOOKUP_SEARCH_FIELDS[lookupKey],
                value: params.searchTerm,
            }
            : undefined,
    };
}
