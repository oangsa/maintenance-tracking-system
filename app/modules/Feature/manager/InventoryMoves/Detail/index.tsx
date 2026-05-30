import React from "react";
import { useNavigate, useParams } from "react-router";
import LineItemsEditor from "~/components/Common/LineItemsEditor";
import { ConfirmModal } from "~/components/Common/Modal";
import type { IDetailSection } from "~/components/Common/DetailSections";
import Detail from "~/components/Maintain/Detail";
import { Button } from "~/components/ui/button";
import { formatDateTime } from "~/lib/formatters";
import { getInventoryMoveById, reverseInventoryMove } from "~/services/inventoryMoves.service";
import type { IInventoryMove, IInventoryMoveForCreate } from "~/api/types/types";
import type { ILineItemColumn, ILineItemValue } from "~/components/Common/LineItemsEditor";

interface IConfirmState
{
    isOpen: boolean;
}

interface IReverseConfirmState extends IConfirmState
{
    payload: IInventoryMoveForCreate | null;
}

interface IInventoryMoveDetailLineItem extends ILineItemValue
{
    partLabel: string;
    quantityIn: number;
    quantityOut: number;
}

interface IInventoryMoveItemDisplay extends Record<string, unknown>
{
    partId: number;
    partCode?: string | null;
    partName?: string | null;
    code?: string | null;
    name?: string | null;
    workOrderPartId?: number | null;
    workOrderPartPartCode?: string | null;
    workOrderPartPartName?: string | null;
}

function renderTextValue(value: string | null | undefined): string
{
    if (!value?.trim())
    {
        return "-";
    }

    return value.trim();
}

function buildPartLabel(item: IInventoryMoveItemDisplay): string
{
    const hasPartId = Number.isFinite(item.partId);
    const hasWorkOrderPartId = typeof item.workOrderPartId === "number" && Number.isFinite(item.workOrderPartId);
    const partCode = String(item.partCode || item.code || "").trim();
    const partName = String(item.partName || item.name || "").trim();
    const workOrderPartCode = String(item.workOrderPartPartCode || "").trim();
    const workOrderPartName = String(item.workOrderPartPartName || "").trim();

    if (hasPartId && partCode && partName)
    {
        return `${partCode} - ${partName}`;
    }

    if (hasPartId && partCode)
    {
        return partCode;
    }

    if (hasPartId && partName)
    {
        return partName;
    }

    if (hasPartId)
    {
        return `Part ID: ${item.partId}`;
    }

    if (hasWorkOrderPartId && workOrderPartCode && workOrderPartName)
    {
        return `${workOrderPartCode} - ${workOrderPartName}`;
    }

    if (hasWorkOrderPartId && workOrderPartCode)
    {
        return workOrderPartCode;
    }

    if (hasWorkOrderPartId && workOrderPartName)
    {
        return workOrderPartName;
    }

    if (hasWorkOrderPartId)
    {
        return `Work Order Part ID: ${item.workOrderPartId}`;
    }

    return "-";
}

