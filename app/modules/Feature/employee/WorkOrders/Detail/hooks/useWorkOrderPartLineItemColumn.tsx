import React from "react";
import { FiCheckCircle } from "react-icons/fi";
import type { ILineItemColumn } from "~/components/Common/LineItemsEditor";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { formatJoinedLabel } from "~/lib/formatters";
import type { IWorkOrderPartLineItem } from "../WorkOrderPartLineItemsEditor";

interface IUseWorkOrderPartLineItemColumnProps
{
    canConsumeParts: boolean;
    canDeletePlannedParts: boolean;
    onConsume?: (partId: number) => void;
    onDeletePlanned?: (partId: number) => void;
}

function resolvePartId(item: IWorkOrderPartLineItem): number | null
{
    if (typeof item.id !== "number" || !Number.isFinite(item.id) || item.id <= 0)
    {
        return null;
    }

    return item.id;
}

function renderUsageBadge(item: IWorkOrderPartLineItem)
{
    if (item.inventoryMoveItemId !== null)
    {
        return <Badge>Consumed</Badge>;
    }

    return <Badge variant="outline">Planned</Badge>;
}

export default function useWorkOrderPartLineItemColumn({
    canConsumeParts,
    canDeletePlannedParts,
    onConsume,
    onDeletePlanned,
}: IUseWorkOrderPartLineItemColumnProps): ILineItemColumn<IWorkOrderPartLineItem>[]
{
    return React.useMemo<ILineItemColumn<IWorkOrderPartLineItem>[]>(() => [
        {
            cellClassName: "w-[56px] align-top",
            headerClassName: "w-[56px] text-center",
            key: "index",
            label: "#",
            renderCell: (context) => context.renderReadOnlyValue(context.index + 1, "text-center font-medium"),
        },
        {
            cellClassName: "min-w-[260px] align-top",
            headerClassName: "min-w-[260px]",
            key: "part",
            label: "Part",
            renderCell: (context) => context.renderReadOnlyValue(formatJoinedLabel([context.item.partCode, context.item.partName]) || "-"),
        },
        {
            cellClassName: "w-[120px] align-top",
            headerClassName: "w-[120px] text-right",
            key: "quantity",
            label: "Quantity",
            renderCell: (context) => context.renderReadOnlyValue(context.item.quantity, "text-right"),
        },
        {
            cellClassName: "w-[140px] align-top",
            headerClassName: "w-[140px]",
            key: "usageStatus",
            label: "Usage Status",
            renderCell: (context) => context.renderReadOnlyValue(renderUsageBadge(context.item)),
        },
        {
            cellClassName: "w-[180px] align-top",
            headerClassName: "w-[180px]",
            key: "inventoryMoveItemId",
            label: "Inventory Move Item",
            renderCell: (context) => context.renderReadOnlyValue(context.item.inventoryMoveItemId ?? "-"),
        },
        {
            cellClassName: "min-w-[220px] align-top",
            headerClassName: "min-w-[220px]",
            key: "note",
            label: "Note",
            renderCell: (context) => context.renderReadOnlyValue(context.item.note || "-"),
        },
        {
            cellClassName: "w-[260px] align-top",
            headerClassName: "w-[260px] text-right",
            key: "actions",
            label: "Actions",
            renderCell: (context) =>
            {
                const parsedPartId = resolvePartId(context.item);
                const isConsumed = context.item.inventoryMoveItemId !== null;
                const isConsumeDisabled = parsedPartId === null || isConsumed || !canConsumeParts;
                const isDeleteDisabled = parsedPartId === null || isConsumed || !canDeletePlannedParts;

                return context.renderDefaultActions(
                    <div className="flex flex-wrap justify-end gap-2">
                        <Button
                            className="gap-1.5"
                            disabled={isConsumeDisabled}
                            onClick={() =>
                            {
                                if (parsedPartId === null || !onConsume)
                                {
                                    return;
                                }

                                onConsume(parsedPartId);
                            }}
                            type="button"
                            variant="outline"
                        >
                            <FiCheckCircle className="size-4" />
                            Consume
                        </Button>

                        <Button
                            className="gap-1.5"
                            disabled={isDeleteDisabled}
                            onClick={() =>
                            {
                                if (parsedPartId === null || !onDeletePlanned)
                                {
                                    return;
                                }

                                onDeletePlanned(parsedPartId);
                            }}
                            type="button"
                            variant="destructive"
                        >
                            Delete Planned
                        </Button>
                    </div>,
                );
            },
        },
    ], [canConsumeParts, canDeletePlannedParts, onConsume, onDeletePlanned]);
}
