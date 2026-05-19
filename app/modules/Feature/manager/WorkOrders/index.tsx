import React from "react";
import { useSearchParams } from "react-router";
import type { IFetchParams, IFetchResult } from "~/components/Common/DataTable";
import Loading from "~/components/Common/Loading";
import Table from "~/components/Maintain/Table";
import useTableSearchParams from "~/components/Maintain/Table/useSearchParams";
import { buildOrderBy } from "~/lib/pageUtils";
import { useUserContext } from "~/providers/UserProvider";
import useColumns, { type IWorkOrderTableRow } from "./hooks/useColumns";
import useFieldFilter from "./hooks/useFieldFilter";
import { deleteWorkOrder, searchWorkOrders } from "~/services/workOrders.service";

export default function ManagerWorkOrdersListPage()
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

    const currentUserDepartmentId = currentUser?.departmentId ?? null;

    const fetchData = React.useCallback(async (params: IFetchParams): Promise<IFetchResult<IWorkOrderTableRow>> =>
    {

        const searchConditions = buildFilterSearch(params.search);

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
    }, [buildFilterSearch, searchTerm]);

    if (isLoadingUser && currentUser === null)
    {
        return <Loading message="Loading work orders..." />;
    }

    if (!currentUser)
    {
        return <div className="alert alert-error">{userError || "Unable to load your user profile."}</div>;
    }

    if (currentUserDepartmentId === null)
    {
        return <div className="alert alert-error">Your user account is not assigned to a department, so work orders cannot be loaded.</div>;
    }

    return (
        <Table<IWorkOrderTableRow>
            basePath="/manager/work-orders"
            columns={columns}
            currentPageValue={currentPage}
            deleteConfig={{
                confirmMessage: "Are you sure you want to delete this work order?",
                confirmTitle: "Delete Work Order",
                invalidIdMessage: "The selected work order has an invalid id and cannot be deleted.",
                onDelete: deleteWorkOrder,
                submitErrorMessage: "Unable to delete the selected work order.",
            }}
            fetchData={fetchData}
            filterFields={fieldFilters}
            filterValues={currentFiltersRecord}
            itemKey="id"
            onCurrentPageChange={handleCurrentPageChange}
            onFilterChange={handleFilterChange}
            onSearchChange={handleSearchChange}
            searchValue={currentSearch}
            title="Work Orders"
        />
    );
}





