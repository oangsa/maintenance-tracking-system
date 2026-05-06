import React from "react";
import type { ISearchCondition } from "~/api/types/types";
import type { IDataTableFilterField } from "~/components/Common/DataTable";
import {
    DATA_TABLE_FILTER_TYPE,
    PRIORITY_OPTIONS,
    REPAIR_REQUEST_FIELD_FILTER,
    SEARCH_OPERATOR,
} from "~/constants";
import { formatTitleCase } from "~/lib/formatters";
import { searchRepairStatuses } from "@/services/repairStatuses.service";


interface IRepairRequestFilterValues
{
    priority: string;
    status: string;
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

function getFilterValues(searchParams: URLSearchParams): IRepairRequestFilterValues
{
    return {
        priority: searchParams.get(REPAIR_REQUEST_FIELD_FILTER.PARAM_KEY.PRIORITY) ?? "",
        status: searchParams.get(REPAIR_REQUEST_FIELD_FILTER.PARAM_KEY.STATUS) ?? "",
    };
}

function buildFilterParams(filters: IRepairRequestFilterValues): Record<string, string | undefined>
{
    return {
        [REPAIR_REQUEST_FIELD_FILTER.PARAM_KEY.PRIORITY]: filters.priority,
        [REPAIR_REQUEST_FIELD_FILTER.PARAM_KEY.STATUS]: filters.status,
    };
}

function buildFilterSearch(filters: Record<string, string> | undefined, requesterId: number): ISearchCondition[]
{
    const searchFilters: ISearchCondition[] = [
        {
            condition: SEARCH_OPERATOR.EQUAL,
            name: REPAIR_REQUEST_FIELD_FILTER.SEARCH_FIELD.REQUESTER_ID,
            value: String(requesterId),
        },
    ];

    if (filters?.priority?.trim())
    {
        searchFilters.push({
            condition: SEARCH_OPERATOR.EQUAL,
            name: REPAIR_REQUEST_FIELD_FILTER.SEARCH_FIELD.PRIORITY,
            value: filters.priority.trim(),
        });
    }

    if (filters?.status?.trim())
    {
        searchFilters.push({
            condition: SEARCH_OPERATOR.EQUAL,
            name: REPAIR_REQUEST_FIELD_FILTER.SEARCH_FIELD.STATUS,
            value: filters.status.trim(),
        });
    }

    return searchFilters;
}

function normalizeFilters(filters: Record<string, string>): IRepairRequestFilterValues
{
    return {
        priority: filters.priority ?? "",
        status: filters.status ?? "",
    };
}


async function getStatusFilterValue(): Promise<IStatusOption[]>
{
    const statusOptions: IStatusOption[] = [];

    const statusesResponse = await searchRepairStatuses(
        {
            pageNumber: 1,
            pageSize: 9999,
        }
    );

    if (statusesResponse.data)
    {
        const matchedStatus = statusesResponse.data;
        matchedStatus.forEach((status) =>
        {
            statusOptions.push({
                label: status.name,
                value: status.code,
            });
        });
    }

    return statusOptions;
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
            key: REPAIR_REQUEST_FIELD_FILTER.FIELD_KEY.PRIORITY,
            label: REPAIR_REQUEST_FIELD_FILTER.LABEL.PRIORITY,
            options: PRIORITY_OPTIONS.map((priority) => ({
                label: formatTitleCase(priority),
                value: priority,
            })),
            type: DATA_TABLE_FILTER_TYPE.SELECT,
        },
        {
            key: REPAIR_REQUEST_FIELD_FILTER.FIELD_KEY.STATUS,
            label: REPAIR_REQUEST_FIELD_FILTER.LABEL.STATUS,
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
        searchTerm: REPAIR_REQUEST_FIELD_FILTER.SEARCH_TERM,
    };
}

export type { IRepairRequestFilterValues };
