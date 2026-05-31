import React from "react";
import type { ILineItemValue } from "~/components/Common/LineItemsEditor";
import LineItemsEditor from "~/components/Common/LineItemsEditor";
import ListPickerModal, { type IFetchParams } from "~/components/Common/ListPickerModal";
import { PartLookupDefinition, type IPartLookupRow } from "~/components/Common/LookupField/lookups/part.lookup";
import { SEARCH_OPERATOR, buildLookupPayload } from "~/constants";
import { searchParts } from "~/services/parts.service";
import useWorkOrderPartLineItemColumn from "./hooks/useWorkOrderPartLineItemColumn";

export interface IWorkOrderPartLineItem extends ILineItemValue
{
    createdAt?: string | null;
    createdBy?: string | null;
    id: number;
    inventoryMoveItemId?: number | null;
    inventory_move_item_id?: number | null;
    note?: string | null;
    partCode?: string | null;
    partId?: number | "";
    partName?: string | null;
    quantity: number | "";
    updatedAt?: string | null;
    updatedBy?: string | null;
    workOrderId?: number;
}

interface IWorkOrderPartLineItemsEditorProps
{
    canManageParts: boolean;
    canOpenPartPicker: boolean;
    isActionSubmitting?: boolean;
    items: IWorkOrderPartLineItem[];
    productTypeId?: number;
    onChange: (items: IWorkOrderPartLineItem[]) => void;
    onConsume?: (part: IWorkOrderPartLineItem) => void;
    onCreatePart?: (part: IWorkOrderPartLineItem) => Promise<void> | void;
    onDeletePlanned?: (part: IWorkOrderPartLineItem) => void;
    onUpdatePlanned?: (part: IWorkOrderPartLineItem) => Promise<void> | void;
}

export function createEmptyWorkOrderPartLineItem(): IWorkOrderPartLineItem
{
    return {
        id: -Date.now(),
        note: "",
        partCode: "",
        partId: "",
        partName: "",
        quantity: 1,
    };
}

function resolveInventoryMoveItemId(part: IWorkOrderPartLineItem): number | null
{
    const rawValue = part.inventoryMoveItemId ?? part.inventory_move_item_id;

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

    const parsedId = Number(rawValue);

    if (!Number.isFinite(parsedId) || parsedId <= 0)
    {
        return null;
    }

    return parsedId;
}

