import React from "react";
import LineItemsEditor from "~/components/Common/LineItemsEditor";
import { formStyleClassNames } from "~/components/Common/Form/styles";
import { buildLookupPayload, REPAIR_REQUEST_FORM_ITEM } from "~/constants";
import { searchProducts } from "~/services/products.service";
import { createEmptyRepairRequestLineItem, mapProductToLineItem, type IRepairRequestFormLineItem } from "./hooks/helpers";
import useLineItemColumn from "./hooks/useLineItemColumn";

interface IRepairRequestLineItemsEditorProps
{
    disabled?: boolean;
    itemIssues: string[];
    items: IRepairRequestFormLineItem[];
    itemsError?: string;
    onChange: (items: IRepairRequestFormLineItem[]) => void;
    resetTrigger?: unknown;
}

export default function RepairRequestLineItemsEditor({ disabled = false, itemIssues, items, itemsError, onChange, resetTrigger }: IRepairRequestLineItemsEditorProps)
{
    const [itemMessages, setItemMessages] = React.useState<Record<number, string | undefined>>({});
    const [resolvingRows, setResolvingRows] = React.useState<Record<number, boolean>>({});
    const itemsRef = React.useRef(items);

    itemsRef.current = items;

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

    const clearItemMessage = React.useCallback((index: number) =>
    {
        setItemMessages((currentMessages) => ({
            ...currentMessages,
            [index]: undefined,
        }));
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

    const lineItemColumns = useLineItemColumn({
        itemMessages,
        onClearItemMessage: clearItemMessage,
        onClearProductSelection: clearProductSelection,
        onCodeBlur: handleCodeBlur,
        resolvingRows,
    });

    return (
        <>
            <LineItemsEditor
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
