import React from "react";
import type { IRepairRequest } from "~/api/types/types";
import { formatDateTime, formatRequesterLabel, formatTitleCase } from "~/lib/formatters";

type IRepairRequestTableRow = IRepairRequest & Record<string, unknown>;

function useColumns()
{
    return React.useMemo(() => [
        {
            key: "request_no",
            label: "Request No",
            render: (value: unknown, row: IRepairRequestTableRow) => row.requestNo,
        },
        {
            key: "requester_name",
            label: "Requester",
            render: (value: unknown, row: IRepairRequestTableRow) => formatRequesterLabel(row.requesterName, row.requesterEmail),
        },
        {
            key: "priority",
            label: "Priority",
            render: (value: unknown, row: IRepairRequestTableRow) => formatTitleCase(String(value ?? "")),
        },
        {
            key: "current_status_name",
            label: "Current Status",
            render: (value: unknown, row: IRepairRequestTableRow) => String(value ?? row.currentStatusName ?? "-"),
        },
        {
            key: "requested_at",
            label: "Requested At",
            render: (value: unknown, row: IRepairRequestTableRow) => formatDateTime(row.requestedAt as string | null | undefined),
        },
        {
            key: "repair_request_items",
            label: "Items",
            render: (value: unknown, row: IRepairRequestTableRow) => Array.isArray(row.repairRequestItems) ? String(row.repairRequestItems.length) : "0",
            sortable: false,
        },
    ], []);
}

export default useColumns;
export type { IRepairRequestTableRow };
