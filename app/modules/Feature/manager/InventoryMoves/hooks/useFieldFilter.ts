import React from "react";
import type { ISearchCondition } from "~/api/types/types";
import type { IDataTableFilterField } from "~/components/Common/DataTable";

interface IInventoryMoveFilterValues
{
    [key: string]: string; 
}

interface IUseFieldFilterProps
{
    searchParams: URLSearchParams;
}

function getFilterValues(searchParams: URLSearchParams): IInventoryMoveFilterValues
{
    return {};
}

function buildFilterParams(filters: IInventoryMoveFilterValues): Record<string, string | undefined>
{
    return {};
}

function buildFilterSearch(filters: Record<string, string> | undefined): ISearchCondition[]
{
    const searchFilters: ISearchCondition[] = [];
    return searchFilters;
}

function normalizeFilters(filters: Record<string, string>): IInventoryMoveFilterValues
{
    return {};
}

export default function useFieldFilter({ searchParams }: IUseFieldFilterProps)
{
    const fieldFilters = React.useMemo<IDataTableFilterField[]>(() => [], []);

    const currentFilters = React.useMemo(() => getFilterValues(searchParams), [searchParams]);
    const currentFiltersRecord = React.useMemo<Record<string, string>>(() => ({ ...currentFilters }), [currentFilters]);

    return {
        buildFilterParams,
        buildFilterSearch,
        currentFilters,
        currentFiltersRecord,
        fieldFilters,
        normalizeFilters,
        searchTerm: "transactionNo",
    };
}

export type { IInventoryMoveFilterValues };