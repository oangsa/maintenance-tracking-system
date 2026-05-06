import type { IProduct } from "~/api/types/types";
import { buildLookupPayload, LOOKUP_COLUMNS } from "~/constants";
import { searchProducts } from "~/services/products.service";
import type {
    IFetchParams,
    IFetchResult,
    IPickerColumn,
} from "~/components/Common/ListPickerModal";
import type { ILookupDefinition } from "~/components/Common/LookupField";

export type IProductLookupRow = IProduct & Record<string, unknown>;

const ProductLookupColumns: IPickerColumn<IProductLookupRow>[] = [...LOOKUP_COLUMNS.product];

async function fetchProductLookupData(params: IFetchParams): Promise<IFetchResult<IProductLookupRow>>
{
    const response = await searchProducts(buildLookupPayload("product", params));

    return {
        currentPage: response.pagination.currentPage,
        data: response.data as IProductLookupRow[],
        hasNext: response.pagination.hasNext,
        hasPrevious: response.pagination.hasPrevious,
        pageItemCount: response.pagination.pageSize,
        total: response.pagination.totalCount,
        totalPages: response.pagination.totalPages,
    };
}

export const ProductLookupDefinition: ILookupDefinition<IProductLookupRow> = {
    columns: ProductLookupColumns,
    emptyDefault: "No products found.",
    emptySearch: "No matching products found.",
    fetchData: fetchProductLookupData,
    itemName: "product",
    searchPlaceholder: "Search product code or name...",
    title: "Select Product",
};
