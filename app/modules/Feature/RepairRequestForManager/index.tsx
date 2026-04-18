import React from "react";
import { useSearchParams } from "react-router";
import DataTable from "~/components/Common/DataTable";
import { buildListSearchParams, buildOrderBy, parsePositiveIntegerParam } from "~/lib/pageUtils";
import { searchRepairRequests } from "~/services/repairRequests.service";
import useColumns, { type IRepairRequestTableRow } from "./useColumns";
import useFieldFilter from "./useFieldFilter";

interface IFetchParams
{
    searchTerm: string;
    page: number;
    limit: number;
    search?: Record<string, string>;
    sortBy?: string;
    sortDir?: "asc" | "desc";
}

interface IFetchResult
{
    data: IRepairRequestTableRow[];
    total: number;
    totalPages: number;
    pageItemCount: number;
    currentPage: number;
    hasNext: boolean;
    hasPrevious: boolean;
}

export default function RepairRequestManagerListPage()
{
    const [searchParams, setSearchParams] = useSearchParams();
    const columns = useColumns();
    const currentPage = parsePositiveIntegerParam(searchParams.get("page"));
    const currentSearch = searchParams.get("search") ?? "";
        const {
        buildFilterParams,
        buildFilterSearch,
        currentFilters,
        currentFiltersRecord,
        fieldFilters,
        normalizeFilters,
        searchTerm,
    } = useFieldFilter({ searchParams });

    React.useEffect(() =>
    {
        if (searchParams.get("page") === String(currentPage))
        {
            return;
        }

        setSearchParams(buildListSearchParams(searchParams, {
            extraParams: buildFilterParams(currentFilters),
            page: currentPage,
            search: currentSearch,
        }), { replace: true });
    }, [buildFilterParams, currentFilters, currentPage, currentSearch, searchParams, setSearchParams])

    const handleSearchChange = React.useCallback((nextSearch: string) =>
    {
        setSearchParams(buildListSearchParams(searchParams, {
            page: 1,
            search: nextSearch,
        }), { replace: true });
    }, [searchParams, setSearchParams]);

    const handleCurrentPageChange = React.useCallback((nextPage: number) =>
    {
        setSearchParams(buildListSearchParams(searchParams, {
            page: nextPage,
            search: currentSearch,
        }));
    }, [currentSearch, searchParams, setSearchParams]);

    const handleFilterChange = React.useCallback((nextFilters: Record<string, string>) =>
    {
        const normalizedFilters = normalizeFilters(nextFilters);

        setSearchParams(buildListSearchParams(searchParams, {
            extraParams: buildFilterParams(normalizedFilters),
            page: 1,
            search: currentSearch,
        }), { replace: true });
    }, [buildFilterParams, currentSearch, normalizeFilters, searchParams, setSearchParams]);

    const fetchData = React.useCallback(async (params: IFetchParams): Promise<IFetchResult> =>
    {
        const response = await searchRepairRequests({
            deleted: false,
            orderBy: buildOrderBy(params.sortBy, params.sortDir, "requested_at desc"),
            pageNumber: params.page,
            pageSize: params.limit,
            search: buildFilterSearch(params.search),
            searchTerm: params.searchTerm
                ? {
                    name: "request_no,requester_name",
                    value: params.searchTerm,
                }
                : undefined,
        });

        return {
            data: response.data as IRepairRequestTableRow[],
            total: response.pagination.totalCount,
            totalPages: response.pagination.totalPages,
            pageItemCount: response.pagination.pageSize,
            currentPage: response.pagination.currentPage,
            hasNext: response.pagination.hasNext,
            hasPrevious: response.pagination.hasPrevious,
        };
    }, []);

    return (
        <DataTable<IRepairRequestTableRow>
            basePath="/manager/repair-requests"
            columns={columns}
            currentPageValue={currentPage}
            emptyMessage="No repair requests found."
            fetchData={fetchData}
            itemKey="id"
            itemName="repair requests"
            onCurrentPageChange={handleCurrentPageChange}
            onSearchChange={handleSearchChange}
            searchPlaceholder="Search request no, requester..."
            searchValue={currentSearch}
            showCreateButton={false}
            showDeleteAction={false}
            showEditAction={false}
            title="Repair Requests"
            filterFields={fieldFilters}
            filterValues={currentFiltersRecord}
            onFilterChange={handleFilterChange}
        />
    );
}
