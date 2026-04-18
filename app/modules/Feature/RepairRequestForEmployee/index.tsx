import React, { useSyncExternalStore } from "react";
import { useSearchParams } from "react-router";
import DataTable from "~/components/Common/DataTable";
import Loading from "~/components/Common/Loading";
import { buildListSearchParams, buildOrderBy, parsePositiveIntegerParam } from "~/lib/pageUtils";
import {
    ensureCurrentUser,
    getCurrentUser,
    subscribeCurrentUser,
} from "~/services/auth.service";
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

export default function RepairRequestEmployeeListPage()
{
    const [searchParams, setSearchParams] = useSearchParams();
    const currentUser = useSyncExternalStore(subscribeCurrentUser, getCurrentUser, getCurrentUser);

    const [loadingUser, setLoadingUser] = React.useState(currentUser === null);
    const [pageError, setPageError] = React.useState("");
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
    const currentPage = parsePositiveIntegerParam(searchParams.get("page"));
    const currentSearch = searchParams.get("search") ?? "";

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
    }, [buildFilterParams, currentFilters, currentPage, currentSearch, searchParams, setSearchParams]);

    const handleSearchChange = React.useCallback((nextSearch: string) =>
    {
        setSearchParams(buildListSearchParams(searchParams, {
            extraParams: buildFilterParams(currentFilters),
            page: 1,
            search: nextSearch,
        }), { replace: true });
    }, [buildFilterParams, currentFilters, searchParams, setSearchParams]);

    const handleFilterChange = React.useCallback((nextFilters: Record<string, string>) =>
    {
        const normalizedFilters = normalizeFilters(nextFilters);

        setSearchParams(buildListSearchParams(searchParams, {
            extraParams: buildFilterParams(normalizedFilters),
            page: 1,
            search: currentSearch,
        }), { replace: true });
    }, [buildFilterParams, currentSearch, normalizeFilters, searchParams, setSearchParams]);

    const handleCurrentPageChange = React.useCallback((nextPage: number) =>
    {
        setSearchParams(buildListSearchParams(searchParams, {
            extraParams: buildFilterParams(currentFilters),
            page: nextPage,
            search: currentSearch,
        }));
    }, [buildFilterParams, currentFilters, currentSearch, searchParams, setSearchParams]);

    const fetchData = React.useCallback(async (params: IFetchParams): Promise<IFetchResult> =>
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

    if (loadingUser)
    {
        return <Loading message="Loading repair requests..." />;
    }

    if (!currentUser)
    {
        return <div className="alert alert-error">{pageError || "Unable to load your user profile."}</div>;
    }

    return (
        <>
            {pageError && <div className="alert alert-error">{pageError}</div>}

            <DataTable<IRepairRequestTableRow>
                basePath="/repair-requests"
                columns={columns}
                currentPageValue={currentPage}
                emptyMessage="No repair requests found. Create one to get started."
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
