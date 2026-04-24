import type { ISearchRequest } from "~/api/types/types";

export interface ILookupFetchParams
{
    search: string;
    page: number;
    limit: number;
    sortBy?: string;
    sortDir?: "asc" | "desc";
}

export const LOOKUP_ORDER_BY = {
    department: "code asc",
    product: "code asc",
    repairRequestItem: "id asc",
    repairRequestItemStatus: "id asc",
    repairStatus: "order_sequence asc",
} as const;

export const LOOKUP_SEARCH_FIELDS: Record<keyof typeof LOOKUP_ORDER_BY, string> = {
    department: "code,name",
    product: "code,name",
    repairRequestItem: "id",
    repairRequestItemStatus: "code,name",
    repairStatus: "code,name",
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
        searchTerm: params.search
            ? {
                name: LOOKUP_SEARCH_FIELDS[lookupKey],
                value: params.search,
            }
            : undefined,
    };
}
