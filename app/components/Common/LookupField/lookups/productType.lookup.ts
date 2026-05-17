import type { IProductType } from "~/api/types/types";
import { buildLookupPayload } from "~/constants/lookupQuery.constants";
import { searchProductTypes } from "~/services/productTypes.service";
import type {
    IFetchParams,
    IFetchResult,
    IPickerColumn,
} from "~/components/Common/ListPickerModal";
import type { ILookupDefinition } from "~/components/Common/LookupField";

export type IProductTypeLookupRow = IProductType & Record<string, unknown>;

const ProductTypeLookupColumns: IPickerColumn<IProductTypeLookupRow>[] = [
    { label: "Code", key: "code" },
    { label: "Name", key: "name" },
    { label: "Department", key: "departmentName" },
];

async function fetchProductTypeLookupData(params: IFetchParams): Promise<IFetchResult<IProductTypeLookupRow>>
{
    const response = await searchProductTypes(buildLookupPayload("productType", params));

    return {
        currentPage: response.pagination.currentPage,
        data: response.data as IProductTypeLookupRow[],
        hasNext: response.pagination.hasNext,
        hasPrevious: response.pagination.hasPrevious,
        pageItemCount: response.pagination.pageSize,
        total: response.pagination.totalCount,
        totalPages: response.pagination.totalPages,
    };
}

export const ProductTypeLookupDefinition: ILookupDefinition<IProductTypeLookupRow> = {
    columns: ProductTypeLookupColumns,
    emptyDefault: "No product types found.",
    emptySearch: "No matching product types found.",
    fetchData: fetchProductTypeLookupData,
    itemName: "product type",
    searchPlaceholder: "Search product type by code or name...",
    title: "Select Product Type",
};
