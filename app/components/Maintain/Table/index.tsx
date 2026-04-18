import React from "react";
import DataTable, { type IDataTableProps } from "~/components/Common/DataTable";
import { ConfirmModal } from "~/components/Common/Modal";

interface IConfirmState
{
    isOpen: boolean;
    id: number | null;
}

interface ITableDeleteConfig
{
    confirmTitle: string;
    confirmMessage: string;
    invalidIdMessage: string;
    submitErrorMessage: string;
    onDelete: (id: number) => Promise<void>;
}

interface ITableProps<T extends Record<string, unknown>> extends Omit<IDataTableProps<T>, "onDelete" | "refreshTrigger">
{
    deleteConfig?: ITableDeleteConfig;
    error?: string;
    refreshTrigger?: number;
}

export default function Table<T extends Record<string, unknown>>({
    deleteConfig,
    error,
    refreshTrigger = 0,
    ...dataTableProps
}: ITableProps<T>)
{
    const [confirmState, setConfirmState] = React.useState<IConfirmState>({ isOpen: false, id: null });
    const [deleteError, setDeleteError] = React.useState("");
    const [deleteRefreshTrigger, setDeleteRefreshTrigger] = React.useState(0);

    function closeConfirm()
    {
        setConfirmState({ isOpen: false, id: null });
    }

    function handleDelete(id: string | number)
    {
        if (!deleteConfig)
        {
            return;
        }

        const parsedId = Number(id);

        if (!Number.isFinite(parsedId))
        {
            setDeleteError(deleteConfig.invalidIdMessage);
            return;
        }

        setConfirmState({ isOpen: true, id: parsedId });
    }

    async function confirmDelete()
    {
        if (!deleteConfig || confirmState.id === null)
        {
            return;
        }

        try
        {
            await deleteConfig.onDelete(confirmState.id);
            closeConfirm();
            setDeleteError("");
            setDeleteRefreshTrigger((currentValue) => currentValue + 1);
        }
        catch (currentError)
        {
            setDeleteError((currentError as Error).message || deleteConfig.submitErrorMessage);
        }
    }

    return (
        <>
            {deleteConfig && (
                <ConfirmModal
                    cancelText="Cancel"
                    confirmText="Delete"
                    isOpen={confirmState.isOpen}
                    message={deleteConfig.confirmMessage}
                    onClose={closeConfirm}
                    onConfirm={confirmDelete}
                    title={deleteConfig.confirmTitle}
                />
            )}

            {(deleteError || error) && <div className="alert alert-error">{deleteError || error}</div>}

            <DataTable
                {...dataTableProps}
                onDelete={deleteConfig ? handleDelete : undefined}
                refreshTrigger={refreshTrigger + deleteRefreshTrigger}
            />
        </>
    );
}
