import React from "react";
import { FiSearch, FiX } from "react-icons/fi";
import { GripVertical, LoaderCircle } from "lucide-react";
import type { ILineItemColumn } from "~/components/Common/LineItemsEditor";
import { ProductLookupDefinition, type IProductLookupRow } from "~/components/Common/LookupField/lookups/product.lookup";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { mapProductToLineItem, type IRepairRequestFormLineItem } from "./helpers";

interface IUseLineItemColumnProps
{
    itemMessages: Record<number, string | undefined>;
    resolvingRows: Record<number, boolean>;
    onClearProductSelection: (index: number) => void;
    onClearItemMessage: (index: number) => void;
    onCodeBlur: (index: number) => Promise<void>;
}

export default function useLineItemColumn({ itemMessages, resolvingRows, onClearProductSelection, onClearItemMessage, onCodeBlur }: IUseLineItemColumnProps): ILineItemColumn<IRepairRequestFormLineItem, IProductLookupRow>[]
{
    return React.useMemo<ILineItemColumn<IRepairRequestFormLineItem, IProductLookupRow>[]>(() => [
        {
            cellClassName: "w-[72px] align-top",
            headerClassName: "w-[72px] text-center",
            key: "index",
            label: "#",
            renderCell: (context) => (
                <div className="flex items-center justify-center gap-1.5 pt-2 text-muted-foreground">
                    {!context.readOnly && <GripVertical className="size-4" />}
                    <span className="min-w-5 text-center text-xs font-semibold">{context.index + 1}</span>
                </div>
            ),
        },
        {
            cellClassName: "min-w-[240px] align-top",
            headerClassName: "min-w-[240px]",
            key: "code",
            label: "Product Code",
            renderCell: (context) => (
                <div className="space-y-2">
                    <div className="flex items-start gap-2">
                        <Input
                            aria-invalid={Boolean(itemMessages[context.index])}
                            className="min-w-0"
                            disabled={context.disabled}
                            onBlur={() => { void onCodeBlur(context.index); }}
                            onChange={(event) =>
                            {
                                context.updateItem({ code: event.target.value });
                                onClearItemMessage(context.index);
                            }}
                            placeholder="Enter product code"
                            type="text"
                            value={String(context.item.code ?? "")}
                        />

                        <Button
                            disabled={context.disabled || !context.openPicker}
                            onClick={() => context.openPicker?.()}
                            size="icon-sm"
                            title="Lookup product"
                            type="button"
                            variant="outline"
                        >
                            <FiSearch className="size-4" />
                        </Button>

                        {String(context.item.code ?? "").trim() !== "" && (
                            <Button
                                disabled={context.disabled}
                                onClick={() => onClearProductSelection(context.index)}
                                size="icon-sm"
                                title="Clear product"
                                type="button"
                                variant="ghost"
                            >
                                <FiX className="size-4" />
                            </Button>
                        )}
                    </div>

                    {(itemMessages[context.index] || resolvingRows[context.index]) && (
                        <div className="flex min-h-5 items-center gap-1.5 text-xs">
                            {resolvingRows[context.index] && (
                                <>
                                    <LoaderCircle className="size-3 animate-spin text-muted-foreground" />
                                    <span className="text-muted-foreground">Resolving product code...</span>
                                </>
                            )}

                            {!resolvingRows[context.index] && itemMessages[context.index] && (
                                <span className="text-destructive">{itemMessages[context.index]}</span>
                            )}
                        </div>
                    )}
                </div>
            ),
            renderPicker: (context) => ({
                definition: ProductLookupDefinition,
                getInitialSearch: (pickerContext) => String(pickerContext.item.code ?? ""),
                onSelect: (product, pickerContext) =>
                {
                    const mappedItem = mapProductToLineItem(product);

                    pickerContext.replaceItem({
                        ...pickerContext.item,
                        ...mappedItem,
                        code: mappedItem.code,
                        name: mappedItem.name,
                    });
                    onClearItemMessage(pickerContext.index);
                },
            }),
        },
        {
            cellClassName: "min-w-[220px] align-top",
            headerClassName: "min-w-[220px]",
            key: "name",
            label: "Product Name",
            renderCell: (context) => (
                <Input
                    disabled
                    readOnly
                    type="text"
                    value={String(context.item.name ?? "")}
                />
            ),
        },
        {
            cellClassName: "min-w-[260px] align-top",
            headerClassName: "min-w-[260px]",
            key: "description",
            label: "Issue Description",
            renderCell: (context) => (
                <Textarea
                    className="min-h-20 resize-y"
                    disabled={context.disabled}
                    onChange={(event) => context.updateItem({ description: event.target.value })}
                    placeholder="Describe the issue"
                    value={String(context.item.description ?? "")}
                />
            ),
        },
        {
            cellClassName: "w-[120px] align-top",
            headerClassName: "w-[120px] text-right",
            key: "quantity",
            label: "Quantity",
            renderCell: (context) => (
                <Input
                    className="text-right"
                    disabled={context.disabled}
                    min={1}
                    onChange={(event) => context.updateItem({ quantity: event.target.value })}
                    step={1}
                    type="number"
                    value={String(context.item.quantity ?? "")}
                />
            ),
        },
        {
            cellClassName: "w-[168px] align-top",
            headerClassName: "w-[168px] text-right",
            key: "actions",
            label: "Actions",
            renderCell: (context) => context.renderDefaultActions(),
        },
    ], [itemMessages, onClearItemMessage, onClearProductSelection, onCodeBlur, resolvingRows]);
}
