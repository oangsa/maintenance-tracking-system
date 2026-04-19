import React from "react";
import type { ISearchCondition } from "~/api/types";
import type { IDataTableFilterField } from "~/components/Common/DataTable";
import {
    DATA_TABLE_FILTER_TYPE,
    PRIORITY_OPTIONS,
    REPAIR_REQUEST_FIELD_FILTER,
    SEARCH_OPERATOR,
} from "~/constants";
import { formatTitleCase } from "~/lib/formatters";

interface IRepairRequestFilterValues
{
    priority: string;
}

interface IUseFieldFilterProps
{
    searchParams: URLSearchParams;
}

function getFilterValues(searchParams: URLSearchParams): IRepairRequestFilterValues
{
    return {
        priority: searchParams.get(REPAIR_REQUEST_FIELD_FILTER.PARAM_KEY.PRIORITY) ?? "",
    };
}

function buildFilterParams(filters: IRepairRequestFilterValues): Record<string, string | undefined>
{
    return {
        [REPAIR_REQUEST_FIELD_FILTER.PARAM_KEY.PRIORITY]: filters.priority,
    };
}

function buildFilterSearch(filters: Record<string, string> | undefined): ISearchCondition[]
{
    const searchFilters: ISearchCondition[] = [];

    if (filters?.priority?.trim())
    {
        searchFilters.push({
            condition: SEARCH_OPERATOR.EQUAL,
            name: REPAIR_REQUEST_FIELD_FILTER.SEARCH_FIELD.PRIORITY,
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
            key: REPAIR_REQUEST_FIELD_FILTER.FIELD_KEY.PRIORITY,
            label: REPAIR_REQUEST_FIELD_FILTER.LABEL.PRIORITY,
            options: PRIORITY_OPTIONS.map((priority) => ({
                label: formatTitleCase(priority),
                value: priority,
            })),
            type: DATA_TABLE_FILTER_TYPE.SELECT,
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
        searchTerm: REPAIR_REQUEST_FIELD_FILTER.SEARCH_TERM,
    };
}

export type { IRepairRequestFilterValues };
