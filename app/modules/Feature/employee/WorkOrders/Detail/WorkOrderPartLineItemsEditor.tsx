import React from "react";
import type { ILineItemValue } from "~/components/Common/LineItemsEditor";
import LineItemsEditor from "~/components/Common/LineItemsEditor";
import useWorkOrderPartLineItemColumn from "./hooks/useWorkOrderPartLineItemColumn";

export interface IWorkOrderPartLineItem extends ILineItemValue
{
    id: number;
    workOrderId: number;
    partId: number;
    partCode: string | null;
    partName: string | null;
    quantity: number;
    note: string | null;
    inventoryMoveItemId: number | null;
    createdAt: string | null;
    updatedAt: string | null;
    createdBy: string | null;
    updatedBy: string | null;
}

interface IWorkOrderPartLineItemsEditorProps
{
    canManageParts: boolean;
    items: IWorkOrderPartLineItem[];
    onConsume?: (partId: number) => void;
    onDeletePlanned?: (partId: number) => void;
}

export default function WorkOrderPartLineItemsEditor({
    canManageParts,
    items,
    onConsume,
    onDeletePlanned,
}: IWorkOrderPartLineItemsEditorProps)
{
    const lineItemColumns = useWorkOrderPartLineItemColumn({
        canConsumeParts: canManageParts && Boolean(onConsume),
        canDeletePlannedParts: canManageParts && Boolean(onDeletePlanned),
        onConsume,
        onDeletePlanned,
    });

    const onReadonlyChange = React.useCallback((_nextItems: IWorkOrderPartLineItem[]) =>
    {
        return;
    }, []);

    return (
        <LineItemsEditor<IWorkOrderPartLineItem>
            columns={lineItemColumns}
            emptyMessage="No parts added yet."
            itemLabel="part item"
            onChange={onReadonlyChange}
            readOnly
            readOnlyVariant="boxed"
            title="Work Order Parts"
            value={items}
        />
    );
}
