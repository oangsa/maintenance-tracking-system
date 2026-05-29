import React from "react";
import { useSearchParams } from "react-router";
import type { IFetchParams, IFetchResult } from "~/components/Common/DataTable";
import Loading from "~/components/Common/Loading";
import Table from "~/components/Maintain/Table";
import useTableSearchParams from "~/components/Maintain/Table/useSearchParams";
import { SEARCH_OPERATOR } from "~/constants";
import { buildOrderBy } from "~/lib/pageUtils";
import { useUserContext } from "~/providers/UserProvider";
import { searchWorkOrders } from "~/services/workOrders.service";
import useColumns, { type IWorkOrderTableRow } from "../../manager/WorkOrders/hooks/useColumns";
import useFieldFilter from "../../manager/WorkOrders/hooks/useFieldFilter";

export default function EmployeeWorkOrdersListPage()
{
    const [searchParams, setSearchParams] = useSearchParams();
    const allColumns = useColumns();
    const readOnlyColumns = React.useMemo(() => {
        return allColumns.filter((col: any) => {
            const colName = (col.id || col.key || col.header || col.accessorKey || "").toLowerCase();
            return !colName.includes("action");
        });
    }, [allColumns]);

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

    const currentUserId = currentUser?.id ?? null;

    const fetchData = React.useCallback(async (params: IFetchParams): Promise<IFetchResult<IWorkOrderTableRow>> =>
    {
        const searchConditions = [
            ...buildFilterSearch(params.search),
            // enable this when work task assignment is implemented
            /* {
                condition: SEARCH_OPERATOR.EQUAL,
                name: "active_assignee_id",
                value: String(currentUserId),
            }, */
        ];

        const response = await searchWorkOrders({
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
            data: response.data as IWorkOrderTableRow[],
            hasNext: response.pagination.hasNext,
            hasPrevious: response.pagination.hasPrevious,
            pageItemCount: response.pagination.pageSize,
            total: response.pagination.totalCount,
            totalPages: response.pagination.totalPages,
        };
    }, [buildFilterSearch, currentUserId, searchTerm]);

    if (isLoadingUser && currentUser === null)
    {
        return <Loading message="Loading work orders..." />;
    }

    if (!currentUser)
    {
        return <div className="alert alert-error">{userError || "Unable to load your user profile."}</div>;
    }

    return (
        <Table<IWorkOrderTableRow>
            basePath="/work-orders"
            columns={readOnlyColumns}
            currentPageValue={currentPage}
            fetchData={fetchData}
            filterFields={fieldFilters}
            filterValues={currentFiltersRecord}
            itemKey="id"
            onCurrentPageChange={handleCurrentPageChange}
            onFilterChange={handleFilterChange}
            onSearchChange={handleSearchChange}
            searchValue={currentSearch}
            title="Work Orders"
            showCreateButton={false}
            showEditAction={false}
            showDeleteAction={false}

        />
    );
}
