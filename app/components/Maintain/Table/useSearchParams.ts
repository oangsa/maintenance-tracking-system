import React from "react";
import { buildListSearchParams, parsePositiveIntegerParam } from "~/lib/pageUtils";

interface ISetSearchParamsOptions
{
    replace?: boolean;
}

interface IUseTableSearchParamsProps<TFilters extends object = Record<string, string>>
{
    searchParams: URLSearchParams;
    setSearchParams: (nextSearchParams: URLSearchParams, options?: ISetSearchParamsOptions) => void;
    currentFilters?: TFilters;
    buildFilterParams?: (filters: TFilters) => Record<string, string | undefined>;
    normalizeFilters?: (filters: Record<string, string>) => TFilters;
}

function resolveExtraParams<TFilters extends object>(
    currentFilters: TFilters | undefined,
    buildFilterParams: ((filters: TFilters) => Record<string, string | undefined>) | undefined,
): Record<string, string | undefined> | undefined
{
    if (!currentFilters || !buildFilterParams)
    {
        return undefined;
    }

    return buildFilterParams(currentFilters);
}

export default function useTableSearchParams<TFilters extends object = Record<string, string>>({
    searchParams,
    setSearchParams,
    currentFilters,
    buildFilterParams,
    normalizeFilters,
}: IUseTableSearchParamsProps<TFilters>)
{
    const currentPage = parsePositiveIntegerParam(searchParams.get("page"));
    const currentSearch = searchParams.get("search") ?? "";

    React.useEffect(() =>
    {
        if (searchParams.get("page") === String(currentPage))
        {
            return;
        }

        setSearchParams(buildListSearchParams(searchParams, {
            extraParams: resolveExtraParams(currentFilters, buildFilterParams),
            page: currentPage,
            search: currentSearch,
        }), { replace: true });
    }, [buildFilterParams, currentFilters, currentPage, currentSearch, searchParams, setSearchParams]);

    const handleSearchChange = React.useCallback((nextSearch: string) =>
    {
        setSearchParams(buildListSearchParams(searchParams, {
            extraParams: resolveExtraParams(currentFilters, buildFilterParams),
            page: 1,
            search: nextSearch,
        }), { replace: true });
    }, [buildFilterParams, currentFilters, searchParams, setSearchParams]);

    const handleCurrentPageChange = React.useCallback((nextPage: number) =>
    {
        setSearchParams(buildListSearchParams(searchParams, {
            extraParams: resolveExtraParams(currentFilters, buildFilterParams),
            page: nextPage,
            search: currentSearch,
        }));
    }, [buildFilterParams, currentFilters, currentSearch, searchParams, setSearchParams]);

    const handleFilterChange = React.useCallback((nextFilters: Record<string, string>) =>
    {
        if (!normalizeFilters || !buildFilterParams)
        {
            return;
        }

        const normalizedFilters = normalizeFilters(nextFilters);

        setSearchParams(buildListSearchParams(searchParams, {
            extraParams: buildFilterParams(normalizedFilters),
            page: 1,
            search: currentSearch,
        }), { replace: true });
    }, [buildFilterParams, currentSearch, normalizeFilters, searchParams, setSearchParams]);

    return {
        currentPage,
        currentSearch,
        handleCurrentPageChange,
        handleFilterChange,
        handleSearchChange,
    };
}
