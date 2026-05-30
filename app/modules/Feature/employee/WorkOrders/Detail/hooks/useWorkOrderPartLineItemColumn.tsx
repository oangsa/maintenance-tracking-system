import React from "react";
import { FiCheckCircle, FiSearch } from "react-icons/fi";
import type { ILineItemColumn } from "~/components/Common/LineItemsEditor";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { formatJoinedLabel } from "~/lib/formatters";
import type { IWorkOrderPartLineItem } from "../WorkOrderPartLineItemsEditor";

interface IUseWorkOrderPartLineItemColumnProps
{
    canConsumeParts: boolean;
    canDeletePlannedParts: boolean;
    onConsume?: (partId: number) => void;
    onDeletePlanned?: (partId: number) => void;
    onSavePart?: (part: IWorkOrderPartLineItem) => void;
    itemMessages: Record<number, string | undefined>;
    onClearPartSelection: (index: number, updateFn: (patch: Partial<IWorkOrderPartLineItem>) => void) => void;
    onCodeBlur: (index: number, draftItem: IWorkOrderPartLineItem, updateFn: (patch: Partial<IWorkOrderPartLineItem>) => void) => void;
    resolvingRows: Record<number, boolean>;
    onRemovePart: (index: number) => void;
    onOpenLov: (index: number, updateFn: (patch: Partial<IWorkOrderPartLineItem>) => void) => void;
}

function resolvePartId(item: IWorkOrderPartLineItem): number | null
{
    if (typeof item.id !== "number" || !Number.isFinite(item.id) || item.id <= 0)
    {
        return null;
    }

    return item.id;
}

function resolveInventoryMoveItemId(item: IWorkOrderPartLineItem): number | null
{
    const rawId = item.inventoryMoveItemId ?? (item as any).inventory_move_item_id;
    const parsedInventoryMoveItemId = Number(rawId);

    if (!Number.isFinite(parsedInventoryMoveItemId) || parsedInventoryMoveItemId <= 0)
    {
        return null;
    }

    return parsedInventoryMoveItemId;
}

function renderUsageBadge(item: IWorkOrderPartLineItem)
{
    if (resolveInventoryMoveItemId(item) !== null)
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
    onSavePart,
    itemMessages,
    onClearPartSelection,
    onCodeBlur,
    resolvingRows,
    onRemovePart,
    onOpenLov,
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
            renderCell: (context) =>
            {
                const isNew = context.item.id < 0;

                if (!isNew)
                {
                    return context.renderReadOnlyValue(formatJoinedLabel([context.item.partCode, context.item.partName]) || "-");
                }
                
                return (
                    <div>
                        <div className="flex gap-2">
                            <Input
                                disabled={resolvingRows[context.index]}
                                onBlur={() => onCodeBlur(context.index, context.item, context.updateItem)}
                                onChange={(e) => context.updateItem({ partCode: e.target.value })}
                                placeholder="Part code..."
                                value={context.item.partCode || ""}
                            />
                            <Button
                                onClick={() => onOpenLov(context.index, context.updateItem)}
                                type="button"
                                variant="outline"
                                size="icon"
                                className="shrink-0"
                            >
                                <FiSearch className="size-4" />
                            </Button>
                            {context.item.partId ? (
                                <Button onClick={() => onClearPartSelection(context.index, context.updateItem)} type="button" variant="outline" size="sm" className="px-2">
                                    Clear
                                </Button>
                            ) : null}
                        </div>
                        {context.item.partName && <div className="text-sm text-muted-foreground mt-1">{context.item.partName}</div>}
                        {itemMessages[context.index] && <div className="text-sm text-destructive mt-1">{itemMessages[context.index]}</div>}
                    </div>
                );
            },
        },
        {
            cellClassName: "w-[120px] align-top",
            headerClassName: "w-[120px] text-right",
            key: "quantity",
            label: "Quantity",
            renderCell: (context) =>
            {
                const isNew = context.item.id < 0;

                if (!isNew)
                {
                    return context.renderReadOnlyValue(context.item.quantity, "text-right");
                }

                return (
                    <Input
                        type="number"
                        min="1"
                        className="text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        value={context.item.quantity === "" ? "" : String(context.item.quantity)}
                        onChange={(e) => context.updateItem({ quantity: e.target.value ? Number(e.target.value) : "" })}
                    />
                );
            },
        },
        {
            cellClassName: "w-[140px] align-top",
            headerClassName: "w-[140px]",
            key: "usageStatus",
            label: "Usage Status",
            renderCell: (context) =>
            {
                const isNew = context.item.id < 0;

                if (isNew)
                {
                    return context.renderReadOnlyValue(<Badge variant="secondary">New</Badge>);
                }

                return context.renderReadOnlyValue(renderUsageBadge(context.item));
            },
        },
        {
            cellClassName: "w-[180px] align-top",
            headerClassName: "w-[180px]",
            key: "inventoryMoveItemId",
            label: "Inventory Move Item",
            renderCell: (context) =>
            {
                const isNew = context.item.id < 0;

                if (isNew)
                {
                    return context.renderReadOnlyValue("-");
                }

                return context.renderReadOnlyValue(resolveInventoryMoveItemId(context.item) ?? "-");
            },
        },
        {
            cellClassName: "min-w-[220px] align-top",
            headerClassName: "min-w-[220px]",
            key: "note",
            label: "Note",
            renderCell: (context) =>
            {
                const isNew = context.item.id < 0;

                if (!isNew)
                {
                    return context.renderReadOnlyValue(context.item.note || "-");
                }

                return (
                    <Input
                        value={context.item.note || ""}
                        onChange={(e) => context.updateItem({ note: e.target.value })}
                        placeholder="Optional note"
                    />
                );
            },
        },
        {
            cellClassName: "w-[260px] align-top",
            headerClassName: "w-[260px] text-right",
            key: "actions",
            label: "Actions",
            renderCell: (context) =>
            {
                const isNew = context.item.id < 0;
                
                if (isNew)
                {
                    const canSave = Boolean(context.item.partId) && Boolean(context.item.quantity) && Number(context.item.quantity) > 0;

                    return (
                        <div className="flex flex-wrap justify-end gap-2">
                            <Button
                                disabled={!canSave}
                                onClick={() => onSavePart?.(context.item)}
                                type="button"
                                variant="default"
                                size="sm"
                            >
                                Save
                            </Button>
                            <Button
                                onClick={() => onRemovePart(context.index)}
                                type="button"
                                variant="destructive"
                                size="sm"
                            >
                                Remove
                            </Button>
                        </div>
                    );
                }

                const parsedPartId = resolvePartId(context.item);
                const isConsumed = resolveInventoryMoveItemId(context.item) !== null;
                const isConsumeDisabled = parsedPartId === null || isConsumed || !canConsumeParts;
                const isDeleteDisabled = parsedPartId === null || isConsumed || !canDeletePlannedParts;

                return (
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
                            variant={isConsumed ? "default" : "outline"}
                            size="sm"
                        >
                            <FiCheckCircle className="size-4" />
                            {isConsumed ? "Consumed" : "Consume"}
                        </Button>

                        {!isConsumed && (
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
                                size="sm"
                            >
                                Delete Planned
                            </Button>
                        )}
                    </div>
                );
            },
        },
    ], [canConsumeParts, canDeletePlannedParts, onConsume, onDeletePlanned, onSavePart, itemMessages, onClearPartSelection, onCodeBlur, resolvingRows, onRemovePart, onOpenLov]);
}
