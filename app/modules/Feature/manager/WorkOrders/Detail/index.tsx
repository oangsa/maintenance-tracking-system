import React from "react";
import { Link, useNavigate, useParams } from "react-router";
import { FiUserCheck } from "react-icons/fi";
import { ConfirmModal } from "~/components/Common/Modal";
import type { IDetailSection } from "~/components/Common/DetailSections";
import Detail from "~/components/Maintain/Detail";
import { buttonVariants, Button } from "~/components/ui/button";
import { formatDateTime } from "~/lib/formatters";
import { cn } from "~/lib/utils";
import { useUserContext } from "~/providers/UserProvider";
import { deleteWorkOrder, getWorkOrderById } from "~/services/workOrders.service";
import type { IWorkTaskAssignment } from "~/api/types/types";
import AssignmentModal from "./AssignmentModal";
import AssignmentHistoryModal from "./AssignmentHistoryModal";
import useWorkTaskAssignment from "../hooks/useWorkTaskAssignment";

interface IConfirmState
{
    isOpen: boolean;
}

interface ITaskAssignmentSectionProps
{
    currentUserId: number | null;
    onAssignmentSaved: () => void;
    onWorkTaskAction: () => void;
    workOrder: Awaited<ReturnType<typeof getWorkOrderById>>;
}

function buildFallbackActiveAssignment(workOrder: Awaited<ReturnType<typeof getWorkOrderById>>): IWorkTaskAssignment | null
{
    const parsedAssigneeId = Number(workOrder.workTaskAssigneeId);

    if (!Number.isFinite(parsedAssigneeId) || parsedAssigneeId <= 0)
    {
        return null;
    }

    if (workOrder.workTaskAssignmentUnassignedAt)
    {
        return null;
    }

    return {
        assignedAt: workOrder.workTaskAssignmentAssignedAt || new Date().toISOString(),
        assignedById: workOrder.workTaskAssignedById ?? null,
        assignedByName: workOrder.workTaskAssignedByName ?? null,
        assigneeEmail: workOrder.workTaskAssigneeEmail ?? null,
        assigneeId: parsedAssigneeId,
        assigneeName: workOrder.workTaskAssigneeName ?? null,
        id: 0,
        unassignedAt: null,
        workTaskId: Number(workOrder.workTaskId),
    };
}

function ManagerWorkTaskAssignmentSection({
    currentUserId,
    onAssignmentSaved,
    onWorkTaskAction,
    workOrder,
}: ITaskAssignmentSectionProps)
{
    const parsedWorkTaskId = Number(workOrder?.workTaskId);
    const hasWorkTask = Number.isFinite(parsedWorkTaskId) && parsedWorkTaskId > 0;

    const {
        assignmentHistory,
        assigneeDepartmentId,
        fetchAssigneeOptions,
        isLoading,
        isSubmitting,
        loadError,
        submitError,
        submitAssignment,
    } = useWorkTaskAssignment({
        repairRequestItemId: workOrder.repairRequestItemId,
        workTaskId: hasWorkTask ? parsedWorkTaskId : null,
    });

    const [isAssignmentModalOpen, setIsAssignmentModalOpen] = React.useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = React.useState(false);

    const sortedAssignmentHistory = React.useMemo(() => [...assignmentHistory].sort((left, right) =>
    {
        const leftTime = Date.parse(left.assignedAt || "");
        const rightTime = Date.parse(right.assignedAt || "");

        return rightTime - leftTime;
    }), [assignmentHistory]);

    const activeAssignment = React.useMemo(() =>
    {
        const assignmentFromHistory = sortedAssignmentHistory.find((historyItem) => !historyItem.unassignedAt) ?? null;

        if (assignmentFromHistory)
        {
            return assignmentFromHistory;
        }

        return buildFallbackActiveAssignment(workOrder);
    }, [sortedAssignmentHistory, workOrder]);

    const hasActiveAssignee = activeAssignment !== null;
    const assignmentButtonLabel = hasActiveAssignee ? "Reassign Technician" : "Assign Technician";
    const assignmentMode = hasActiveAssignee ? "reassign" : "assign";

    async function handleSubmitAssignment(assigneeId: number)
    {
        await submitAssignment(assigneeId);
        onAssignmentSaved();
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap justify-end gap-2">
                <Button className="gap-1.5" onClick={onWorkTaskAction} type="button" variant="default">
                    {hasWorkTask ? "Update Task" : "Create Task"}
                </Button>

                {hasWorkTask && (
                    <Button className="gap-1.5" onClick={() => setIsAssignmentModalOpen(true)} type="button" variant="outline">
                        <FiUserCheck size={14} />
                        {assignmentButtonLabel}
                    </Button>
                )}

                {hasWorkTask && (
                    <Button onClick={() => setIsHistoryModalOpen(true)} type="button" variant="outline">
                        View Assignment History
                    </Button>
                )}
            </div>

            {hasWorkTask && (
                <AssignmentModal
                    currentAssignee={activeAssignment}
                    currentUserId={currentUserId}
                    fetchAssigneeOptions={fetchAssigneeOptions}
                    isDepartmentResolved={assigneeDepartmentId !== null}
                    isOpen={isAssignmentModalOpen}
                    isSubmitting={isSubmitting}
                    mode={assignmentMode}
                    onClose={() => setIsAssignmentModalOpen(false)}
                    onSubmit={handleSubmitAssignment}
                    submitError={submitError}
                />
            )}

            {hasWorkTask && (
                <AssignmentHistoryModal
                    error={loadError}
                    history={sortedAssignmentHistory}
                    isLoading={isLoading}
                    isOpen={isHistoryModalOpen}
                    onClose={() => setIsHistoryModalOpen(false)}
                />
            )}
        </div>
    );
}

