import React from "react";
import { FiCheckCircle, FiClock, FiPackage, FiPlay, FiPlusCircle } from "react-icons/fi";
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
    canOpenPartPicker?: boolean;
    currentUserId: number | null;
    isFinishing?: boolean;
    isPartActionSubmitting?: boolean;
    isStarting?: boolean;
    onChangeParts?: (parts: IWorkOrderPartLineItem[]) => void;
    onCreatePart?: (part: IWorkOrderPartLineItem) => Promise<void> | void;
    parts?: IWorkOrderPartLineItem[];
    productTypeId?: number;
    readOnlyReason?: string | null;
    workOrder: IWorkOrder;
    onAddPart?: () => void;
    onConsumePart?: (part: IWorkOrderPartLineItem) => void;
    onDeletePlannedPart?: (part: IWorkOrderPartLineItem) => void;
    onFinishWork?: () => void;
    onStartWork?: () => void;
    onUpdatePlannedPart?: (part: IWorkOrderPartLineItem) => void;
}

interface IFinishState
{
    isOpen: boolean;
}

function isPartConsumed(part: IWorkOrderPartLineItem): boolean
{
    const rawValue = part.inventoryMoveItemId ?? part.inventory_move_item_id;
    let parsedInventoryMoveItemId = Number(rawValue);

    if (!Number.isFinite(parsedInventoryMoveItemId) && rawValue && typeof rawValue === "object")
    {
        const objectValue = rawValue as Record<string, unknown>;
        parsedInventoryMoveItemId = Number(objectValue.id ?? objectValue.inventoryMoveItemId ?? objectValue.inventory_move_item_id);
    }

    return Number.isFinite(parsedInventoryMoveItemId) && parsedInventoryMoveItemId > 0;
}

export default function WorkOrderWorkbench({
    canOpenPartPicker = false,
    currentUserId,
    isFinishing = false,
    isPartActionSubmitting = false,
    isStarting = false,
    onChangeParts,
    onCreatePart,
    parts = [],
    productTypeId,
    readOnlyReason,
    workOrder,
    onAddPart,
    onConsumePart,
    onDeletePlannedPart,
    onFinishWork,
    onStartWork,
    onUpdatePlannedPart,
}: IEmployeeWorkOrderWorkbenchProps)
{
    const [finishState, setFinishState] = React.useState<IFinishState>({ isOpen: false });

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

    const isProcessingStartOrFinish = isStarting || isFinishing;
    const canStartWork = hasWorkTask
        && isCurrentUserActiveAssignee
        && !hasStarted
        && !hasEnded
        && !isFinalWorkOrder
        && !isProcessingStartOrFinish
        && Boolean(onStartWork);
    const canFinishWork = hasWorkTask
        && isCurrentUserActiveAssignee
        && hasStarted
        && !hasEnded
        && !isFinalWorkOrder
        && !isProcessingStartOrFinish
        && Boolean(onFinishWork);
    const canManageParts = isCurrentUserActiveAssignee && hasStarted && !hasEnded && !isFinalWorkOrder;
    const canAddPart = canManageParts
        && canOpenPartPicker
        && !isPartActionSubmitting
        && !isProcessingStartOrFinish
        && Boolean(onAddPart);

    const plannedPartsCount = React.useMemo(() =>
    {
        return parts.reduce((totalQuantity, part) =>
        {
            if (isPartConsumed(part))
            {
                return totalQuantity;
            }

            const parsedQuantity = Number(part.quantity);

            if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0)
            {
                return totalQuantity;
            }

            return totalQuantity + parsedQuantity;
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
                        Start and finish execution as the active assignee.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
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
                            {isStarting ? "Starting..." : "Start Work"}
                        </Button>

                        <Button className="gap-1.5" disabled={!canFinishWork} onClick={handleFinishWork} type="button" variant="outline">
                            <FiCheckCircle className="size-4" />
                            {isFinishing ? "Finishing..." : "Finish Work"}
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

                    <Button className="gap-1.5" disabled={!canAddPart} onClick={onAddPart} type="button">
                        <FiPlusCircle className="size-4" />
                        Add Needed Part
                    </Button>
                </CardHeader>

                <CardContent className="space-y-4">
                    {readOnlyReason && (
                        <div className="rounded-md border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
                            {readOnlyReason}
                        </div>
                    )}

                    <WorkOrderPartLineItemsEditor
                        canOpenPartPicker={canOpenPartPicker}
                        canManageParts={canManageParts}
                        isActionSubmitting={isPartActionSubmitting || isProcessingStartOrFinish}
                        items={parts}
                        onChange={onChangeParts ?? (() => { return; })}
                        onConsume={onConsumePart}
                        onCreatePart={onCreatePart}
                        onDeletePlanned={onDeletePlannedPart}
                        onUpdatePlanned={onUpdatePlannedPart}
                        productTypeId={productTypeId}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
