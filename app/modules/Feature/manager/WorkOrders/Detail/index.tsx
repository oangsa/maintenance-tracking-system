import React from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ConfirmModal } from "~/components/Common/Modal";
import type { IDetailSection } from "~/components/Common/DetailSections";
import Detail from "~/components/Maintain/Detail";
import { buttonVariants, Button } from "~/components/ui/button";
import { formatDateTime } from "~/lib/formatters";
import { deleteWorkOrder, getWorkOrderById } from "~/services/workOrders.service";
import { cn } from "~/lib/utils";

interface IConfirmState
{
    isOpen: boolean;
}

export default function ManagerWorkOrdersDetailPage()
{
    const navigate = useNavigate();
    const params = useParams();

    const [pageError, setPageError] = React.useState("");
    const [confirmState, setConfirmState] = React.useState<IConfirmState>({ isOpen: false });

    async function confirmDelete()
    {
        const parsedId = Number(params.id);

        if (!Number.isFinite(parsedId))
        {
            setPageError("The selected work order id is invalid.");
            return;
        }

        try
        {
            await deleteWorkOrder(parsedId);
            navigate("/manager/work-orders", { replace: true });
        }
        catch (error)
        {
            setPageError((error as Error).message || "Unable to delete the selected work order.");
        }
    }

    function ActionButtons(workOrder: any)
    {
        return (
            <>
                <Link className={cn(buttonVariants({ variant: "outline" }), "gap-1.5 !text-foreground hover:!text-foreground")} to={`/manager/work-orders/${workOrder.id}/edit`}>
                    Edit Work Order
                </Link>
                <Button variant="destructive" onClick={() => setConfirmState({ isOpen: true })} type="button">
                    Delete Work Order
                </Button>
            </>
        );
    }

    function sectionBuilder(workOrder: any): IDetailSection[]
    {
        return [
            {
                title: "Work Order Information",
                fields: [
                    { label: "Repair Request Item", value: workOrder.repairRequestItemDescription ?? workOrder.repairRequestItem?.description ?? "-" },
                    { label: "Status", value: workOrder.repairRequestItemRepairStatusName ?? "-" },
                    { label: "Order Sequence", value: workOrder.orderSequence ?? "-" },
                    { label: "Scheduled Start", value: workOrder.scheduledStart ? formatDateTime(workOrder.scheduledStart) : "-" },
                    { label: "Scheduled End", value: workOrder.scheduledEnd ? formatDateTime(workOrder.scheduledEnd) : "-" },
                ],
             },
             {
                title: "Common Information",
                fields: [
                    { label: "Created At", value: formatDateTime(workOrder.createdAt) },
                    { label: "Updated At", value: formatDateTime(workOrder.updatedAt) },
                    { label: "Created By", value: workOrder.createdBy ?? "-" },
                    { label: "Updated By", value: workOrder.updatedBy ?? "-" },
                ],
            }
        ];
    }

    return (
        <>
            <ConfirmModal
                cancelText="Cancel"
                confirmText="Delete"
                isOpen={confirmState.isOpen}
                message="Are you sure you want to delete this work order?"
                onClose={() => setConfirmState({ isOpen: false })}
                onConfirm={confirmDelete}
                title="Delete Work Order"
            />

            <Detail
                actions={ActionButtons}
                backHref="/manager/work-orders"
                backLabel="Back to Work Orders"
                buildSections={sectionBuilder}
                description="Review the selected work order and continue to edit or delete."
                error={pageError}
                id={params.id}
                invalidIdMessage="The requested work order id is invalid."
                loadData={getWorkOrderById}
                loadErrorMessage="Unable to load the selected work order."
                loadingMessage="Loading work order details..."
                notFoundMessage="Work order not found."
                title="Work Order Details"
            />
        </>
    );
}