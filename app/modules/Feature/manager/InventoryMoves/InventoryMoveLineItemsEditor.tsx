import React from "react";
import LineItemsEditor from "~/components/Common/LineItemsEditor";
import useLineItemColumn, { createEmptyInventoryMoveLineItem, type IInventoryMoveFormLineItem } from "./hooks/useLineItemColumn";

interface IInventoryMoveLineItemsEditorProps
{
    disabled?: boolean;
    items: IInventoryMoveFormLineItem[];
    onChange: (items: IInventoryMoveFormLineItem[]) => void;
}

export default function InventoryMoveLineItemsEditor({ disabled = false, items, onChange }: IInventoryMoveLineItemsEditorProps)
{
    const { lineItemColumns } = useLineItemColumn();

    return (
        <LineItemsEditor
            addButtonLabel="Add Part"
            columns={lineItemColumns}
            createEmptyItem={createEmptyInventoryMoveLineItem}
            disabled={disabled}
            emptyMessage="No items added yet."
            itemLabel="transaction item"
            onChange={onChange}
            title="Transaction Items"
            value={items}
        />
    );
}
