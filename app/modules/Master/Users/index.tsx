import React from "react";
import { useSearchParams } from "react-router";
import DataTable from "~/components/Common/DataTable";
import { ConfirmModal } from "~/components/Common/Modal";
import { buildListSearchParams, buildOrderBy, parsePositiveIntegerParam } from "~/lib/pageUtils";
import { deleteUser, searchUsers } from "~/services/users.service";
import useColumns, { type IUserTableRow } from "./useColumns";

interface IFetchParams
{
    search: string;
    page: number;
    limit: number;
    sortBy?: string;
    sortDir?: "asc" | "desc";
}

interface IFetchResult
{
    data: IUserTableRow[];
    total: number;
    totalPages: number;
    pageItemCount: number;
    currentPage: number;
    hasNext: boolean;
    hasPrevious: boolean;
}

interface IConfirmState
{
    isOpen: boolean;
    id: number | null;
}

export default function UsersListPage()
{
    const [searchParams, setSearchParams] = useSearchParams();
    const [confirmState, setConfirmState] = React.useState<IConfirmState>({ isOpen: false, id: null });
    const [refreshTrigger, setRefreshTrigger] = React.useState(0);
    const [pageError, setPageError] = React.useState("");
    const columns = useColumns();
    const currentPage = parsePositiveIntegerParam(searchParams.get("page"));
    const currentSearch = searchParams.get("search") ?? "";

    React.useEffect(() =>
    {
        if (searchParams.get("page") === String(currentPage))
        {
            return;
        }

        setSearchParams(buildListSearchParams(searchParams, {
            page: currentPage,
            search: currentSearch,
        }), { replace: true });
    }, [currentPage, currentSearch, searchParams, setSearchParams]);

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

    const fetchData = React.useCallback(async (params: IFetchParams): Promise<IFetchResult> =>
    {
        const response = await searchUsers({
            deleted: false,
            orderBy: buildOrderBy(params.sortBy, params.sortDir),
            pageNumber: params.page,
            pageSize: params.limit,
            searchTerm: params.search
                ? {
                    name: "name,email",
                    value: params.search,
                }
                : undefined,
        });

        return {
            data: response.data as IUserTableRow[],
            total: response.pagination.totalCount,
            totalPages: response.pagination.totalPages,
            pageItemCount: response.pagination.pageSize,
            currentPage: response.pagination.currentPage,
            hasNext: response.pagination.hasNext,
            hasPrevious: response.pagination.hasPrevious,
        };
    }, []);

    function closeConfirm()
    {
        setConfirmState({ isOpen: false, id: null });
    }

    function handleDelete(id: string | number)
    {
        const parsedId = Number(id);

        if (!Number.isFinite(parsedId))
        {
            setPageError("The selected user has an invalid id and cannot be deleted.");
            return;
        }

        setConfirmState({ isOpen: true, id: parsedId });
    }

    async function confirmDelete()
    {
        if (confirmState.id === null)
        {
            return;
        }

        try
        {
            await deleteUser(confirmState.id);
            closeConfirm();
            setRefreshTrigger((currentValue) => currentValue + 1);
            setPageError("");
        }
        catch (error)
        {
            setPageError((error as Error).message || "Unable to delete the selected user.");
        }
    }

    return (
        <>
            <ConfirmModal
                cancelText="Cancel"
                confirmText="Delete"
                isOpen={confirmState.isOpen}
                message="Are you sure you want to delete this user?"
                onClose={closeConfirm}
                onConfirm={confirmDelete}
                title="Delete User"
            />

            {pageError && <div className="alert alert-error">{pageError}</div>}

            <DataTable<IUserTableRow>
                basePath="/master/users"
                columns={columns}
                emptyMessage="No users found. Create one to get started."
                fetchData={fetchData}
                itemKey="id"
                itemName="users"
                onDelete={handleDelete}
                currentPageValue={currentPage}
                onCurrentPageChange={handleCurrentPageChange}
                onSearchChange={handleSearchChange}
                refreshTrigger={refreshTrigger}
                searchValue={currentSearch}
                searchPlaceholder="Search name, email, department, or role..."
                title="Users"
            />
        </>
    );
}
