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
    canSaveInlineParts: boolean;
    editingRowId: number | null;
    itemMessages: Record<number, string | undefined>;
    onBeginEdit: (item: IWorkOrderPartLineItem) => void;
    onCancelEdit: (index: number, item: IWorkOrderPartLineItem) => void;
    onFinishEdit: (index: number) => void;
    onClearPartSelection: (index: number, updateFn: (patch: Partial<IWorkOrderPartLineItem>) => void) => void;
    onCodeBlur: (index: number, draftItem: IWorkOrderPartLineItem, updateFn: (patch: Partial<IWorkOrderPartLineItem>) => void) => void;
    onConsume?: (part: IWorkOrderPartLineItem) => void;
    onCreatePart?: (part: IWorkOrderPartLineItem) => Promise<void> | void;
    onDeletePlanned?: (part: IWorkOrderPartLineItem) => void;
    onOpenLov: (index: number, updateFn: (patch: Partial<IWorkOrderPartLineItem>) => void) => void;
    onRemovePart: (index: number) => void;
    onUpdatePlanned?: (part: IWorkOrderPartLineItem) => Promise<void> | void;
    resolvingRows: Record<number, boolean>;
}

function resolvePersistedId(item: IWorkOrderPartLineItem): number | null
{
    if (typeof item.id !== "number" || !Number.isFinite(item.id) || item.id <= 0)
    {
        return null;
    }

    return item.id;
}

