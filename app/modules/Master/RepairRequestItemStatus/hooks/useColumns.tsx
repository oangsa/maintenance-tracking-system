import React from "react";
import type { IRepairRequestItemStatus } from "~/api/types/types";
import { formatDateTime } from "~/lib/formatters";

type IRepairRequestItemStatusTableRow = IRepairRequestItemStatus & Record<string, unknown>;

function useColumns()
{
    return React.useMemo(() => [
        {
            key: "orderSequence",
            label: "Order Sequence",
            render: (value: unknown) => String(value ?? ""),
        },
        {
            key: "code",
            label: "Code",
            render: (value: unknown, row: IRepairRequestItemStatusTableRow) => String(value ?? row.name),
        },
        {
            key: "name",
            label: "Name",
            render: (value: unknown, row: IRepairRequestItemStatusTableRow) => String(value ?? row.code),
        },
        {
            key: "is_final",
            label: "Is Final",
            render: (value: unknown) => (value ? "True" : "False"),
        },
        {
            key: "updated_at",
            label: "Updated At",
            render: (value: unknown) => formatDateTime(value as string | null | undefined),
        }
    ], []);
}

export default useColumns;
export type { IRepairRequestItemStatusTableRow };
