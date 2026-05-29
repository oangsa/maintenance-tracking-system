import React from "react";
import type { IWorkOrder } from "~/api/types/types";
import type { IColumn } from "~/components/Common/DataTable";
import { formatDateTime} from "~/lib/formatters";

type IWorkOrderTableRow = IWorkOrder & Record<string, unknown>;

function useColumns()
{
    return React.useMemo<IColumn<IWorkOrderTableRow>[]>(() => [
        {
            key: "repair_request_request_no",
            label: "Request No",
            render: (value: unknown, row: IWorkOrderTableRow) => String(value ?? row.repairRequestRequestNo ?? "-"),
        },
        {
            key: "product_name",
            label: "Product",
            render: (value: unknown, row: IWorkOrderTableRow) => row.repairRequestItemProductName?? "-",
            sortable: false,
        },
        {
            key: "scheduled_start",
            label: "Scheduled Start",
            render: (value: unknown, row: IWorkOrderTableRow) => formatDateTime(row.scheduledStart as string | null | undefined),
        },
        {
            key: "scheduled_end",
            label: "Scheduled End",
            render: (value: unknown, row: IWorkOrderTableRow) => formatDateTime(row.scheduledEnd as string | null | undefined),
        },
        {
            key: "order_sequence",
            label: "Order Sequence",
            render: (value: unknown, row: IWorkOrderTableRow) => String(row.orderSequence ?? "-"),
        },
        {
            key: "status_name",
            label: "Status",
            render: (value: unknown, row: IWorkOrderTableRow) => String(value ?? row.repairRequestItemRepairStatusName ?? "-"),
            sortable: false,
        },
    ], []);
}

export default useColumns;
export type { IWorkOrderTableRow };