function resolveInventoryMoveItemId(item: IWorkOrderPartLineItem): number | null
{
    const rawValue = item.inventoryMoveItemId ?? item.inventory_move_item_id;

    if (rawValue && typeof rawValue === "object")
    {
        const objectValue = rawValue as Record<string, unknown>;
        const nestedValue = objectValue.id ?? objectValue.inventoryMoveItemId ?? objectValue.inventory_move_item_id;
        const nestedParsedValue = Number(nestedValue);

        if (Number.isFinite(nestedParsedValue) && nestedParsedValue > 0)
        {
            return nestedParsedValue;
        }
    }

    const parsedInventoryMoveItemId = Number(rawValue);

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
    canSaveInlineParts,
    editingRowId,
    itemMessages,
    onBeginEdit,
    onCancelEdit,
    onFinishEdit,
    onClearPartSelection,
    onCodeBlur,
    onConsume,
    onCreatePart,
    onDeletePlanned,
    onOpenLov,
    onRemovePart,
    onUpdatePlanned,
    resolvingRows,
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
                                disabled={resolvingRows[context.index] || !canSaveInlineParts}
                                onBlur={() => onCodeBlur(context.index, context.item, context.updateItem)}
                                onChange={(event) => context.updateItem({ partCode: event.target.value })}
                                placeholder="Part code..."
                                value={context.item.partCode || ""}
                            />
                            <Button
                                className="shrink-0"
                                disabled={!canSaveInlineParts}
                                onClick={() => onOpenLov(context.index, context.updateItem)}
                                size="icon"
                                type="button"
                                variant="outline"
                            >
                                <FiSearch className="size-4" />
                            </Button>
                            {context.item.partId ? (
                                <Button
                                    className="px-2"
                                    disabled={!canSaveInlineParts}
                                    onClick={() => onClearPartSelection(context.index, context.updateItem)}
                                    size="sm"
                                    type="button"
                                    variant="outline"
                                >
                                    Clear
                                </Button>
                            ) : null}
                        </div>
                        {context.item.partName && <div className="mt-1 text-sm text-muted-foreground">{context.item.partName}</div>}
                        {itemMessages[context.index] && <div className="mt-1 text-sm text-destructive">{itemMessages[context.index]}</div>}
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
                const isEditingPersisted = context.item.id > 0 && editingRowId === context.item.id;
                const canInlineEdit = canSaveInlineParts && (isNew || isEditingPersisted);

                if (!canInlineEdit)
                {
                    return context.renderReadOnlyValue(context.item.quantity, "text-right");
                }

                return (
                    <Input
                        className="text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        min="1"
                        onChange={(event) => context.updateItem({ quantity: event.target.value ? Number(event.target.value) : "" })}
                        type="number"
                        value={context.item.quantity === "" ? "" : String(context.item.quantity)}
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
                if (context.item.id < 0)
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
                if (context.item.id < 0)
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
                const isEditingPersisted = context.item.id > 0 && editingRowId === context.item.id;
                const canInlineEdit = canSaveInlineParts && (isNew || isEditingPersisted);

                if (!canInlineEdit)
                {
                    return context.renderReadOnlyValue(context.item.note || "-");
                }

                return (
                    <Input
                        onChange={(event) => context.updateItem({ note: event.target.value })}
                        placeholder="Optional note"
                        value={context.item.note || ""}
                    />
                );
            },
        },
        {
            cellClassName: "w-[340px] align-top",
            headerClassName: "w-[340px] text-right",
            key: "actions",
            label: "Actions",
            renderCell: (context) =>
            {
                const isNew = context.item.id < 0;
                const persistedId = resolvePersistedId(context.item);
                const isConsumed = resolveInventoryMoveItemId(context.item) !== null;
                const isEditingPersisted = context.item.id > 0 && editingRowId === context.item.id;

                if (isNew)
                {
                    const canSaveNew = canSaveInlineParts
                        && Boolean(context.item.partId)
                        && Boolean(context.item.quantity)
                        && Number(context.item.quantity) > 0;

                    return (
                        <div className="flex flex-wrap justify-end gap-2">
                            <Button
                                disabled={!canSaveNew}
                                onClick={() => onCreatePart?.(context.item)}
                                size="sm"
                                type="button"
                                variant="default"
                            >
                                Save
                            </Button>
                            <Button
                                onClick={() => onRemovePart(context.index)}
                                size="sm"
                                type="button"
                                variant="destructive"
                            >
                                Remove
                            </Button>
                        </div>
                    );
                }

                if (isEditingPersisted)
                {
                    const canSaveUpdate = canSaveInlineParts && !isConsumed && Number(context.item.quantity) > 0;

                    return (
                        <div className="flex flex-wrap justify-end gap-2">
                            <Button
                                disabled={!canSaveUpdate}
                                onClick={async () =>
                                {
                                    if (!onUpdatePlanned)
                                    {
                                        return;
                                    }

                                    await onUpdatePlanned(context.item);
                                    onFinishEdit(context.index);
                                }}
                                size="sm"
                                type="button"
                                variant="default"
                            >
                                Save Changes
                            </Button>
                            <Button
                                onClick={() => onCancelEdit(context.index, context.item)}
                                size="sm"
                                type="button"
                                variant="outline"
                            >
                                Cancel
                            </Button>
                        </div>
                    );
                }

                const isUpdateDisabled = persistedId === null || isConsumed || !canSaveInlineParts;
                const isConsumeDisabled = persistedId === null || isConsumed || !canConsumeParts;
                const isDeleteDisabled = persistedId === null || isConsumed || !canDeletePlannedParts;

                return (
                    <div className="flex flex-wrap justify-end gap-2">
                        <Button
                            disabled={isUpdateDisabled}
                            onClick={() => onBeginEdit(context.item)}
                            size="sm"
                            type="button"
                            variant="outline"
                        >
                            Update Planned
                        </Button>

                        <Button
                            className="gap-1.5"
                            disabled={isConsumeDisabled}
                            onClick={() =>
                            {
                                if (!onConsume)
                                {
                                    return;
                                }

                                onConsume(context.item);
                            }}
                            size="sm"
                            type="button"
                            variant={isConsumed ? "default" : "outline"}
                        >
                            <FiCheckCircle className="size-4" />
                            {isConsumed ? "Consumed" : "Consume"}
                        </Button>

                        <Button
                            className="gap-1.5"
                            disabled={isDeleteDisabled}
                            onClick={() =>
                            {
                                if (!onDeletePlanned)
                                {
                                    return;
                                }

                                onDeletePlanned(context.item);
                            }}
                            size="sm"
                            type="button"
                            variant="destructive"
                        >
                            Delete Planned
                        </Button>
                    </div>
                );
            },
        },
    ], [
        canConsumeParts,
        canDeletePlannedParts,
        canSaveInlineParts,
        editingRowId,
        itemMessages,
        onBeginEdit,
        onCancelEdit,
        onFinishEdit,
        onClearPartSelection,
        onCodeBlur,
        onConsume,
        onCreatePart,
        onDeletePlanned,
        onOpenLov,
        onRemovePart,
        onUpdatePlanned,
        resolvingRows,
    ]);
}
