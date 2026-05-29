import { buildLookupPayload, LOOKUP_COLUMNS } from "~/constants";
import { searchAllRepairRequestItems, searchRepairRequestItems, searchRepairRequests } from "~/services/repairRequests.service";
import type {
    IFetchParams,
    IFetchResult,
    IPickerColumn,
} from "~/components/Common/ListPickerModal";
import type { ILookupDefinition } from "~/components/Common/LookupField";
import { buildOrderBy } from "~/lib/pageUtils";

export interface IRepairRequestItemLookupRow extends Record<string, unknown>
{
    id: number;
    description: string;
    repairRequestItemProductName?: string;
    repairRequestRequestNo?: string;
}

const RepairRequestItemLookupColumns: IPickerColumn<IRepairRequestItemLookupRow>[] = LOOKUP_COLUMNS.repairRequestItem.map((col) =>
{
    if (col.key === "requestNo") return { ...col, sortable: false, render: (_value, row) => String(row.repairRequestRequestNo ?? "-") };
    if (col.key === "productName") return { ...col, sortable: false, render: (_value, row) => String(row.repairRequestItemProductName ?? "-") };
    return col as IPickerColumn<IRepairRequestItemLookupRow>;
});

async function fetchRepairRequestItemLookupData(params: IFetchParams): Promise<IFetchResult<IRepairRequestItemLookupRow>>
{
    let actualSortColumn = params.sortBy;
    if (actualSortColumn === "requestNo" || actualSortColumn === "repairRequestRequestNo") {
        actualSortColumn = "repair_request_id";
    }
    const payload = buildLookupPayload("repairRequestItem", params);    
    payload.orderBy = buildOrderBy(actualSortColumn, params.sortDir, "id desc");
    payload.deleted = false;
    if (params.searchTerm) {
        const term = String(params.searchTerm).trim();
        const isNumeric = !isNaN(Number(term));

        if (isNumeric) {
            payload.search = [
                ...(payload.search || []), 
                { 
                    name: "repair_request_id", 
                    value: term, 
                    condition: "EQUAL" 
                }
            ];
            
            delete payload.searchTerm; 
        } else {
            payload.searchTerm = {
                name: "product_name", 
                value: term
            };
        }
    }




    const response = await searchAllRepairRequestItems(payload) as any;

    
    const mappedItems: IRepairRequestItemLookupRow[] = response.data.map((item: any) => ({
        id: item.id,
        description: item.description || "-",
        repairRequestItemProductName: item.productName || item.product?.name || item.productCode || "-",
        repairRequestRequestNo: item.requestNo || item.repairRequest?.requestNo || String(item.repairRequestId || "-")
    }));

    return {
        currentPage: response.pagination.currentPage,
        data: mappedItems, 
        hasNext: response.pagination.hasNext ,
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
    searchPlaceholder: "Search request no or product name...",
    title: "Select Repair Request Item",
};