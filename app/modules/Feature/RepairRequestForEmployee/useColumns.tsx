import React from "react";
import type { IRepairRequest } from "~/api/types";
import { formatDateTime, formatTitleCase } from "./helpers";

type IRepairRequestTableRow = IRepairRequest & Record<string, unknown>;

function useColumns()
{
    return React.useMemo(() => [
        {
            key: "request_no",
            label: "Request No",
            render: (_value: unknown, row: IRepairRequestTableRow) => row.requestNo,
        },
        {
            key: "priority",
            label: "Priority",
            render: (value: unknown) => formatTitleCase(String(value ?? "")),
        },
        {
            key: "current_status_name",
            label: "Current Status",
            render: (_value: unknown, row: IRepairRequestTableRow) => row.currentStatusName ?? row.currentStatusCode ?? "-",
        },
        {
            key: "requested_at",
            label: "Requested At",
            render: (_value: unknown, row: IRepairRequestTableRow) => formatDateTime(row.requestedAt),
        },
        {
            key: "repairRequestItems",
            label: "Items",
            render: (value: unknown) => Array.isArray(value) ? String(value.length) : "0",
            sortable: false,
        },
    ], []);
}

export default useColumns;
export type { IRepairRequestTableRow };
