import React from "react";
import { FiCheckCircle, FiClock, FiPackage, FiPlay } from "react-icons/fi";
import type { IWorkOrder } from "~/api/types/types";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "~/components/ui/card";
import { ConfirmModal } from "~/components/Common/Modal";
import { formatDateTime } from "~/lib/formatters";
import WorkOrderPartLineItemsEditor, { type IWorkOrderPartLineItem } from "./WorkOrderPartLineItemsEditor";

interface IEmployeeWorkOrderWorkbenchProps
{
    currentUserId: number | null;
    parts?: IWorkOrderPartLineItem[];
    workOrder: IWorkOrder;
    onChangeParts?: (parts: IWorkOrderPartLineItem[]) => void;
    onConsumePart?: (partId: number) => void;
    onDeletePlannedPart?: (partId: number) => void;
    onSavePart?: (part: IWorkOrderPartLineItem) => void;
    onFinishWork?: () => void;
    onStartWork?: () => void;
    departmentId?: number;
    productTypeId?: number;
}

interface IFinishState
{
    isOpen: boolean;
}

export default function WorkOrderWorkbench({
    currentUserId,
    parts = [],
    workOrder,
    onChangeParts,
    onConsumePart,
    onDeletePlannedPart,
    onSavePart,
    onFinishWork,
    onStartWork,
    departmentId,
    productTypeId,
}: IEmployeeWorkOrderWorkbenchProps)
{
    const [finishState, setFinishState] = React.useState<IFinishState>({ isOpen: false });
    const [consumePartId, setConsumePartId] = React.useState<number | null>(null);
    const [deletePartId, setDeletePartId] = React.useState<number | null>(null);

    const parsedAssigneeId = Number(workOrder.workTaskAssigneeId);
    const hasWorkTask = Number.isFinite(Number(workOrder.workTaskId)) && Number(workOrder.workTaskId) > 0;
    const isCurrentUserActiveAssignee = Number.isFinite(parsedAssigneeId)
        && parsedAssigneeId > 0
        && !workOrder.workTaskAssignmentUnassignedAt
        && currentUserId !== null
        && parsedAssigneeId === currentUserId;
    const isFinalWorkOrder = Boolean(workOrder.isFinal);
    const hasStarted = Boolean(workOrder.workTaskStartedAt);
    const hasEnded = Boolean(workOrder.workTaskEndedAt);

    const canStartWork = hasWorkTask
        && isCurrentUserActiveAssignee
        && !hasStarted
        && !hasEnded
        && !isFinalWorkOrder
        && Boolean(onStartWork);
    const canFinishWork = hasWorkTask
        && isCurrentUserActiveAssignee
        && hasStarted
        && !hasEnded
        && !isFinalWorkOrder
        && Boolean(onFinishWork);
    const canManageParts = isCurrentUserActiveAssignee && hasStarted && !hasEnded && !isFinalWorkOrder;

    let workOrderStatus = "Pending";
    let statusVariant: "default" | "secondary" | "outline" = "outline";
    if (hasEnded) {
        workOrderStatus = "Finished";
        statusVariant = "secondary";
    } else if (hasStarted) {
        workOrderStatus = "In Progress";
        statusVariant = "default";
    }

    const plannedPartsCount = React.useMemo(() =>
    {
        return parts.reduce((total, part) =>
        {
            if (part.inventoryMoveItemId === null || part.inventoryMoveItemId === undefined)
            {
                return total + (Number(part.quantity) || 0);
            }

            return total;
        }, 0);
    }, [parts]);

    function handleStartWork()
    {
        if (!canStartWork)
        {
            return;
        }

        onStartWork?.();
    }

    function handleFinishWork()
    {
        if (!canFinishWork)
        {
            return;
        }

        if (plannedPartsCount > 0)
        {
            setFinishState({ isOpen: true });
            return;
        }

        onFinishWork?.();
    }

    function handleConfirmFinishWork()
    {
        onFinishWork?.();
        setFinishState({ isOpen: false });
    }

    return (
        <div className="space-y-6">
            <ConfirmModal
                cancelText="Cancel"
                confirmText="Consume Part"
                isOpen={consumePartId !== null}
                message="Are you sure you want to consume this part? This action cannot be undone and will deduct actual inventory stock."
                onClose={() => setConsumePartId(null)}
                onConfirm={() =>
                {
                    if (consumePartId !== null)
                    {
                        onConsumePart?.(consumePartId);
                        setConsumePartId(null);
                    }
                }}
                title="Confirm Consume Part"
                variant="primary"
            />

            <ConfirmModal
                cancelText="Cancel"
                confirmText="Delete Planned Part"
                isOpen={deletePartId !== null}
                message="Are you sure you want to delete this planned part?"
                onClose={() => setDeletePartId(null)}
                onConfirm={() =>
                {
                    if (deletePartId !== null)
                    {
                        onDeletePlannedPart?.(deletePartId);
                        setDeletePartId(null);
                    }
                }}
                title="Confirm Delete"
                variant="danger"
            />


            <ConfirmModal
                cancelText="Cancel"
                confirmText="Finish Work"
                isOpen={finishState.isOpen}
                message="This work order still has planned but unconsumed parts. Continue to finish work?"
                onClose={() => setFinishState({ isOpen: false })}
                onConfirm={handleConfirmFinishWork}
                title="Finish With Planned Parts"
                variant="primary"
            />

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FiClock className="size-4" />
                        Work Process Actions
                    </CardTitle>
                    <CardDescription>
                        Start and finish execution as the active assignee when the real task actions are available.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={statusVariant}>
                            Status: {workOrderStatus}
                        </Badge>

                        <Badge variant={isCurrentUserActiveAssignee ? "default" : "destructive"}>
                            {isCurrentUserActiveAssignee ? "You are active assignee" : "You are not active assignee"}
                        </Badge>

                        {isFinalWorkOrder && (
                            <Badge variant="secondary">Work Order Finalized</Badge>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                        <div className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm">
                            <div className="text-xs text-muted-foreground">Started At</div>
                            <div className="font-medium text-foreground">{formatDateTime(workOrder.workTaskStartedAt)}</div>
                        </div>

                        <div className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm">
                            <div className="text-xs text-muted-foreground">Ended At</div>
                            <div className="font-medium text-foreground">{formatDateTime(workOrder.workTaskEndedAt)}</div>
                        </div>

                        <div className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm">
                            <div className="text-xs text-muted-foreground">Planned Parts</div>
                            <div className="font-medium text-foreground">{plannedPartsCount}</div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button className="gap-1.5" disabled={!canStartWork} onClick={handleStartWork} type="button">
                            <FiPlay className="size-4" />
                            Start Work
                        </Button>

                        <Button className="gap-1.5" disabled={!canFinishWork} onClick={handleFinishWork} type="button" variant="outline">
                            <FiCheckCircle className="size-4" />
                            Finish Work
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-start justify-between gap-3">
                    <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2">
                            <FiPackage className="size-4" />
                            Work Order Parts
                        </CardTitle>
                        <CardDescription>
                            Manage planned parts and consume them when actually used.
                        </CardDescription>
                    </div>
                </CardHeader>

                <CardContent>
                    <WorkOrderPartLineItemsEditor
                        canManageParts={canManageParts}
                        departmentId={departmentId}
                        productTypeId={productTypeId}
                        items={parts}
                        onChange={onChangeParts ?? (() => { return; })}
                        onConsume={setConsumePartId}
                        onDeletePlanned={setDeletePartId}
                        onSavePart={onSavePart}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
