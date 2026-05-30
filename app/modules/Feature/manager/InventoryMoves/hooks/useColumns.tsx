import React from "react";
import type { IInventoryMove } from "~/api/types/types";
import type { IColumn } from "~/components/Common/DataTable";
import { formatDateTime } from "~/lib/formatters";

type IInventoryMoveTableRow = IInventoryMove & Record<string, unknown>;

function useColumns()
{
    return React.useMemo<IColumn<IInventoryMoveTableRow>[]>(() => [
        {
            key: "move_no",
            label: "Transaction No",
            render: (value: unknown, row: IInventoryMoveTableRow) => String(row.moveNo || "-"),
        },
        {
            key: "parts",
            label: "Included Parts",
            render: (value: unknown, row: IInventoryMoveTableRow) =>
            {
                if (row.inventoryMoveItems.length === 0)
                {
                    return "-";
                }

                return row.inventoryMoveItems
                    .map((item: IInventoryMove["inventoryMoveItems"][number]) => item.partCode ? `${item.partCode} (${item.partName || '-'})` : (item.partName || item.partId))
                    .join(", ");
            },
            sortable: false,
        },
        {
            key: "reason",
            label: "Reason",
            render: (value: unknown, row: IInventoryMoveTableRow) => String(row.reason || "-"),
        },
        {
            key: "remark",
            label: "Remarks",
            render: (value: unknown, row: IInventoryMoveTableRow) => String(row.remark || "-"),
        },
        {
            key: "move_date",
            label: "Move Date",
            render: (value: unknown, row: IInventoryMoveTableRow) => String(row.moveDate || "-"),
        },
        {
            key: "created_by",
            label: "Created By",
            render: (value: unknown, row: IInventoryMoveTableRow) => String(row.createdBy || "-"),
        },
        {
            key: "created_at",
            label: "Created Date",
            render: (value: unknown, row: IInventoryMoveTableRow) => formatDateTime(row.createdAt as string | null | undefined),
        },
    ], []);
}

export default useColumns;
export type { IInventoryMoveTableRow };
