import React from "react";
import type { ISearchCondition } from "~/api/types";
import type { IDataTableFilterField } from "~/components/Common/DataTable";
import { PRIORITY_OPTIONS as priorityOptions } from "@/constants";
import { formatTitleCase } from "~/lib/formatters";

interface IRepairRequestFilterValues
{
    priority: string;
}

interface IUseFieldFilterProps
{
    searchParams: URLSearchParams;
}

const FILTER_PARAM_KEYS = {
    priority: "filterPriority",
} as const;

const REQUEST_NO_SEARCH_TERM = "request_no";

function getFilterValues(searchParams: URLSearchParams): IRepairRequestFilterValues
{
    return {
        priority: searchParams.get(FILTER_PARAM_KEYS.priority) ?? "",
    };
}

function buildFilterParams(filters: IRepairRequestFilterValues): Record<string, string | undefined>
{
    return {
        [FILTER_PARAM_KEYS.priority]: filters.priority,
    };
}

function buildFilterSearch(filters: Record<string, string> | undefined, requesterId: number): ISearchCondition[]
{
    const searchFilters: ISearchCondition[] = [
        {
            condition: "EQUAL",
            name: "requester_id",
            value: String(requesterId),
        },
    ];

    if (filters?.priority?.trim())
    {
        searchFilters.push({
            condition: "EQUAL",
            name: "priority",
            value: filters.priority.trim(),
        });
    }

    return searchFilters;
}

function normalizeFilters(filters: Record<string, string>): IRepairRequestFilterValues
{
    return {
        priority: filters.priority ?? "",
    };
}

export default function useFieldFilter({ searchParams }: IUseFieldFilterProps)
{
    const fieldFilters = React.useMemo<IDataTableFilterField[]>(() => [
        {
            key: "priority",
            label: "Priority",
            options: priorityOptions.map((priority) => ({
                label: formatTitleCase(priority),
                value: priority,
            })),
            type: "select",
        },
    ], []);

    const currentFilters = React.useMemo(() => getFilterValues(searchParams), [searchParams]);
    const currentFiltersRecord = React.useMemo<Record<string, string>>(() => ({ ...currentFilters }), [currentFilters]);

    return {
        buildFilterParams,
        buildFilterSearch,
        currentFilters,
        currentFiltersRecord,
        fieldFilters,
        normalizeFilters,
        searchTerm: REQUEST_NO_SEARCH_TERM,
    };
}

export type { IRepairRequestFilterValues };
