import React from "react";
import type { ILineItemValue } from "~/components/Common/LineItemsEditor";
import LineItemsEditor from "~/components/Common/LineItemsEditor";
import useWorkOrderPartLineItemColumn from "./hooks/useWorkOrderPartLineItemColumn";
import { searchParts } from "~/services/parts.service";
import ListPickerModal, { type IFetchParams } from "~/components/Common/ListPickerModal";
import { PartLookupDefinition, type IPartLookupRow } from "~/components/Common/LookupField/lookups/part.lookup";
import { buildLookupPayload } from "~/constants";

export interface IWorkOrderPartLineItem extends ILineItemValue
{
    id: number;
    workOrderId?: number;
    partId?: number | "";
    partCode?: string | null;
    partName?: string | null;
    quantity: number | "";
    note?: string | null;
    inventoryMoveItemId?: number | null;
    inventory_move_item_id?: number | null;
    createdAt?: string | null;
    updatedAt?: string | null;
    createdBy?: string | null;
    updatedBy?: string | null;
}

interface IWorkOrderPartLineItemsEditorProps
{
    canManageParts: boolean;
    departmentId?: number;
    productTypeId?: number;
    items: IWorkOrderPartLineItem[];
    onChange: (items: IWorkOrderPartLineItem[]) => void;
    onConsume?: (partId: number) => void;
    onDeletePlanned?: (partId: number) => void;
    onSavePart?: (part: IWorkOrderPartLineItem) => void;
}

export function createEmptyWorkOrderPartLineItem(): IWorkOrderPartLineItem
{
    return {
        id: -Date.now(),
        partId: "",
        partCode: "",
        partName: "",
        quantity: 1,
        note: "",
    };
}

