import React from "react";
import type { IRepairStatus } from "~/api/types/types";
import { formatDateTime } from "~/lib/formatters";

type IRepairStatusTableRow = IRepairStatus & Record<string, unknown>;

function useColumns()
{
    return React.useMemo(() => [
        {
            key: "code",
            label: "Code",
            render: (value: unknown, row: IRepairStatusTableRow) => String(value ?? row.code),
        },
        {
            key: "name",
            label: "Name",
            render: (value: unknown, row: IRepairStatusTableRow) => String(value ?? row.name),
        },
        {
            key: "updated_at",
            label: "Updated At",
            render: (value: unknown, row: IRepairStatusTableRow) => formatDateTime(row.updatedAt as string | null | undefined),
        },
    ], []);
}

export default useColumns;
export type { IRepairStatusTableRow };