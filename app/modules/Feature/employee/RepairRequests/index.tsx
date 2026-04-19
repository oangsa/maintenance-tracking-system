import React from "react";
import { useSearchParams } from "react-router";
import type { IFetchParams, IFetchResult } from "~/components/Common/DataTable";
import Loading from "~/components/Common/Loading";
import Table from "~/components/Maintain/Table";
import useTableSearchParams from "~/components/Maintain/Table/useSearchParams";
import { buildOrderBy } from "~/lib/pageUtils";
import { useUserContext } from "~/providers/UserProvider";
import { searchRepairRequests } from "~/services/repairRequests.service";
import useColumns, { type IRepairRequestTableRow } from "./hooks/useColumns";
import useFieldFilter from "./hooks/useFieldFilter";

export default function RepairRequestEmployeeListPage()
{
    const [searchParams, setSearchParams] = useSearchParams();
    const { currentUser, isLoadingUser, userError } = useUserContext();
    const columns = useColumns();

    const {
        buildFilterParams,
        buildFilterSearch,
        currentFilters,
        currentFiltersRecord,
        fieldFilters,
        normalizeFilters,
        searchTerm,
    } = useFieldFilter({ searchParams });

    const {
        currentPage,
        currentSearch,
        handleCurrentPageChange,
        handleFilterChange,
        handleSearchChange,
    } = useTableSearchParams({
        buildFilterParams,
        currentFilters,
        normalizeFilters,
        searchParams,
        setSearchParams,
    });

    const fetchData = React.useCallback(async (params: IFetchParams): Promise<IFetchResult<IRepairRequestTableRow>> =>
    {
        if (currentUser === null)
        {
            return {
                currentPage: params.page,
                data: [],
                hasNext: false,
                hasPrevious: false,
                pageItemCount: 0,
                total: 0,
                totalPages: 0,
            };
        }

        const response = await searchRepairRequests({
            deleted: false,
            orderBy: buildOrderBy(params.sortBy, params.sortDir, "requested_at desc"),
            pageNumber: params.page,
            pageSize: params.limit,
            search: buildFilterSearch(params.search, currentUser.id),
            searchTerm: params.searchTerm
                ? {
                    name: searchTerm,
                    value: params.searchTerm,
                }
                : undefined,
        });

        return {
            currentPage: response.pagination.currentPage,
            data: response.data as IRepairRequestTableRow[],
            hasNext: response.pagination.hasNext,
            hasPrevious: response.pagination.hasPrevious,
            pageItemCount: response.pagination.pageSize,
            total: response.pagination.totalCount,
            totalPages: response.pagination.totalPages,
        };
    }, [buildFilterSearch, currentUser, searchTerm]);

    if (isLoadingUser && currentUser === null)
    {
        return <Loading message="Loading repair requests..." />;
    }

    if (!currentUser)
    {
        return <div className="alert alert-error">{userError || "Unable to load your user profile."}</div>;
    }

    return (
        <>
            <Table<IRepairRequestTableRow>
                basePath="/repair-requests"
                columns={columns}
                currentPageValue={currentPage}
                emptyMessage="No repair requests found. Create one to get started."
                error={userError}
                fetchData={fetchData}
                filterFields={fieldFilters}
                filterValues={currentFiltersRecord}
                itemKey="id"
                itemName="repair requests"
                onCurrentPageChange={handleCurrentPageChange}
                onFilterChange={handleFilterChange}
                onSearchChange={handleSearchChange}
                searchPlaceholder="Search request no..."
                searchValue={currentSearch}
                showDeleteAction={false}
                showEditAction={false}
                title="Repair Requests"
            />
        </>
    );
}
