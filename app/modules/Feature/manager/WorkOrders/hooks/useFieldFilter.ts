import React from "react";
import type { ISearchCondition } from "~/api/types/types";
import type { IDataTableFilterField } from "~/components/Common/DataTable";
import { DATA_TABLE_FILTER_TYPE, SEARCH_OPERATOR, WORK_ORDER_FIELD_FILTER } from "~/constants";
import { searchRepairStatuses } from "~/services/repairStatuses.service";

interface IWorkOrderFilterValues
{
    statusId: string;
}

interface IUseFieldFilterProps
{
    searchParams: URLSearchParams;
}

interface IStatusOption
{
    label: string; // Status.name
    value: string; // Status.code
}

function getFilterValues(searchParams: URLSearchParams): IWorkOrderFilterValues
{
    return {
        statusId: searchParams.get(WORK_ORDER_FIELD_FILTER.PARAM_KEY.STATUS) ?? "",
    };
}

function buildFilterParams(filters: IWorkOrderFilterValues): Record<string, string | undefined>
{
    return {
        [WORK_ORDER_FIELD_FILTER.PARAM_KEY.STATUS]: filters.statusId,
    };
}

function buildFilterSearch(filters: Record<string, string> | undefined): ISearchCondition[]
{
    const searchFilters: ISearchCondition[] = [];

    if (filters?.statusId?.trim())
    {
        searchFilters.push({
            condition: SEARCH_OPERATOR.EQUAL,
            name: WORK_ORDER_FIELD_FILTER.SEARCH_FIELD.STATUS,
            value: filters.statusId.trim(),
        });
    }
    return searchFilters;
}

function normalizeFilters(filters: Record<string, string>): IWorkOrderFilterValues
{
    return {
        statusId: filters.statusId ?? "",
    };
}

async function getStatusFilterValue(): Promise<IStatusOption[]>
{
    try
    {
        const response = await searchRepairStatuses({
            pageNumber: 1,
            pageSize: 9999,
        });

        console.log(" Raw API Response (Status):", response);

        const list =
            Array.isArray(response) ? response :
            Array.isArray(response?.data) ? response.data :
            Array.isArray((response as any)?.data?.items) ? (response as any).data.items : [];

        if (list.length > 0)
        {
            return list.map((status: any) => ({
                label: status.name || "Unknown",
                value: String(status.id),
            }));
        }

        return [];
    }
    catch (error)
    {
        console.error("Failed to load status options:", error);
    }
    return [
        { label: "Requested", value: "1" },
        { label: "Approved", value: "2" },
        { label: "Processing", value: "3" },
        { label: "Completed", value: "4" },
    ];
}

export default function useFieldFilter({ searchParams }: IUseFieldFilterProps)
{
    const [statusOptions, setStatusOptions] = React.useState<IStatusOption[]>([]);

    React.useEffect(() =>
    {
        let cancelled = false;

        async function loadStatusOptions()
        {
            try
            {
                const options = await getStatusFilterValue();

                if (!cancelled)
                {
                    setStatusOptions(options);
                }
            }
            catch (error)
            {
                console.error("Failed to load status options for filter:", error);
                if (!cancelled)
                {
                    setStatusOptions([]);
                }
            }
        }

        void loadStatusOptions();

        return () =>
        {
            cancelled = true;
        };
    }, []);

    const fieldFilters = React.useMemo<IDataTableFilterField[]>(() => [
        {
            key: WORK_ORDER_FIELD_FILTER.FIELD_KEY.STATUS,
            label: WORK_ORDER_FIELD_FILTER.LABEL.STATUS,
            options: statusOptions.map((status) => ({
                label: status.label,
                value: status.value,
            })),
            type: DATA_TABLE_FILTER_TYPE.SELECT,
        }
    ], [statusOptions]);

    const currentFilters = React.useMemo(() => getFilterValues(searchParams), [searchParams]);
    const currentFiltersRecord = React.useMemo<Record<string, string>>(() => ({ ...currentFilters }), [currentFilters]);

    return {
        buildFilterParams,
        buildFilterSearch,
        currentFilters,
        currentFiltersRecord,
        fieldFilters,
        normalizeFilters,
        searchTerm: WORK_ORDER_FIELD_FILTER.SEARCH_TERM,
    };
}

export type { IWorkOrderFilterValues };
