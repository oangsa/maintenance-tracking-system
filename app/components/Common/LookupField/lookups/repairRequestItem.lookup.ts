import { buildLookupPayload, LOOKUP_COLUMNS } from "~/constants";
import { searchAllRepairRequestItems, searchRepairRequestItems } from "~/services/repairRequests.service";
import type {
    IFetchParams,
    IFetchResult,
    IPickerColumn,
} from "~/components/Common/ListPickerModal";
import type { ILookupDefinition } from "~/components/Common/LookupField";

export interface IRepairRequestItemLookupRow extends Record<string, unknown>
{
    id: number;
    description: string;
    product?: {
        code: string;
        name: string;
    };
    repairRequest?: {
        requestNo: string;
    };
}

const RepairRequestItemLookupColumns: IPickerColumn<IRepairRequestItemLookupRow>[] = LOOKUP_COLUMNS.repairRequestItem.map((col) =>
{
    if (col.key === "requestNo") return { ...col, render: (_value, row) => String(row.repairRequest?.requestNo ?? "-") };
    if (col.key === "productName") return { ...col, render: (_value, row) => String(row.product?.name ?? "-") };
    return col as IPickerColumn<IRepairRequestItemLookupRow>;
});

async function fetchRepairRequestItemLookupData(params: IFetchParams): Promise<IFetchResult<IRepairRequestItemLookupRow>>
{
    const response = await searchAllRepairRequestItems(buildLookupPayload("repairRequestItem", params));
    return {
        currentPage: response.pagination.currentPage,
        data: response.data as unknown as IRepairRequestItemLookupRow[],
        hasNext: response.pagination.hasNext,
        hasPrevious: response.pagination.hasPrevious,
        pageItemCount: response.pagination.pageSize,
        total: response.pagination.totalCount,
        totalPages: response.pagination.totalPages,
    };
}

export const RepairRequestItemLookupDefinition: ILookupDefinition<IRepairRequestItemLookupRow> = {
    columns: RepairRequestItemLookupColumns,
    emptyDefault: "No repair request items found.",
    emptySearch: "No matching items found.",
    fetchData: fetchRepairRequestItemLookupData,
    itemName: "repair request item",
    searchPlaceholder: "Search request no...",
    title: "Select Repair Request Item",
};