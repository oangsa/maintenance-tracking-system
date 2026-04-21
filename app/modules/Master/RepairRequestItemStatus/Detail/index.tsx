import { useNavigate, useParams, Link } from "react-router";
import Detail from "~/components/Maintain/Detail";
import { deleteRepairRequestItemStatus, getRepairRequestItemStatusById } from "~/services/repairRequestItemStatus.service";
import { formatDateTime } from "~/lib/formatters";
import { cn } from "~/lib/utils";
import type { IDetailSection } from "~/components/Common/DetailSections";
import type { IRepairRequestItemStatus } from "~/api/types/types";
import React from "react";
import { buttonVariants } from "@/components/ui/button";
import { ConfirmModal } from "@/components/Common/Modal";

interface IConfirmState
{
    isOpen: boolean;
}


export default function RepairRequestItemStatusDetailPage()
{
    const navigate = useNavigate();
    const params = useParams();

    const [pageError, setPageError] = React.useState("");
    const [confirmState, setConfirmState] = React.useState<IConfirmState>({ isOpen: false });

    const confirmDelete = async () =>
    {
        const parsedId = Number(params.id);

        if (!Number.isFinite(parsedId))
        {
            setPageError("The selected status id is invalid.");
            return;
        }

        try
        {
            await deleteRepairRequestItemStatus(parsedId);
            navigate("/master/repair-request-item-status", { replace: true });
        }
        catch (error)
        {
            setPageError((error as Error).message || "Unable to delete the selected status.");
        }
    }

    const ActionButtons = (status: IRepairRequestItemStatus) =>
    {
        return (
            <>
                <Link className={cn(buttonVariants({ variant: "outline" }), "gap-1.5", "!text-foreground", "hover:!text-foreground")} to={`/master/repair-request-item-status/${status.id}/edit`}>
                    Edit Status
                </Link>
                <button className={cn(buttonVariants({ variant: "destructive" }), "gap-1.5")} onClick={() => setConfirmState({ isOpen: true })} type="button">
                    Delete Status
                </button>
             </>
        )
    }

    const sectionBuilder = (status: IRepairRequestItemStatus): IDetailSection[] =>
    {
        return [
            {
                title: "Repair Request Item Status Information",
                fields: [
                    { label: "Status Code", value: status.code },
                    { label: "Name", value: status.name },
                    { label: "Final Processing Status", value: status.isFinal ? "True" : "False" },
                    { label: "Order Sequence", value: status.orderSequence.toString() },
                ]
            },
            {
                title: "Common Information",
                fields: [
                    { label: "Created At", value: formatDateTime(status.createdAt) },
                    { label: "Updated At", value: formatDateTime(status.updatedAt) },
                    { label: "Created By", value: status.createdBy ?? "-" },
                    { label: "Updated By", value: status.updatedBy ?? "-" },
                ]
            }
        ]
    }

    return (
        <>
            <ConfirmModal
                cancelText = "Cancel"
                confirmText = "Delete"
                isOpen = { confirmState.isOpen }
                message = "Are you sure you want to delete this status?"
                onConfirm = { confirmDelete }
                onClose = { () => setConfirmState({ isOpen: false }) }
                title = "Delete Repair Request Item Status"
            />

            <Detail
                actions = { ActionButtons }
                backHref = "/master/repair-request-item-status"
                backLabel = "Back to Repair Request Item Status  List"
                buildSections = { sectionBuilder }
                description = "Detailed information about the selected repair request item status."
                error = { pageError }
                id = { params.id }
                invalidIdMessage="The requested repair request item status id is invalid."
                loadData={getRepairRequestItemStatusById}
                loadErrorMessage="Unable to load the selected status."
                loadingMessage="Loading repair request item status details..."
                notFoundMessage="Status not found."
                title="Repair Request Item Status Details"
            />
        </>
    )
}
