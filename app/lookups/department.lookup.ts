import type { IDepartment } from "~/api/types/types";
import { buildLookupPayload, LOOKUP_COLUMNS } from "~/constants";
import { searchDepartments } from "~/services/departments.service";
import type {
    IFetchParams,
    IFetchResult,
    IPickerColumn,
} from "~/components/Common/ListPickerModal";
import type { ILookupDefinition } from "~/components/Common/LookupField";

export type IDepartmentLookupRow = IDepartment & Record<string, unknown>;

const DepartmentLookupColumns: IPickerColumn<IDepartmentLookupRow>[] = [...LOOKUP_COLUMNS.department];

async function fetchDepartmentLookupData(params: IFetchParams): Promise<IFetchResult<IDepartmentLookupRow>>
{
    const response = await searchDepartments(buildLookupPayload("department", params));

    return {
        currentPage: response.pagination.currentPage,
        data: response.data as IDepartmentLookupRow[],
        hasNext: response.pagination.hasNext,
        hasPrevious: response.pagination.hasPrevious,
        pageItemCount: response.pagination.pageSize,
        total: response.pagination.totalCount,
        totalPages: response.pagination.totalPages,
    };
}

export const DepartmentLookupDefinition: ILookupDefinition<IDepartmentLookupRow> = {
    columns: DepartmentLookupColumns,
    emptyDefault: "No departments found.",
    emptySearch: "No matching departments found.",
    fetchData: fetchDepartmentLookupData,
    itemName: "department",
    searchPlaceholder: "Search code or department name...",
    title: "Select Department",
};