export default function WorkOrderPartLineItemsEditor({
    canManageParts,
    departmentId,
    productTypeId,
    items,
    onChange,
    onConsume,
    onDeletePlanned,
    onSavePart,
}: IWorkOrderPartLineItemsEditorProps)
{
    const [itemMessages, setItemMessages] = React.useState<Record<number, string | undefined>>({});
    const [resolvingRows, setResolvingRows] = React.useState<Record<number, boolean>>({});
    const itemsRef = React.useRef(items);

    itemsRef.current = items;

    const [pickerIndex, setPickerIndex] = React.useState<number | null>(null);
    const activeUpdateItem = React.useRef<((patch: Partial<IWorkOrderPartLineItem>) => void) | null>(null);

    const updateItem = React.useCallback((index: number, patch: Partial<IWorkOrderPartLineItem>) =>
    {
        onChange(itemsRef.current.map((item, itemIndex) =>
        {
            if (itemIndex !== index)
            {
                return item;
            }

            return { ...item, ...patch };
        }));
    }, [onChange]);

    const replaceItem = React.useCallback((index: number, nextItem: IWorkOrderPartLineItem) =>
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

    const handleOpenLov = React.useCallback((index: number, updateFn: (patch: Partial<IWorkOrderPartLineItem>) => void) =>
    {
        activeUpdateItem.current = updateFn;
        setPickerIndex(index);
    }, []);

    const handleSelectPart = React.useCallback((part: IPartLookupRow) =>
    {
        if (pickerIndex !== null && activeUpdateItem.current)
        {
            activeUpdateItem.current({
                partId: part.id,
                partCode: String(part.code || "").trim(),
                partName: String(part.name || "").trim(),
            });
            setPickerIndex(null);
            activeUpdateItem.current = null;
            setItemMessages((current) => ({ ...current, [pickerIndex]: undefined }));
        }
    }, [pickerIndex]);

    const clearPartSelection = React.useCallback((index: number, updateFn: (patch: Partial<IWorkOrderPartLineItem>) => void) =>
    {
        updateFn({ partCode: "", partName: "", partId: "" });
        setItemMessages((current) => ({ ...current, [index]: undefined }));
    }, []);

    const removeItem = React.useCallback((index: number) =>
    {
        onChange(itemsRef.current.filter((_, itemIndex) => itemIndex !== index));
    }, [onChange]);

    const resolvePartByCode = React.useCallback(async (code: string) =>
    {
        const searchConditions: any[] = [{ name: "code", condition: "EQUAL", value: code }];

        if (productTypeId)
        {
            searchConditions.push({ name: "product_type_id", condition: "EQUAL", value: String(productTypeId) });
        }

        try
        {
            const response = await searchParts({ pageNumber: 1, pageSize: 1, search: searchConditions });
            return response.data[0] || null;
        }
        catch
        {
            return null;
        }
    }, [productTypeId]);

    const handleCodeBlur = React.useCallback(async (index: number, draftItem: IWorkOrderPartLineItem, updateFn: (patch: Partial<IWorkOrderPartLineItem>) => void) =>
    {
        const normalizedCode = String(draftItem.partCode ?? "").trim().toLowerCase();

        if (!normalizedCode)
        {
            clearPartSelection(index, updateFn);
            return;
        }

        setResolvingRows((current) => ({ ...current, [index]: true }));
        setItemMessages((current) => ({ ...current, [index]: undefined }));

        try
        {
            const resolvedItem = await resolvePartByCode(String(draftItem.partCode).trim());

            if (!resolvedItem)
            {
                setItemMessages((current) => ({ ...current, [index]: productTypeId ? "Part code not found or not in product type." : "Part code not found." }));
                updateFn({ partId: "", partName: "" });
                return;
            }

            updateFn({ partId: resolvedItem.id, partCode: String(resolvedItem.code ?? "").trim(), partName: String(resolvedItem.name ?? "").trim() });
            setItemMessages((current) => ({ ...current, [index]: undefined }));
        }
        catch (error)
        {
            setItemMessages((current) => ({ ...current, [index]: error instanceof Error ? error.message : "Unable to resolve part code." }));
            updateFn({ partId: "", partName: "" });
        }
        finally
        {
            setResolvingRows((current) => ({ ...current, [index]: false }));
        }
    }, [clearPartSelection, resolvePartByCode, productTypeId]);

    const lineItemColumns = useWorkOrderPartLineItemColumn({
        canConsumeParts: canManageParts && Boolean(onConsume),
        canDeletePlannedParts: canManageParts && Boolean(onDeletePlanned),
        onConsume,
        onDeletePlanned,
        onSavePart,
        itemMessages,
        onClearPartSelection: clearPartSelection,
        onCodeBlur: handleCodeBlur,
        resolvingRows,
        onRemovePart: removeItem,
        onOpenLov: handleOpenLov,
    });

    return (
        <>
            <LineItemsEditor<IWorkOrderPartLineItem>
                addButtonLabel="Add Needed Part"
                columns={lineItemColumns}
                createEmptyItem={createEmptyWorkOrderPartLineItem}
                disabled={!canManageParts}
                emptyMessage="No parts added yet."
                itemLabel="part"
                onChange={onChange}
                value={items}
            />

            <ListPickerModal<IPartLookupRow>
                {...PartLookupDefinition}
                isOpen={pickerIndex !== null}
                fetchData={async (params: IFetchParams) =>
                {
                    const payload = buildLookupPayload("part", params);

                    if (productTypeId)
                    {
                        payload.search = [
                            ...(payload.search || []),
                            { name: "product_type_id", condition: "EQUAL", value: String(productTypeId) }
                        ];
                    }

                    const response = await searchParts(payload);
                    return {
                        currentPage: response.pagination.currentPage,
                        data: response.data as IPartLookupRow[],
                        hasNext: response.pagination.hasNext,
                        hasPrevious: response.pagination.hasPrevious,
                        pageItemCount: response.pagination.pageSize,
                        total: response.pagination.totalCount,
                        totalPages: response.pagination.totalPages,
                    };
                }}
                onClose={() =>
                {
                    setPickerIndex(null);
                    activeUpdateItem.current = null;
                }}
                onSelect={handleSelectPart}
            />
        </>
    );
}
