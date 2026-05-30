import React from "react";
import type { IWorkTaskAssignment } from "~/api/types/types";
import type { IModalColumn } from "~/components/Common/TableModal";
import { Badge } from "~/components/ui/badge";
import { formatDateTime } from "~/lib/formatters";

export default function useModalColumns(): IModalColumn<IWorkTaskAssignment>[]
{
    return React.useMemo(() => [
        {
            key: "status",
            label: "Status",
            render: (_value: unknown, row: IWorkTaskAssignment) =>
            {
                const isActive = !row.unassignedAt;

                return (
                    <Badge variant={isActive ? "default" : "outline"}>
                        {isActive ? "Active" : "Closed"}
                    </Badge>
                );
            },
        },
        {
            key: "assigneeName",
            label: "Technician",
            render: (_value: unknown, row: IWorkTaskAssignment) => row.assigneeName || row.assigneeEmail
                ? `${row.assigneeName || "Unnamed User"} (${row.assigneeEmail || "No email"})`
                : "-",
        },
        {
            key: "assignedByName",
            label: "Assigned By",
            render: (_value: unknown, row: IWorkTaskAssignment) => row.assignedByName || "-",
        },
        {
            key: "assignedAt",
            label: "Assigned At",
            render: (_value: unknown, row: IWorkTaskAssignment) => formatDateTime(row.assignedAt),
        },
        {
            key: "unassignedAt",
            label: "Unassigned At",
            render: (_value: unknown, row: IWorkTaskAssignment) => formatDateTime(row.unassignedAt),
        },
    ], []);
}
