import React from "react";
import { useSearchParams } from "react-router";
import type { IFetchParams, IFetchResult } from "~/components/Common/DataTable";
import Loading from "~/components/Common/Loading";
import Table from "~/components/Maintain/Table";
import useTableSearchParams from "~/components/Maintain/Table/useSearchParams";
import { buildOrderBy } from "~/lib/pageUtils";
import { useUserContext } from "~/providers/UserProvider";
import useColumns, { type IInventoryMoveTableRow } from "./hooks/useColumns";
import useFieldFilter from "./hooks/useFieldFilter";
import { searchInventoryMoves } from "~/services/inventoryMoves.service";

export default function ManagerInventoryMovesListPage()
{
    const [searchParams, setSearchParams] = useSearchParams();
    const columns = useColumns();
    const { currentUser, isLoadingUser, userError } = useUserContext();

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

    const fetchData = React.useCallback(async (params: IFetchParams): Promise<IFetchResult<IInventoryMoveTableRow>> =>
    {
        const searchConditions = buildFilterSearch(params.search);

        const response = await searchInventoryMoves({
            deleted: false,
            orderBy: buildOrderBy(params.sortBy, params.sortDir, "created_at desc"),
            pageNumber: params.page,
            pageSize: params.limit,
            search: searchConditions,
            searchTerm: params.searchTerm
                ? {
                    name: searchTerm,
                    value: params.searchTerm,
                }
                : undefined,
        });

        return {
            currentPage: response.pagination.currentPage,
            data: response.data as IInventoryMoveTableRow[],
            hasNext: response.pagination.hasNext,
            hasPrevious: response.pagination.hasPrevious,
            pageItemCount: response.pagination.pageSize,
            total: response.pagination.totalCount,
            totalPages: response.pagination.totalPages,
        };
    }, [buildFilterSearch, searchTerm]);

    if (isLoadingUser && currentUser === null)
    {
        return <Loading message="Loading inventory moves..." />;
    }

    if (!currentUser)
    {
        return <div className="alert alert-error">{userError || "Unable to load your user profile."}</div>;
    }

    return (
        <Table<IInventoryMoveTableRow>
            basePath="/manager/inventory-moves"
            columns={columns}
            currentPageValue={currentPage}
            fetchData={fetchData}
            filterFields={fieldFilters}
            filterValues={currentFiltersRecord}
            itemKey="id"
            onCurrentPageChange={handleCurrentPageChange}
            onFilterChange={handleFilterChange}
            onSearchChange={handleSearchChange}
            searchValue={currentSearch}
            title="Inventory Moves"
            showEditAction={false}
        />
    );
}
