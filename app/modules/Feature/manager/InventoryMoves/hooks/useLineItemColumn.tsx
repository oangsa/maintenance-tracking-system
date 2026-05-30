import React from "react";
import { FiSearch, FiX } from "react-icons/fi";
import type { ILineItemColumn } from "~/components/Common/LineItemsEditor";
import { PartLookupDefinition, type IPartLookupRow } from "~/components/Common/LookupField/lookups/part.lookup";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import type { IInventoryMoveFormValues } from "~/schemas/inventoryMoveFormSchema";

export type IInventoryMoveFormLineItem = IInventoryMoveFormValues["items"][number];

interface IUseLineItemColumnResult
{
    lineItemColumns: ILineItemColumn<IInventoryMoveFormLineItem, IPartLookupRow>[];
}

function parseNumber(value: string | undefined): number | null
{
    if (!value)
    {
        return null;
    }

    const parsed = Number(value);

    if (!Number.isFinite(parsed))
    {
        return null;
    }

    return parsed;
}

function createPartDisplayValue(item: IInventoryMoveFormLineItem): string
{
    if (item.partCode && item.partName)
    {
        return `${item.partCode} - ${item.partName}`;
    }

    if (item.partCode)
    {
        return item.partCode;
    }

    return item.partName || "";
}

export function createEmptyInventoryMoveLineItem(): IInventoryMoveFormLineItem
{
    return {
        partCode: "",
        partId: "",
        partName: "",
        partTotalStock: "",
        quantityIn: "",
        quantityOut: "",
    };
}

export default function useLineItemColumn(): IUseLineItemColumnResult
{
    const lineItemColumns = React.useMemo<ILineItemColumn<IInventoryMoveFormLineItem, IPartLookupRow>[]>(() => [
        {
            cellClassName: "min-w-[320px] align-top",
            headerClassName: "min-w-[320px]",
            key: "partId",
            label: "Part",
            renderCell: (context) => (
                <div className="space-y-2">
                    <div className="flex items-start gap-2">
                        <Input
                            disabled
                            readOnly
                            type="text"
                            value={createPartDisplayValue(context.item)}
                        />

                        <Button
                            disabled={context.disabled || !context.openPicker}
                            onClick={() => context.openPicker?.()}
                            size="icon-sm"
                            title="Lookup part"
                            type="button"
                            variant="outline"
                        >
                            <FiSearch className="size-4" />
                        </Button>

                        {String(context.item.partId ?? "").trim() !== "" && (
                            <Button
                                disabled={context.disabled}
                                onClick={() =>
                                    context.updateItem({
                                        partCode: "",
                                        partId: "",
                                        partName: "",
                                        partTotalStock: "",
                                    })
                                }
                                size="icon-sm"
                                title="Clear part"
                                type="button"
                                variant="ghost"
                            >
                                <FiX className="size-4" />
                            </Button>
                        )}
                    </div>
                </div>
            ),
            renderPicker: () => ({
                definition: PartLookupDefinition,
                onSelect: (part, pickerContext) =>
                {
                    pickerContext.updateItem({
                        partCode: part.code || "",
                        partId: part.id ? String(part.id) : "",
                        partName: part.name || "",
                        partTotalStock: Number.isFinite(part.totalStock) ? String(part.totalStock) : "",
                    });
                },
            }),
        },
        {
            cellClassName: "w-[120px] align-top",
            headerClassName: "w-[120px] text-right",
            key: "partTotalStock",
            label: "Current Stock",
            renderCell: (context) => (
                <Input
                    className="text-right"
                    disabled
                    readOnly
                    type="text"
                    value={String(context.item.partTotalStock || "-")}
                />
            ),
        },
        {
            cellClassName: "w-[140px] align-top",
            headerClassName: "w-[140px] text-right",
            key: "quantityIn",
            label: "Quantity In",
            renderCell: (context) => (
                <Input
                    className="text-right"
                    disabled={context.disabled}
                    min={0}
                    onChange={(event) => context.updateItem({ quantityIn: event.target.value })}
                    step={1}
                    type="number"
                    value={String(context.item.quantityIn || "")}
                />
            ),
        },
        {
            cellClassName: "w-[140px] align-top",
            headerClassName: "w-[140px] text-right",
            key: "quantityOut",
            label: "Quantity Out",
            renderCell: (context) =>
            {
                const totalStock = parseNumber(context.item.partTotalStock);
                const quantityOut = parseNumber(context.item.quantityOut);
                const hasOverStockWarning = totalStock !== null && quantityOut !== null && quantityOut > totalStock;

                return (
                    <div className="space-y-1">
                        <Input
                            className="text-right"
                            disabled={context.disabled}
                            min={0}
                            onChange={(event) => context.updateItem({ quantityOut: event.target.value })}
                            step={1}
                            type="number"
                            value={String(context.item.quantityOut || "")}
                        />
                        {totalStock !== null && (
                            <p className="text-right text-[11px] text-muted-foreground">
                                Available: {totalStock}
                            </p>
                        )}
                        {hasOverStockWarning && (
                            <p className="text-right text-[11px] text-destructive">
                                Quantity Out exceeds current stock.
                            </p>
                        )}
                    </div>
                );
            },
        },
        {
            cellClassName: "w-[168px] align-top",
            headerClassName: "w-[168px] text-right",
            key: "actions",
            label: "Actions",
            renderCell: (context) => context.renderDefaultActions(),
        },
    ], []);

    return { lineItemColumns };
}
