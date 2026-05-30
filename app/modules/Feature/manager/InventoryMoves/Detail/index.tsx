import React from "react";
import { useNavigate, useParams } from "react-router";
import { ConfirmModal } from "~/components/Common/Modal";
import type { IDetailSection } from "~/components/Common/DetailSections";
import Detail from "~/components/Maintain/Detail";
import { Button } from "~/components/ui/button";
import { formatDateTime } from "~/lib/formatters";
import { deleteInventoryMove, getInventoryMoveById, reverseInventoryMove } from "~/services/inventoryMoves.service";
import type { IInventoryMove, IInventoryMoveItem } from "~/api/types/types";

interface IConfirmState
{
    isOpen: boolean;
}

export default function ManagerInventoryMovesDetailPage()
{
    const navigate = useNavigate();
    const params = useParams();

    const [pageError, setPageError] = React.useState("");
    const [deleteConfirmState, setDeleteConfirmState] = React.useState<IConfirmState>({ isOpen: false });
    const [reverseConfirmState, setReverseConfirmState] = React.useState<IConfirmState>({ isOpen: false });

    async function confirmDelete()
    {
        const parsedId = Number(params.id);

        if (!Number.isFinite(parsedId))
        {
            setPageError("The selected transaction id is invalid.");
            return;
        }

        try
        {
            await deleteInventoryMove(parsedId);
            navigate("/manager/inventory-moves", { replace: true });
        }
        catch (error)
        {
            setPageError((error as Error).message || "Unable to delete the selected transaction.");
        }
    }

    async function confirmReverse()
    {
        const parsedId = Number(params.id);

        if (!Number.isFinite(parsedId))
        {
            setPageError("The selected transaction id is invalid.");
            return;
        }

        try
        {
            await reverseInventoryMove(parsedId);
            navigate("/manager/inventory-moves", { replace: true });
        }
        catch (error)
        {
            setPageError((error as Error).message || "Unable to reverse the selected transaction.");
            setReverseConfirmState({ isOpen: false });
        }
    }

    function ActionButtons(inventoryMove: IInventoryMove)
    {
        return (
            <>
                <Button variant="outline" onClick={() => setReverseConfirmState({ isOpen: true })} type="button">
                    Reverse Transaction
                </Button>
                <Button variant="destructive" onClick={() => setDeleteConfirmState({ isOpen: true })} type="button">
                    Delete
                </Button>
            </>
        );
    }

    function sectionBuilder(inventoryMove: IInventoryMove): IDetailSection[]
    {
        const itemsList = (inventoryMove.items || []) as IInventoryMoveItem[];

        return [
            {
                title: "Transaction Information",
                fields: [
                    { label: "Transaction No", value: inventoryMove.moveNo ?? "-" },
                    { label: "Remarks", value: inventoryMove.remark ?? "-" },
                ],
             },
             {
                title: "Transaction Items",
                fields: [
                    { 
                        label: "Items Details", 
                        value: itemsList.length 
                            ? itemsList.map((i: IInventoryMoveItem) => `${i.partCode || '-'} (In: ${i.quantityIn || 0}, Out: ${i.quantityOut || 0})`).join(" | ") 
                            : "No items found." 
                    }
                ]
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

    return (
        <>
            <ConfirmModal
                cancelText="Cancel"
                confirmText="Delete"
                isOpen={deleteConfirmState.isOpen}
                message="Are you sure you want to delete this inventory move? (Note: Modifying historical transactions directly is not recommended)."
                onClose={() => setDeleteConfirmState({ isOpen: false })}
                onConfirm={confirmDelete}
                title="Delete Transaction"
            />

            <ConfirmModal
                cancelText="Cancel"
                confirmText="Confirm Reverse"
                isOpen={reverseConfirmState.isOpen}
                message="Are you sure you want to reverse this transaction? This action will generate a new compensating inventory move to correct the stock levels."
                onClose={() => setReverseConfirmState({ isOpen: false })}
                onConfirm={confirmReverse}
                title="Reverse Transaction"
            />

            <Detail
                actions={ActionButtons}
                backHref="/manager/inventory-moves"
                backLabel="Back to Inventory Moves"
                buildSections={sectionBuilder}
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