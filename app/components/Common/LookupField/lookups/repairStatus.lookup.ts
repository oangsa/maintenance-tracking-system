import { buildLookupPayload, LOOKUP_COLUMNS } from "~/constants";
import { searchRepairStatuses } from "~/services/repairStatuses.service";
import type {
    IFetchParams,
    IFetchResult,
    IPickerColumn,
} from "~/components/Common/ListPickerModal";
import type { ILookupDefinition } from "~/components/Common/LookupField";

export interface IRepairStatusLookupRow extends Record<string, unknown>
{
    id: number;
    code: string;
    name: string;
}

const RepairStatusLookupColumns: IPickerColumn<IRepairStatusLookupRow>[] = [...LOOKUP_COLUMNS.repairStatus];

async function fetchRepairStatusLookupData(params: IFetchParams): Promise<IFetchResult<IRepairStatusLookupRow>>
{
    const response = await searchRepairStatuses(buildLookupPayload("repairStatus", params));

    return {
        currentPage: response.pagination.currentPage,
        data: response.data as unknown as IRepairStatusLookupRow[],
        hasNext: response.pagination.hasNext,
        hasPrevious: response.pagination.hasPrevious,
        pageItemCount: response.pagination.pageSize,
        total: response.pagination.totalCount,
        totalPages: response.pagination.totalPages,
    };
}

export const RepairStatusLookupDefinition: ILookupDefinition<IRepairStatusLookupRow> = {
    columns: RepairStatusLookupColumns,
    emptyDefault: "No repair statuses found.",
    emptySearch: "No matching statuses found.",
    fetchData: fetchRepairStatusLookupData,
    itemName: "repair status",
    searchPlaceholder: "Search code or name...",
    title: "Select Repair Status",
};