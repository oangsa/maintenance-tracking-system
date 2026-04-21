import React from "react";
import type { IRepairRequest } from "~/api/types/types";
import { formatDateTime, formatRequesterLabel, formatTitleCase } from "~/lib/formatters";

type IRepairRequestTableRow = IRepairRequest & Record<string, unknown>;

function useColumns()
{
    return React.useMemo(() => [
        {
            key: "requestNo",
            label: "Request No",
        },
        {
            key: "requesterName",
            label: "Requester",
            render: (_value: unknown, row: IRepairRequestTableRow) => formatRequesterLabel(row.requesterName, row.requesterEmail),
        },
        {
            key: "priority",
            label: "Priority",
            render: (value: unknown) => formatTitleCase(String(value ?? "")),
        },
        {
            key: "currentStatusName",
            label: "Current Status",
            render: (value: unknown, row: IRepairRequestTableRow) => String(value ?? row.currentStatusCode ?? "-"),
        },
        {
            key: "requestedAt",
            label: "Requested At",
            render: (value: unknown) => formatDateTime(value as string | null | undefined),
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
