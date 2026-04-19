import React, { useSyncExternalStore } from "react";
import { useSearchParams } from "react-router";
import type { IFetchParams, IFetchResult } from "~/components/Common/DataTable";
import Table from "~/components/Maintain/Table";
import useTableSearchParams from "~/components/Maintain/Table/useSearchParams";
import { buildOrderBy } from "~/lib/pageUtils";
import { searchRepairRequests } from "~/services/repairRequests.service";
import useColumns, { type IRepairRequestTableRow } from "./hooks/useColumns";
import useFieldFilter from "./hooks/useFieldFilter";
import { ensureCurrentUser, getCurrentUser, subscribeCurrentUser } from "~/services/auth.service";

export default function RepairRequestManagerListPage()
{
    const [searchParams, setSearchParams] = useSearchParams();
    const currentUser = useSyncExternalStore(subscribeCurrentUser, getCurrentUser, getCurrentUser);
    const [loadingUser, setLoadingUser] = React.useState(currentUser === null);
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

    React.useEffect(() =>
    {
        let cancelled = false;

        if (currentUser !== null)
        {
            setLoadingUser(false);
            return () =>
            {
                cancelled = true;
            };
        }

        async function loadCurrentUser()
        {
            try
            {
                await ensureCurrentUser();
            }
            catch (error)
            {
                if (!cancelled)
                {
                    setPageError((error as Error).message || "Unable to load your user profile.");
                }
            }
            finally
            {
                if (!cancelled)
                {
                    setLoadingUser(false);
                }
            }
        }

        void loadCurrentUser();

        return () =>
        {
            cancelled = true;
        };
    }, [currentUser]);

    const fetchData = React.useCallback(async (params: IFetchParams): Promise<IFetchResult<IRepairRequestTableRow>> =>
    {
        const response = await searchRepairRequests({
            deleted: false,
            orderBy: buildOrderBy(params.sortBy, params.sortDir, "requested_at desc"),
            pageNumber: params.page,
            pageSize: params.limit,
            search: buildFilterSearch(params.search, currentUser?.departmentId),
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
        <Table<IRepairRequestTableRow>
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
