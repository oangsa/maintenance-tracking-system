import React from "react";
import { FiSearch, FiX } from "react-icons/fi";
import { GripVertical, LoaderCircle } from "lucide-react";
import LineItemsEditor, { type ILineItemColumn, type ILineItemPickerColumn, type ILineItemPickerFetchParams } from "~/components/Common/LineItemsEditor";
import { formStyleClassNames } from "~/components/Common/Form/styles";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import type { IProduct } from "~/api/types/types";
import { buildLookupPayload, REPAIR_REQUEST_FORM_ITEM } from "~/constants";
import { searchProducts } from "~/services/products.service";
import { createEmptyRepairRequestLineItem, mapProductToLineItem, type IRepairRequestFormLineItem } from "./hooks/helpers";

type IProductPickerRow = IProduct & Record<string, unknown>;

interface IRepairRequestLineItemsEditorProps
{
    disabled?: boolean;
    itemIssues: string[];
    items: IRepairRequestFormLineItem[];
    itemsError?: string;
    onChange: (items: IRepairRequestFormLineItem[]) => void;
    resetTrigger?: unknown;
}

export default function RepairRequestLineItemsEditor({
    disabled = false,
    itemIssues,
    items,
    itemsError,
    onChange,
    resetTrigger,
}: IRepairRequestLineItemsEditorProps)
{
    const [itemMessages, setItemMessages] = React.useState<Record<number, string | undefined>>({});
    const [resolvingRows, setResolvingRows] = React.useState<Record<number, boolean>>({});
    const itemsRef = React.useRef(items);

    itemsRef.current = items;

    const productColumns = React.useMemo<ILineItemPickerColumn<IProductPickerRow>[]>(() => [
        {
            key: "code",
            label: "Code",
        },
        {
            key: "name",
            label: "Name",
        },
        {
            key: "productTypeName",
            label: "Product Type",
        },
    ], []);

    React.useEffect(() =>
    {
        setItemMessages({});
        setResolvingRows({});
    }, [resetTrigger]);

    const updateItem = React.useCallback((index: number, patch: Partial<IRepairRequestFormLineItem>) =>
    {
        onChange(itemsRef.current.map((item, itemIndex) =>
        {
            if (itemIndex !== index)
            {
                return item;
            }

            return {
                ...item,
                ...patch,
            };
        }));
    }, [onChange]);

    const replaceItem = React.useCallback((index: number, nextItem: IRepairRequestFormLineItem) =>
    {
        onChange(itemsRef.current.map((item, itemIndex) =>
        {
            if (itemIndex !== index)
            {
                return item;
            }

            return nextItem;
        }));
    }, [onChange]);

    const clearProductSelection = React.useCallback((index: number) =>
    {
        updateItem(index, {
            code: "",
            name: "",
            productId: "",
        });
        setItemMessages((currentMessages) => ({
            ...currentMessages,
            [index]: undefined,
        }));
    }, [updateItem]);

    const fetchProducts = React.useCallback(async (params: ILineItemPickerFetchParams) =>
    {
        const response = await searchProducts(buildLookupPayload("product", {
            limit: params.limit,
            page: params.page,
            search: params.search,
            sortBy: params.sortBy,
            sortDir: params.sortDir,
        }));

        return {
            currentPage: response.pagination.currentPage,
            data: response.data as IProductPickerRow[],
            hasNext: response.pagination.hasNext,
            hasPrevious: response.pagination.hasPrevious,
            pageItemCount: response.pagination.pageSize,
            total: response.pagination.totalCount,
            totalPages: response.pagination.totalPages,
        };
    }, []);

    const resolveProductByCode = React.useCallback(async (code: string) =>
    {
        const response = await searchProducts({
            ...buildLookupPayload("product", {
                limit: 1,
                page: 1,
                search: "",
            }),
            search: [
                {
                    condition: "EQUAL",
                    name: "code",
                    value: code,
                },
            ],
        });

        const matchedProduct = response.data[0];

        if (!matchedProduct)
        {
            return null;
        }

        return mapProductToLineItem(matchedProduct);
    }, []);

    const handleCodeBlur = React.useCallback(async (index: number) =>
    {
        const currentItem = itemsRef.current[index];

        if (!currentItem)
        {
            return;
        }

        const normalizedCode = String(currentItem.code ?? "").trim().toLowerCase();

        if (!normalizedCode)
        {
            clearProductSelection(index);

            return;
        }

        setResolvingRows((currentRows) => ({
            ...currentRows,
            [index]: true,
        }));
        setItemMessages((currentMessages) => ({
            ...currentMessages,
            [index]: undefined,
        }));

        try
        {
            const resolvedItem = await resolveProductByCode(String(currentItem.code).trim());
            const latestItem = itemsRef.current[index];

            if (!latestItem || String(latestItem.code ?? "").trim().toLowerCase() !== normalizedCode)
            {
                return;
            }

            if (!resolvedItem)
            {
                setItemMessages((currentMessages) => ({
                    ...currentMessages,
                    [index]: "Product code was not found.",
                }));

                return;
            }

            replaceItem(index, {
                ...latestItem,
                ...resolvedItem,
                code: String(resolvedItem.code ?? latestItem.code ?? "").trim(),
                name: String(resolvedItem.name ?? latestItem.name ?? "").trim(),
            });
            setItemMessages((currentMessages) => ({
                ...currentMessages,
                [index]: undefined,
            }));
        }
        catch (error)
        {
            const latestItem = itemsRef.current[index];

            if (!latestItem || String(latestItem.code ?? "").trim().toLowerCase() !== normalizedCode)
            {
                return;
            }

            setItemMessages((currentMessages) => ({
                ...currentMessages,
                [index]: error instanceof Error && error.message
                    ? error.message
                    : "Unable to resolve product code.",
            }));
        }
        finally
        {
            setResolvingRows((currentRows) => ({
                ...currentRows,
                [index]: false,
            }));
        }
    }, [clearProductSelection, replaceItem, resolveProductByCode]);

    const lineItemColumns = React.useMemo<ILineItemColumn<IRepairRequestFormLineItem, IProductPickerRow>[]>(() => [
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
                            onBlur={() => { void handleCodeBlur(context.index); }}
                            onChange={(event) =>
                            {
                                context.updateItem({ code: event.target.value });
                                setItemMessages((currentMessages) => ({
                                    ...currentMessages,
                                    [context.index]: undefined,
                                }));
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
                                onClick={() => clearProductSelection(context.index)}
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
                columns: productColumns,
                emptyDefault: "No products are available.",
                emptySearch: "No matching products found.",
                fetchData: fetchProducts,
                getInitialSearch: (pickerContext) => String(pickerContext.item.code ?? ""),
                itemName: "products",
                onSelect: (product, pickerContext) =>
                {
                    const mappedItem = mapProductToLineItem(product);

                    pickerContext.replaceItem({
                        ...pickerContext.item,
                        ...mappedItem,
                        code: mappedItem.code,
                        name: mappedItem.name,
                    });
                    setItemMessages((currentMessages) => ({
                        ...currentMessages,
                        [pickerContext.index]: undefined,
                    }));
                },
                searchPlaceholder: "Search product code or name...",
                title: "Select Product",
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
    ], [clearProductSelection, fetchProducts, handleCodeBlur, itemMessages, productColumns, resolvingRows]);

    return (
        <>
            <LineItemsEditor<IRepairRequestFormLineItem, IProductPickerRow>
                addButtonLabel={REPAIR_REQUEST_FORM_ITEM.ADD_PRODUCT}
                columns={lineItemColumns}
                createEmptyItem={createEmptyRepairRequestLineItem}
                disabled={disabled}
                emptyMessage={REPAIR_REQUEST_FORM_ITEM.EMPTY_ITEMS}
                itemLabel={REPAIR_REQUEST_FORM_ITEM.PRODUCT_ITEM_LABEL}
                onChange={onChange}
                title={REPAIR_REQUEST_FORM_ITEM.ITEMS_TITLE}
                value={items}
            />

            {itemsError && <div className="form-error">{itemsError}</div>}
            {itemIssues.length > 0 && (
                <div className={formStyleClassNames.lineItemErrors}>
                    {itemIssues.map((issue) => (
                        <p key={issue}>{issue}</p>
                    ))}
                </div>
            )}
        </>
    );
}