export default function ManagerWorkOrdersDetailPage()
{
    const navigate = useNavigate();
    const params = useParams();
    const { currentUser } = useUserContext();

    const [detailRefreshKey, setDetailRefreshKey] = React.useState(0);
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

    function handleWorkTaskAction(workOrder: Awaited<ReturnType<typeof getWorkOrderById>>): void
    {
        const parsedWorkOrderId = Number(workOrder.id);
        const parsedWorkTaskId = Number(workOrder.workTaskId);
        const hasWorkTask = Number.isFinite(parsedWorkTaskId) && parsedWorkTaskId > 0;

        if (hasWorkTask)
        {
            navigate(`/manager/work-tasks/${parsedWorkTaskId}/edit`);
            return;
        }

        if (!Number.isFinite(parsedWorkOrderId))
        {
            setPageError("The selected work order id is invalid.");
            return;
        }

        navigate(`/manager/work-tasks/new?workOrderId=${parsedWorkOrderId}`);
    }

    function ActionButtons(workOrder: Awaited<ReturnType<typeof getWorkOrderById>>)
    {
        return (
            <>
                <Link className={cn(buttonVariants({ variant: "outline" }), "gap-1.5 !text-foreground hover:!text-foreground")} to={`/manager/work-orders/${workOrder.id}/edit`}>
                    Edit Work Order
                </Link>
                <Button onClick={() => setConfirmState({ isOpen: true })} type="button" variant="destructive">
                    Delete Work Order
                </Button>
            </>
        );
    }

    function sectionBuilder(workOrder: Awaited<ReturnType<typeof getWorkOrderById>>): IDetailSection[]
    {
        return [
            {
                title: "Work Order Information",
                fields: [
                    { label: "Repair Request Item", value: workOrder.repairRequestItemProductName ?? "-" },
                    { label: "Status", value: workOrder.repairRequestItemRepairStatusName ?? "-" },
                    { label: "Order Sequence", value: workOrder.orderSequence ?? "-" },
                    { label: "Scheduled Start", value: workOrder.scheduledStart ? formatDateTime(workOrder.scheduledStart) : "-" },
                    { label: "Scheduled End", value: workOrder.scheduledEnd ? formatDateTime(workOrder.scheduledEnd) : "-" },
                ],
            },
            {
                title: "Work Task Detail",
                fields: [
                    { label: "Task Id", value: workOrder.workTaskId ?? "-" },
                    { label: "Task Description", value: workOrder.workTaskDescription ?? "-" },
                    { label: "Current Assignee", value: workOrder.workTaskAssigneeName ?? "-" },
                    { label: "Assigned By", value: workOrder.workTaskAssignedByName ?? "-" },
                    { label: "Assigned At", value: formatDateTime(workOrder.workTaskAssignmentAssignedAt) },
                    { label: "Started At", value: formatDateTime(workOrder.workTaskStartedAt) },
                    { label: "Ended At", value: formatDateTime(workOrder.workTaskEndedAt) },
                    { label: "Note", value: workOrder.workTaskNote ?? "-" },
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
            },
        ];
    }

    function RenderWorkTaskSection(workOrder: Awaited<ReturnType<typeof getWorkOrderById>>)
    {
        return (
            <ManagerWorkTaskAssignmentSection
                currentUserId={currentUser?.id ?? null}
                onAssignmentSaved={() =>
                {
                    setDetailRefreshKey((currentValue) => currentValue + 1);
                }}
                onWorkTaskAction={() => handleWorkTaskAction(workOrder)}
                workOrder={workOrder}
            />
        );
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
                key={detailRefreshKey}
                actions={ActionButtons}
                backHref="/manager/work-orders"
                backLabel="Back to Work Orders"
                buildSections={sectionBuilder}
                content={RenderWorkTaskSection}
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
