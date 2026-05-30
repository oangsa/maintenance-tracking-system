import React from "react";
import type { IWorkTaskAssignment } from "~/api/types/types";
import TableModal from "~/components/Common/TableModal";
import useModalColumns from "./hooks/useModalColumns";

interface IAssignmentHistoryModalProps
{
    error: string;
    history: IWorkTaskAssignment[];
    isLoading: boolean;
    isOpen: boolean;
    onClose: () => void;
}

export default function AssignmentHistoryModal({
    error,
    history,
    isLoading,
    isOpen,
    onClose,
}: IAssignmentHistoryModalProps)
{
    const columns = useModalColumns();

    return (
        <TableModal<IWorkTaskAssignment>
            columns={columns}
            data={history}
            description="History rows below are responsibility transactions for this work task."
            emptyMessage="No assignment history yet."
            error={error}
            isLoading={isLoading}
            isOpen={isOpen}
            loadingMessage="Loading assignment history..."
            onClose={onClose}
            title="Task Assignment History"
        />
    );
}
