import React from "react";
import DataTable from "~/components/Common/DataTable";
import { ConfirmModal } from "~/components/Common/Modal";
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
}

interface IConfirmState
{
    isOpen: boolean;
    id: number | null;
}

function buildOrderBy(sortBy?: string, sortDir?: "asc" | "desc"): string
{
    if (!sortBy)
    {
        return "id asc";
    }

    return `${sortBy} ${sortDir === "desc" ? "desc" : "asc"}`;
}

export default function UsersListPage()
{
    const [confirmState, setConfirmState] = React.useState<IConfirmState>({ isOpen: false, id: null });
    const [refreshTrigger, setRefreshTrigger] = React.useState(0);
    const [pageError, setPageError] = React.useState("");
    const columns = useColumns();

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
                refreshTrigger={refreshTrigger}
                searchPlaceholder="Search name, email, department, or role..."
                title="Users"
            />
        </>
    );
}