export default function WorkOrderPartLineItemsEditor({
    canManageParts,
    canOpenPartPicker,
    isActionSubmitting = false,
    items,
    productTypeId,
    onChange,
    onConsume,
    onCreatePart,
    onDeletePlanned,
    onUpdatePlanned,
}: IWorkOrderPartLineItemsEditorProps)
{
    const [editingRowId, setEditingRowId] = React.useState<number | null>(null);
    const [itemMessages, setItemMessages] = React.useState<Record<number, string | undefined>>({});
    const [resolvingRows, setResolvingRows] = React.useState<Record<number, boolean>>({});
    const [pickerIndex, setPickerIndex] = React.useState<number | null>(null);
    const activeUpdateItem = React.useRef<((patch: Partial<IWorkOrderPartLineItem>) => void) | null>(null);
    const originalEditingItem = React.useRef<IWorkOrderPartLineItem | null>(null);
    const itemsRef = React.useRef(items);

    itemsRef.current = items;

    const canEditInline = canManageParts && !isActionSubmitting;

    React.useEffect(() =>
    {
        if (editingRowId !== null && !items.some((item) => item.id === editingRowId))
        {
            setEditingRowId(null);
            originalEditingItem.current = null;
        }
    }, [editingRowId, items]);

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
        if (!canOpenPartPicker || !canEditInline)
        {
            setItemMessages((current) => ({ ...current, [index]: "Part selection is blocked because lookup scope is not ready." }));
            return;
        }

        activeUpdateItem.current = updateFn;
        setPickerIndex(index);
    }, [canOpenPartPicker, canEditInline]);

    const handleSelectPart = React.useCallback((part: IPartLookupRow) =>
    {
        if (pickerIndex !== null && activeUpdateItem.current)
        {
            activeUpdateItem.current({
                partCode: String(part.code || "").trim(),
                partId: part.id,
                partName: String(part.name || "").trim(),
            });
            setItemMessages((current) => ({ ...current, [pickerIndex]: undefined }));
            setPickerIndex(null);
            activeUpdateItem.current = null;
        }
    }, [pickerIndex]);

    const clearPartSelection = React.useCallback((index: number, updateFn: (patch: Partial<IWorkOrderPartLineItem>) => void) =>
    {
        updateFn({ partCode: "", partId: "", partName: "" });
        setItemMessages((current) => ({ ...current, [index]: undefined }));
    }, []);

    const removeItem = React.useCallback((index: number) =>
    {
        onChange(itemsRef.current.filter((_item, itemIndex) => itemIndex !== index));
    }, [onChange]);

    const resolvePartByCode = React.useCallback(async (code: string) =>
    {
        if (!canOpenPartPicker || !productTypeId)
        {
            return null;
        }

        const searchConditions = [
            { condition: SEARCH_OPERATOR.EQUAL, name: "code", value: code },
            { condition: SEARCH_OPERATOR.EQUAL, name: "product_type_id", value: String(productTypeId) },
        ];

        const response = await searchParts({
            deleted: false,
            orderBy: "code asc",
            pageNumber: 1,
            pageSize: 1,
            search: searchConditions,
        });

        return response.data[0] || null;
    }, [canOpenPartPicker, productTypeId]);

    const handleCodeBlur = React.useCallback(async (index: number, draftItem: IWorkOrderPartLineItem, updateFn: (patch: Partial<IWorkOrderPartLineItem>) => void) =>
    {
        const normalizedCode = String(draftItem.partCode ?? "").trim();

        if (!normalizedCode)
        {
            clearPartSelection(index, updateFn);
            return;
        }

        if (!canOpenPartPicker || !productTypeId)
        {
            setItemMessages((current) => ({ ...current, [index]: "Part selection is blocked because lookup scope is not ready." }));
            updateFn({ partId: "", partName: "" });
            return;
        }

        setResolvingRows((current) => ({ ...current, [index]: true }));
        setItemMessages((current) => ({ ...current, [index]: undefined }));

        try
        {
            const resolvedPart = await resolvePartByCode(normalizedCode);

            if (!resolvedPart)
            {
                setItemMessages((current) => ({ ...current, [index]: "Part code not found in the allowed product type scope." }));
                updateFn({ partId: "", partName: "" });
                return;
            }

            updateFn({
                partCode: String(resolvedPart.code ?? "").trim(),
                partId: resolvedPart.id,
                partName: String(resolvedPart.name ?? "").trim(),
            });
            setItemMessages((current) => ({ ...current, [index]: undefined }));
        }
        catch (error)
        {
            setItemMessages((current) => ({ ...current, [index]: (error as Error).message || "Unable to resolve part code." }));
            updateFn({ partId: "", partName: "" });
        }
        finally
        {
            setResolvingRows((current) => ({ ...current, [index]: false }));
        }
    }, [canOpenPartPicker, clearPartSelection, productTypeId, resolvePartByCode]);

    const lineItemColumns = useWorkOrderPartLineItemColumn({
        canConsumeParts: canManageParts && !isActionSubmitting && Boolean(onConsume),
        canDeletePlannedParts: canManageParts && !isActionSubmitting && Boolean(onDeletePlanned),
        canSaveInlineParts: canEditInline && (Boolean(onCreatePart) || Boolean(onUpdatePlanned)),
        editingRowId,
        itemMessages,
        onBeginEdit: (item) =>
        {
            originalEditingItem.current = { ...item };
            setEditingRowId(item.id);
        },
        onCancelEdit: (index, item) =>
        {
            if (item.id > 0 && originalEditingItem.current && originalEditingItem.current.id === item.id)
            {
                replaceItem(index, originalEditingItem.current);
            }
            setEditingRowId(null);
            originalEditingItem.current = null;
            setItemMessages((current) => ({ ...current, [index]: undefined }));
        },
        onFinishEdit: (index) =>
        {
            setEditingRowId(null);
            originalEditingItem.current = null;
            setItemMessages((current) => ({ ...current, [index]: undefined }));
        },
        onClearPartSelection: clearPartSelection,
        onCodeBlur: handleCodeBlur,
        onConsume,
        onCreatePart,
        onDeletePlanned,
        onOpenLov: handleOpenLov,
        onRemovePart: removeItem,
        onUpdatePlanned,
        resolvingRows,
    });

    return (
        <>
            <LineItemsEditor<IWorkOrderPartLineItem>
                addButtonLabel="Add Needed Part"
                columns={lineItemColumns}
                createEmptyItem={createEmptyWorkOrderPartLineItem}
                disabled={!canManageParts || isActionSubmitting}
                emptyMessage="No parts added yet."
                hideAddButton
                itemLabel="part"
                onChange={onChange}
                value={items}
            />

            <ListPickerModal<IPartLookupRow>
                {...PartLookupDefinition}
                fetchData={async (params: IFetchParams) =>
                {
                    if (!canOpenPartPicker || !productTypeId)
                    {
                        return {
                            currentPage: params.page,
                            data: [],
                            hasNext: false,
                            hasPrevious: false,
                            pageItemCount: params.limit,
                            total: 0,
                            totalPages: 0,
                        };
                    }

                    const payload = buildLookupPayload("part", params);

                    payload.search = [
                        ...(payload.search || []),
                        {
                            condition: SEARCH_OPERATOR.EQUAL,
                            name: "product_type_id",
                            value: String(productTypeId),
                        },
                    ];

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
                isOpen={pickerIndex !== null}
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