export default function ManagerInventoryMovesDetailPage()
{
    const navigate = useNavigate();
    const params = useParams();

    const [pageError, setPageError] = React.useState("");
    const [reverseConfirmState, setReverseConfirmState] = React.useState<IReverseConfirmState>({
        isOpen: false,
        payload: null,
    });
    const lineItemColumns = React.useMemo<ILineItemColumn<IInventoryMoveDetailLineItem>[]>(() => [
        {
            cellClassName: "w-16 align-top",
            headerClassName: "w-16",
            key: "index",
            label: "No",
            renderCell: (context) => context.renderReadOnlyValue(String(context.index + 1), "font-medium text-muted-foreground"),
        },
        {
            cellClassName: "min-w-[280px] align-top",
            headerClassName: "min-w-[280px]",
            key: "partLabel",
            label: "Part",
            renderCell: (context) => context.renderReadOnlyValue(renderTextValue(context.item.partLabel), "font-medium"),
        },
        {
            cellClassName: "w-[120px] align-top",
            headerClassName: "w-[120px] text-right",
            key: "quantityIn",
            label: "Qty In",
            renderCell: (context) => context.renderReadOnlyValue(String(context.item.quantityIn), "text-right font-medium"),
        },
        {
            cellClassName: "w-[120px] align-top",
            headerClassName: "w-[120px] text-right",
            key: "quantityOut",
            label: "Qty Out",
            renderCell: (context) => context.renderReadOnlyValue(String(context.item.quantityOut), "text-right font-medium"),
        },
    ], []);

    function buildDetailLineItems(inventoryMove: IInventoryMove): IInventoryMoveDetailLineItem[]
    {
        return inventoryMove.inventoryMoveItems.map((item) =>
        {
            const displayItem = item as unknown as IInventoryMoveItemDisplay;

            return {
                id: item.id,
                partLabel: buildPartLabel(displayItem),
                quantityIn: item.quantityIn || 0,
                quantityOut: item.quantityOut || 0,
            };
        });
    }

    function buildReversePayload(inventoryMove: IInventoryMove): IInventoryMoveForCreate | null
    {
        const sourceItems = inventoryMove.inventoryMoveItems;

        if (!sourceItems.length)
        {
            return null;
        }

        return {
            reason: inventoryMove.reason,
            remark: inventoryMove.remark,
            inventoryMoveItems: sourceItems.map((item) => ({
                partId: item.partId,
                quantityIn: item.quantityOut ?? null,
                quantityOut: item.quantityIn ?? null,
            })),
        };
    }

    async function confirmReverse()
    {
        const parsedId = Number(params.id);

        if (!Number.isFinite(parsedId))
        {
            setPageError("The selected transaction id is invalid.");
            return;
        }

        if (!reverseConfirmState.payload)
        {
            setPageError("Unable to reverse because transaction items are missing.");

            return;
        }

        try
        {
            await reverseInventoryMove(parsedId, reverseConfirmState.payload);
            navigate("/manager/inventory-moves", { replace: true });
        }
        catch (error)
        {
            setPageError((error as Error).message || "Unable to reverse the selected transaction.");
            setReverseConfirmState({
                isOpen: false,
                payload: null,
            });
        }
    }

    function handleOpenReverseConfirm(inventoryMove: IInventoryMove)
    {
        const reversePayload = buildReversePayload(inventoryMove);

        if (!reversePayload)
        {
            setPageError("Unable to reverse because this transaction has no items.");

            return;
        }

        setPageError("");
        setReverseConfirmState({
            isOpen: true,
            payload: reversePayload,
        });
    }

    function ActionButtons(inventoryMove: IInventoryMove)
    {
        return (
            <>
                <Button variant="outline" onClick={() => handleOpenReverseConfirm(inventoryMove)} type="button">
                    Reverse Transaction
                </Button>
            </>
        );
    }

    function sectionBuilder(inventoryMove: IInventoryMove): IDetailSection[]
    {
        return [
            {
                title: "Transaction Information",
                fields: [
                    { label: "Transaction No", value: inventoryMove.moveNo ?? "-" },
                    { label: "Reason", value: inventoryMove.reason ?? "-" },
                    { label: "Move Date", value: inventoryMove.moveDate ?? "-" },
                    { label: "Remarks", value: inventoryMove.remark ?? "-" },
                ],
             },
             {
                title: "Common Information",
                fields: [
                    { label: "Created At", value: formatDateTime(inventoryMove.createdAt) },
                    { label: "Updated At", value: formatDateTime(inventoryMove.updatedAt) },
                    { label: "Created By", value: inventoryMove.createdBy ?? "-" },
                    { label: "Updated By", value: inventoryMove.updatedBy ?? "-" },
                ],
            }
        ];
    }

    function DetailContent(inventoryMove: IInventoryMove)
    {
        const detailLineItems = buildDetailLineItems(inventoryMove);

        return (
            <LineItemsEditor
                columns={lineItemColumns}
                emptyMessage="No transaction items found."
                itemLabel="transaction item"
                onChange={() => undefined}
                readOnly
                readOnlyVariant="plain"
                title="Transaction Items"
                value={detailLineItems}
            />
        );
    }

    return (
        <>
            <ConfirmModal
                cancelText="Cancel"
                confirmText="Confirm Reverse"
                isOpen={reverseConfirmState.isOpen}
                message="Are you sure you want to reverse this transaction? This action will generate a new compensating inventory move to correct the stock levels."
                onClose={() =>
                    setReverseConfirmState({
                        isOpen: false,
                        payload: null,
                    })
                }
                onConfirm={confirmReverse}
                title="Reverse Transaction"
            />

            <Detail
                actions={ActionButtons}
                backHref="/manager/inventory-moves"
                backLabel="Back to Inventory Moves"
                buildSections={sectionBuilder}
                content={DetailContent}
                description="Review the selected inventory move transaction. Use Reverse to correct mistakes."
                error={pageError}
                id={params.id}
                invalidIdMessage="The requested transaction id is invalid."
                loadData={getInventoryMoveById}
                loadErrorMessage="Unable to load the selected transaction."
                loadingMessage="Loading transaction details..."
                notFoundMessage="Transaction not found."
                title="Inventory Move Details"
            />
        </>
    );
}
