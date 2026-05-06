import type { IPart } from "~/api/types/types";
import { buildLookupPayload, LOOKUP_COLUMNS } from "~/constants";
import { searchParts } from "~/services/parts.service";
import type {
    IFetchParams,
    IFetchResult,
    IPickerColumn,
} from "~/components/Common/ListPickerModal";
import type { ILookupDefinition } from "~/components/Common/LookupField";

export type IPartLookupRow = IPart & Record<string, unknown>;

const PartLookupColumns: IPickerColumn<IPartLookupRow>[] = [...LOOKUP_COLUMNS.part];

async function fetchPartLookupData(params: IFetchParams): Promise<IFetchResult<IPartLookupRow>>
{
    const response = await searchParts(buildLookupPayload("part", params));

    return {
        currentPage: response.pagination.currentPage,
        data: response.data as IPartLookupRow[],
        hasNext: response.pagination.hasNext,
        hasPrevious: response.pagination.hasPrevious,
        pageItemCount: response.pagination.pageSize,
        total: response.pagination.totalCount,
        totalPages: response.pagination.totalPages,
    };
}

export const PartLookupDefinition: ILookupDefinition<IPartLookupRow> = {
    columns: PartLookupColumns,
    emptyDefault: "No parts found.",
    emptySearch: "No matching parts found.",
    fetchData: fetchPartLookupData,
    itemName: "part",
    searchPlaceholder: "Search code or part name...",
    title: "Select Part",
};