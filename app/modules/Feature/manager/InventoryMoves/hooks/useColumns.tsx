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
            render: (value: unknown, row: IInventoryMoveTableRow) => {
                const itemsList = (row.inventoryMoveItems || row.items || []) as any[];
                
                if (itemsList.length === 0) return "-";
                
                return itemsList
                    .map((item: any) => item.partCode ? `${item.partCode} (${item.partName || '-'})` : (item.partName || item.partId))
                    .join(", ");
            },
            sortable: false,
        },
        {
            key: "remark",
            label: "Remarks",
            render: (value: unknown, row: any) => String(row.remark || row.remarks || row.reason || "-"),
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