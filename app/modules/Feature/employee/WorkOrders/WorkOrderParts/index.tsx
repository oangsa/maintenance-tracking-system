import React from "react";
import { useParams } from "react-router";
import { ApiError } from "~/api/http";
import type { IWorkOrder, IWorkOrderPart } from "~/api/types/types";
import type { IDetailSection } from "~/components/Common/DetailSections";
import Loading from "~/components/Common/Loading";
import { ConfirmModal } from "~/components/Common/Modal";
import Detail from "~/components/Maintain/Detail";
import ErrorCard from "~/components/Maintain/ErrorCard";
import { SEARCH_OPERATOR } from "~/constants";
import { formatDateTime } from "~/lib/formatters";
import { useUserContext } from "~/providers/UserProvider";
import { getDepartmentById } from "~/services/departments.service";
import { searchInventoryMoves } from "~/services/inventoryMoves.service";
import { consumeStock } from "~/services/parts.service";
import { getProductById, searchProducts } from "~/services/products.service";
import { getProductTypeById } from "~/services/productTypes.service";
import { searchAllRepairRequestItems } from "~/services/repairRequests.service";
import {
    finishWorkOrderPartFlow,
    startWorkOrderPartFlow,
} from "~/services/workOrderPartFlow.service";
import {
    createWorkOrderPart,
    deleteWorkOrderPart,
    searchWorkOrderParts,
    updateWorkOrderPart,
} from "~/services/workOrderParts.service";
import { getWorkOrderById } from "~/services/workOrders.service";
import WorkOrderWorkbench from "../Detail/WorkOrderWorkbench";
import {
    createEmptyWorkOrderPartLineItem,
    type IWorkOrderPartLineItem,
} from "../Detail/WorkOrderPartLineItemsEditor";

interface IEmployeeWorkOrderPartsContentProps
{
    currentUserId: number;
    workOrder: IWorkOrder;
}

interface IWorkOrderPartModalState
{
    consumeTarget: IWorkOrderPartLineItem | null;
    deleteTarget: IWorkOrderPartLineItem | null;
}

interface IResolvedScopeState
{
    blockedMessage?: string;
    canOpenPicker: boolean;
    departmentId?: number;
    departmentName?: string | null;
    productTypeId?: number;
    status: "loading" | "ready" | "blocked";
}

interface IInventoryMoveRecord extends Record<string, unknown>
{
    inventoryMoveItems?: unknown;
    inventory_move_items?: unknown;
}

interface IInventoryMoveItemRecord extends Record<string, unknown>
{
    id?: unknown;
    workOrderPartId?: unknown;
    work_order_part_id?: unknown;
}

function buildWorkOrderPartSections(workOrder: IWorkOrder): IDetailSection[]
{
    return [
        {
            fields: [
                { label: "Request No", value: workOrder.repairRequestRequestNo ?? "-" },
                { label: "Repair Request Item", value: workOrder.repairRequestItemProductName ?? "-" },
                { label: "Current Status", value: workOrder.repairRequestItemRepairStatusName ?? "-" },
                { label: "Scheduled Start", value: workOrder.scheduledStart ? formatDateTime(workOrder.scheduledStart) : "-" },
                { label: "Scheduled End", value: workOrder.scheduledEnd ? formatDateTime(workOrder.scheduledEnd) : "-" },
            ],
            title: "Work Order Information",
        },
        {
            fields: [
                { label: "Task Description", value: workOrder.workTaskDescription ?? "-" },
                { label: "Task Note", value: workOrder.workTaskNote ?? "-" },
                { label: "Current Assignee", value: workOrder.workTaskAssigneeName ?? "-" },
                { label: "Assignment Active", value: workOrder.workTaskAssignmentUnassignedAt ? "No" : "Yes" },
            ],
            title: "Assignment Information",
        },
    ];
}

function resolveInventoryMoveItemId(value: unknown): number | null
{
    if (value && typeof value === "object")
    {
        const objectValue = value as Record<string, unknown>;
        const nestedCandidates: unknown[] = [
            objectValue.id,
            objectValue.inventoryMoveItemId,
            objectValue.inventory_move_item_id,
        ];

        for (const candidate of nestedCandidates)
        {
            const nestedResolvedId = resolveInventoryMoveItemId(candidate);

            if (nestedResolvedId !== null)
            {
                return nestedResolvedId;
            }
        }
    }

    const parsedInventoryMoveItemId = Number(value);

    if (!Number.isFinite(parsedInventoryMoveItemId) || parsedInventoryMoveItemId <= 0)
    {
        return null;
    }

    return parsedInventoryMoveItemId;
}

function resolveWorkOrderPartIdFromInventoryMoveItem(item: IInventoryMoveItemRecord): number | null
{
    const directCandidates: unknown[] = [
        item.workOrderPartId,
        item.work_order_part_id,
    ];

    for (const candidate of directCandidates)
    {
        const parsedWorkOrderPartId = Number(candidate);

        if (Number.isFinite(parsedWorkOrderPartId) && parsedWorkOrderPartId > 0)
        {
            return parsedWorkOrderPartId;
        }
    }

    for (const [key, value] of Object.entries(item))
    {
        const normalizedKey = key.toLowerCase().replace(/[_-]/g, "");

        if (normalizedKey !== "workorderpartid")
        {
            continue;
        }

        const parsedWorkOrderPartId = Number(value);

        if (Number.isFinite(parsedWorkOrderPartId) && parsedWorkOrderPartId > 0)
        {
            return parsedWorkOrderPartId;
        }
    }

    return null;
}

function resolveWorkOrderPartInventoryMoveItemId(item: IWorkOrderPart): number | null
{
    const rawItem = item as unknown as Record<string, unknown>;
    const directCandidates: unknown[] = [
        item.inventoryMoveItemId,
        rawItem.inventory_move_item_id,
        rawItem.inventoryMoveItemID,
        rawItem.inventoryMoveItem,
        rawItem.inventory_move_item,
    ];

    for (const candidate of directCandidates)
    {
        const resolvedId = resolveInventoryMoveItemId(candidate);

        if (resolvedId !== null)
        {
            return resolvedId;
        }
    }

    for (const [key, value] of Object.entries(rawItem))
    {
        const normalizedKey = key.toLowerCase().replace(/[_-]/g, "");

        if (normalizedKey !== "inventorymoveitemid" && normalizedKey !== "inventorymoveitem")
        {
            continue;
        }

        const resolvedId = resolveInventoryMoveItemId(value);

        if (resolvedId !== null)
        {
            return resolvedId;
        }
    }

    return null;
}

function normalizeWorkOrderPart(part: IWorkOrderPart): IWorkOrderPartLineItem
{
    const resolvedInventoryMoveItemId = resolveWorkOrderPartInventoryMoveItemId(part);

    return {
        createdAt: part.createdAt ?? null,
        createdBy: part.createdBy ?? null,
        id: part.id,
        inventoryMoveItemId: resolvedInventoryMoveItemId,
        inventory_move_item_id: resolvedInventoryMoveItemId,
        note: part.note ?? null,
        partCode: part.partCode ?? null,
        partId: Number(part.partId),
        partName: part.partName ?? null,
        quantity: Number(part.quantity),
        updatedAt: part.updatedAt ?? null,
        updatedBy: part.updatedBy ?? null,
        workOrderId: Number(part.workOrderId),
    };
}

function isPartConsumed(part: IWorkOrderPartLineItem): boolean
{
    return resolveInventoryMoveItemId(part.inventoryMoveItemId ?? part.inventory_move_item_id) !== null;
}

function resolveDepartmentId(workOrder: IWorkOrder): number | null
{
    const rawWorkOrder = workOrder as unknown as Record<string, unknown>;
    const directCandidates: unknown[] = [
        rawWorkOrder.repairRequestItemDepartmentId,
        rawWorkOrder.repair_request_item_department_id,
        rawWorkOrder.departmentId,
        rawWorkOrder.department_id,
    ];

    for (const candidate of directCandidates)
    {
        const parsedId = Number(candidate);

        if (Number.isFinite(parsedId) && parsedId > 0)
        {
            return parsedId;
        }
    }

    return null;
}

function resolveProductTypeId(workOrder: IWorkOrder): number | null
{
    const rawWorkOrder = workOrder as unknown as Record<string, unknown>;
    const directCandidates: unknown[] = [
        rawWorkOrder.repairRequestItemProductTypeId,
        rawWorkOrder.repair_request_item_product_type_id,
        rawWorkOrder.productTypeId,
        rawWorkOrder.product_type_id,
    ];

    for (const candidate of directCandidates)
    {
        const parsedId = Number(candidate);

        if (Number.isFinite(parsedId) && parsedId > 0)
        {
            return parsedId;
        }
    }

    return null;
}

function resolveProductId(workOrder: IWorkOrder): number | null
{
    const rawWorkOrder = workOrder as unknown as Record<string, unknown>;
    const directCandidates: unknown[] = [
        rawWorkOrder.repairRequestItemProductId,
        rawWorkOrder.repair_request_item_product_id,
        rawWorkOrder.productId,
        rawWorkOrder.product_id,
    ];

    for (const candidate of directCandidates)
    {
        const parsedId = Number(candidate);

        if (Number.isFinite(parsedId) && parsedId > 0)
        {
            return parsedId;
        }
    }

    return null;
}

function buildReadOnlyReason(workOrder: IWorkOrder, scope: IResolvedScopeState, currentUserId: number): string | null
{
    const parsedAssigneeId = Number(workOrder.workTaskAssigneeId);
    const hasWorkTask = Number.isFinite(Number(workOrder.workTaskId)) && Number(workOrder.workTaskId) > 0;
    const isCurrentUserActiveAssignee = Number.isFinite(parsedAssigneeId)
        && parsedAssigneeId > 0
        && !workOrder.workTaskAssignmentUnassignedAt
        && parsedAssigneeId === currentUserId;
    const isFinalWorkOrder = Boolean(workOrder.isFinal);
    const hasStarted = Boolean(workOrder.workTaskStartedAt);
    const hasEnded = Boolean(workOrder.workTaskEndedAt);

    if (!hasWorkTask)
    {
        return "Part management is read-only because this Work Order has no Work Task.";
    }

    if (!isCurrentUserActiveAssignee)
    {
        return "Part management is read-only because you are not the active assignee.";
    }

    if (isFinalWorkOrder)
    {
        return "Part management is read-only because this Work Order is finalized.";
    }

    if (!hasStarted)
    {
        return "Part management is read-only until the Work Task is started.";
    }

    if (hasEnded)
    {
        return "Part management is read-only because the Work Task has already ended.";
    }

    if (!scope.canOpenPicker && scope.blockedMessage)
    {
        return scope.blockedMessage;
    }

    return null;
}

function resolveIsActiveAssignee(workOrder: IWorkOrder, currentUserId: number): boolean
{
    const parsedAssigneeId = Number(workOrder.workTaskAssigneeId);

    return Number.isFinite(parsedAssigneeId)
        && parsedAssigneeId > 0
        && !workOrder.workTaskAssignmentUnassignedAt
        && parsedAssigneeId === currentUserId;
}

function resolveCanManageParts(workOrder: IWorkOrder, currentUserId: number): boolean
{
    return resolveIsActiveAssignee(workOrder, currentUserId)
        && Boolean(workOrder.workTaskId)
        && Boolean(workOrder.workTaskStartedAt)
        && !Boolean(workOrder.workTaskEndedAt)
        && !Boolean(workOrder.isFinal);
}

function EmployeeWorkOrderPartsContent({
    currentUserId,
    workOrder,
}: IEmployeeWorkOrderPartsContentProps)
{
    const [workOrderSnapshot, setWorkOrderSnapshot] = React.useState<IWorkOrder>(workOrder);
    const [parts, setParts] = React.useState<IWorkOrderPartLineItem[]>([]);
    const [isLoadingParts, setIsLoadingParts] = React.useState<boolean>(true);
    const [isStarting, setIsStarting] = React.useState<boolean>(false);
    const [isFinishing, setIsFinishing] = React.useState<boolean>(false);
    const [isPartActionSubmitting, setIsPartActionSubmitting] = React.useState<boolean>(false);
    const [actionError, setActionError] = React.useState<string>("");
    const [actionWarning, setActionWarning] = React.useState<string>("");
    const [scope, setScope] = React.useState<IResolvedScopeState>({
        blockedMessage: "Resolving department/product type scope...",
        canOpenPicker: false,
        status: "loading",
    });
    const [modalState, setModalState] = React.useState<IWorkOrderPartModalState>({
        consumeTarget: null,
        deleteTarget: null,
    });

    React.useEffect(() =>
    {
        setWorkOrderSnapshot(workOrder);
    }, [workOrder]);

    const resolveScope = React.useCallback(async (targetWorkOrder: IWorkOrder): Promise<IResolvedScopeState> =>
    {
        let departmentId = resolveDepartmentId(targetWorkOrder);
        let productTypeId = resolveProductTypeId(targetWorkOrder);
        const repairRequestItemId = Number(targetWorkOrder.repairRequestItemId);
        let requestedItemProductId = resolveProductId(targetWorkOrder);

        if (!Number.isFinite(repairRequestItemId) || repairRequestItemId <= 0)
        {
            return {
                blockedMessage: "Part selection is blocked because Repair Request Item context is invalid.",
                canOpenPicker: false,
                status: "blocked",
            };
        }

        if (!departmentId || !requestedItemProductId)
        {
            const itemResponse = await searchAllRepairRequestItems({
                deleted: false,
                pageNumber: 1,
                pageSize: 1,
                search: [
                    {
                        condition: SEARCH_OPERATOR.EQUAL,
                        name: "id",
                        value: String(repairRequestItemId),
                    },
                ],
            });

            const repairRequestItem = itemResponse.data[0];

            if (!repairRequestItem)
            {
                return {
                    blockedMessage: "Part selection is blocked because Repair Request Item details could not be resolved.",
                    canOpenPicker: false,
                    status: "blocked",
                };
            }

            if (!departmentId)
            {
                departmentId = Number(repairRequestItem.departmentId);
            }

            if (!requestedItemProductId)
            {
                requestedItemProductId = Number(repairRequestItem.productId);
            }
        }

        if (!productTypeId && requestedItemProductId && Number.isFinite(requestedItemProductId) && requestedItemProductId > 0)
        {
            try
            {
                const requestedProduct = await getProductById(String(requestedItemProductId));
                const parsedProductTypeId = Number(requestedProduct.productTypeId);

                if (Number.isFinite(parsedProductTypeId) && parsedProductTypeId > 0)
                {
                    productTypeId = parsedProductTypeId;
                }
            }
            catch
            {
                productTypeId = null;
            }
        }

        if (!productTypeId)
        {
            const productName = String(targetWorkOrder.repairRequestItemProductName ?? "").trim();

            if (productName)
            {
                const productResponse = await searchProducts({
                    deleted: false,
                    pageNumber: 1,
                    pageSize: 1,
                    search: [
                        {
                            condition: SEARCH_OPERATOR.EQUAL,
                            name: "name",
                            value: productName,
                        },
                    ],
                });
                const parsedProductTypeId = Number(productResponse.data[0]?.productTypeId);

                if (Number.isFinite(parsedProductTypeId) && parsedProductTypeId > 0)
                {
                    productTypeId = parsedProductTypeId;
                }
            }
        }

        if (!departmentId || !productTypeId)
        {
            return {
                blockedMessage: "Part selection is blocked because the Work Order department/product type could not be resolved.",
                canOpenPicker: false,
                departmentId: departmentId ?? undefined,
                productTypeId: productTypeId ?? undefined,
                status: "blocked",
            };
        }

        try
        {
            const productType = await getProductTypeById(Number(productTypeId));

            if (Number(productType.departmentId) !== Number(departmentId))
            {
                return {
                    blockedMessage: "Part selection is blocked because product type does not match the Work Order department scope.",
                    canOpenPicker: false,
                    departmentId,
                    productTypeId,
                    status: "blocked",
                };
            }
        }
        catch (error)
        {
            return {
                blockedMessage: `Part selection is blocked because product type scope verification failed. ${(error as Error).message || ""}`.trim(),
                canOpenPicker: false,
                departmentId,
                productTypeId,
                status: "blocked",
            };
        }

        let departmentName: string | null = null;

        try
        {
            const department = await getDepartmentById(Number(departmentId));
            departmentName = department.name || null;
        }
        catch
        {
            departmentName = null;
        }

        return {
            blockedMessage: undefined,
            canOpenPicker: true,
            departmentId,
            departmentName,
            productTypeId,
            status: "ready",
        };
    }, []);

    const reconcileConsumedLinks = React.useCallback(async (lineItems: IWorkOrderPartLineItem[]): Promise<IWorkOrderPartLineItem[]> =>
    {
        const unresolvedPartIds = lineItems
            .filter((part) =>
            {
                return part.id > 0 && resolveInventoryMoveItemId(part.inventoryMoveItemId ?? part.inventory_move_item_id) === null;
            })
            .map((part) => Number(part.id))
            .filter((partId) => Number.isFinite(partId) && partId > 0);
        const targetPartIdSet = new Set<number>(unresolvedPartIds);

        if (targetPartIdSet.size === 0)
        {
            return lineItems;
        }

        const resolvedMoveIdMap = new Map<number, number>();
        let pageNumber = 1;
        const pageSize = 200;
        const maxPagesToScan = 20;

        while (pageNumber <= maxPagesToScan)
        {
            try
            {
                const response = await searchInventoryMoves({
                    deleted: false,
                    orderBy: "id desc",
                    pageNumber,
                    pageSize,
                    search: [],
                });

                for (const move of response.data)
                {
                    const rawMove = move as unknown as IInventoryMoveRecord;
                    const rawItems = Array.isArray(move.inventoryMoveItems)
                        ? move.inventoryMoveItems
                        : (Array.isArray(rawMove.inventory_move_items) ? rawMove.inventory_move_items : []);

                    for (const rawItem of rawItems)
                    {
                        if (!rawItem || typeof rawItem !== "object")
                        {
                            continue;
                        }

                        const item = rawItem as IInventoryMoveItemRecord;
                        const workOrderPartId = resolveWorkOrderPartIdFromInventoryMoveItem(item);

                        if (workOrderPartId === null || !targetPartIdSet.has(workOrderPartId) || resolvedMoveIdMap.has(workOrderPartId))
                        {
                            continue;
                        }

                        const inventoryMoveItemId = resolveInventoryMoveItemId(item.id);
                        const fallbackInventoryMoveItemId = resolveInventoryMoveItemId(
                            item.inventoryMoveItemId
                            ?? item.inventory_move_item_id,
                        );
                        const resolvedInventoryMoveItemId = inventoryMoveItemId ?? fallbackInventoryMoveItemId;

                        if (resolvedInventoryMoveItemId === null)
                        {
                            continue;
                        }

                        resolvedMoveIdMap.set(workOrderPartId, resolvedInventoryMoveItemId);
                    }
                }

                if (resolvedMoveIdMap.size >= targetPartIdSet.size || !response.pagination.hasNext)
                {
                    break;
                }

                pageNumber += 1;
            }
            catch (error)
            {
                if (error instanceof ApiError && (error.statusCode === 400 || error.statusCode === 422))
                {
                    break;
                }

                break;
            }
        }

        if (resolvedMoveIdMap.size === 0)
        {
            return lineItems;
        }

        return lineItems.map((part) =>
        {
            const resolvedMoveItemId = resolvedMoveIdMap.get(part.id);

            if (!resolvedMoveItemId)
            {
                return part;
            }

            return {
                ...part,
                inventoryMoveItemId: resolvedMoveItemId,
            };
        });
    }, []);

    const loadWorkOrderParts = React.useCallback(async (workOrderId: number): Promise<void> =>
    {
        const response = await searchWorkOrderParts({
            pageNumber: 1,
            pageSize: 200,
            search: [
                {
                    condition: SEARCH_OPERATOR.EQUAL,
                    name: "work_order_id",
                    value: String(workOrderId),
                },
            ],
        });

        const normalizedItems = response.data.map((item) => normalizeWorkOrderPart(item));
        const reconciledItems = await reconcileConsumedLinks(normalizedItems);

        setParts(reconciledItems);
    }, [reconcileConsumedLinks]);

    React.useEffect(() =>
    {
        let isMounted = true;

        async function initializePage()
        {
            setIsLoadingParts(true);
            setActionError("");
            setActionWarning("");
            setScope({
                blockedMessage: "Resolving department/product type scope...",
                canOpenPicker: false,
                status: "loading",
            });

            try
            {
                const [resolvedScope] = await Promise.all([
                    resolveScope(workOrderSnapshot),
                    loadWorkOrderParts(workOrderSnapshot.id),
                ]);

                if (!isMounted)
                {
                    return;
                }

                setScope(resolvedScope);
            }
            catch (error)
            {
                if (!isMounted)
                {
                    return;
                }

                setActionError((error as Error).message || "Unable to load Work Order Parts.");
                setScope({
                    blockedMessage: "Part selection is blocked because the Work Order department/product type could not be resolved.",
                    canOpenPicker: false,
                    status: "blocked",
                });
            }
            finally
            {
                if (isMounted)
                {
                    setIsLoadingParts(false);
                }
            }
        }

        initializePage();

        return () =>
        {
            isMounted = false;
        };
    }, [loadWorkOrderParts, resolveScope, workOrderSnapshot.id]);

    function handleChangeParts(nextParts: IWorkOrderPartLineItem[])
    {
        setParts(nextParts);
    }

    function handleAddDraftPart()
    {
        if (!resolveCanManageParts(workOrderSnapshot, currentUserId))
        {
            return;
        }

        if (!scope.canOpenPicker)
        {
            setActionError(scope.blockedMessage || "Part creation is blocked until lookup scope is available.");
            return;
        }

        setActionError("");

        setParts((currentParts) =>
        {
            return [...currentParts, createEmptyWorkOrderPartLineItem()];
        });
    }

    async function handleCreatePart(part: IWorkOrderPartLineItem): Promise<void>
    {
        const partId = Number(part.partId);
        const quantity = Number(part.quantity);

        if (!Number.isFinite(partId) || partId <= 0)
        {
            throw new Error("Part is required.");
        }

        if (!Number.isFinite(quantity) || quantity <= 0)
        {
            throw new Error("Quantity must be greater than 0.");
        }

        setIsPartActionSubmitting(true);
        setActionError("");

        try
        {
            await createWorkOrderPart({
                note: part.note || undefined,
                partId,
                quantity,
                workOrderId: workOrderSnapshot.id,
            });

            await loadWorkOrderParts(workOrderSnapshot.id);
        }
        catch (error)
        {
            const message = (error as Error).message || "Unable to create planned part.";
            setActionError(message);
            throw new Error(message);
        }
        finally
        {
            setIsPartActionSubmitting(false);
        }
    }

    async function handleUpdatePlannedPart(part: IWorkOrderPartLineItem): Promise<void>
    {
        if (isPartConsumed(part))
        {
            throw new Error("Consumed rows cannot be updated.");
        }

        const plannedPartId = Number(part.id);
        const quantity = Number(part.quantity);

        if (!Number.isFinite(plannedPartId) || plannedPartId <= 0)
        {
            throw new Error("The selected planned row is invalid.");
        }

        if (!Number.isFinite(quantity) || quantity <= 0)
        {
            throw new Error("Quantity must be greater than 0.");
        }

        setIsPartActionSubmitting(true);
        setActionError("");

        try
        {
            await updateWorkOrderPart(plannedPartId, {
                note: part.note || undefined,
                quantity,
            });

            await loadWorkOrderParts(workOrderSnapshot.id);
        }
        catch (error)
        {
            const message = (error as Error).message || "Unable to update planned part.";
            setActionError(message);
            throw new Error(message);
        }
        finally
        {
            setIsPartActionSubmitting(false);
        }
    }

    function requestDeletePlannedPart(part: IWorkOrderPartLineItem)
    {
        if (!resolveCanManageParts(workOrderSnapshot, currentUserId))
        {
            return;
        }

        if (isPartConsumed(part))
        {
            setActionError("Consumed rows cannot be deleted from this page.");
            return;
        }

        setModalState((currentState) => ({
            ...currentState,
            deleteTarget: part,
        }));
    }

    function requestConsumePart(part: IWorkOrderPartLineItem)
    {
        if (!resolveCanManageParts(workOrderSnapshot, currentUserId))
        {
            return;
        }

        if (isPartConsumed(part))
        {
            setActionError("This part has already been consumed.");
            return;
        }

        setModalState((currentState) => ({
            ...currentState,
            consumeTarget: part,
        }));
    }

    async function confirmDeletePlannedPart()
    {
        const deleteTargetId = Number(modalState.deleteTarget?.id);

        if (!Number.isFinite(deleteTargetId) || deleteTargetId <= 0)
        {
            setActionError("The selected planned row is invalid.");
            return;
        }

        setIsPartActionSubmitting(true);
        setActionError("");

        try
        {
            await deleteWorkOrderPart(String(deleteTargetId));
            setModalState((currentState) => ({
                ...currentState,
                deleteTarget: null,
            }));
            await loadWorkOrderParts(workOrderSnapshot.id);
        }
        catch (error)
        {
            setActionError((error as Error).message || "Unable to delete planned part.");
        }
        finally
        {
            setIsPartActionSubmitting(false);
        }
    }

    async function confirmConsumePart()
    {
        const consumeTarget = modalState.consumeTarget;

        if (!consumeTarget)
        {
            return;
        }

        if (!Number.isFinite(consumeTarget.id) || consumeTarget.id <= 0)
        {
            setActionError("The selected planned row is invalid.");
            return;
        }

        const consumePartId = Number(consumeTarget.partId);

        if (!Number.isFinite(consumePartId) || consumePartId <= 0)
        {
            setActionError("The selected part id is invalid.");
            return;
        }

        const consumeQuantity = Number(consumeTarget.quantity);

        if (!Number.isFinite(consumeQuantity) || consumeQuantity <= 0)
        {
            setActionError("The selected quantity is invalid.");
            return;
        }

        setIsPartActionSubmitting(true);
        setActionError("");

        try
        {
            await consumeStock(consumePartId, {
                note: consumeTarget.note || undefined,
                quantity: consumeQuantity,
                workOrderPartId: consumeTarget.id,
            });
            setModalState((currentState) => ({
                ...currentState,
                consumeTarget: null,
            }));
            await loadWorkOrderParts(workOrderSnapshot.id);
        }
        catch (error)
        {
            setActionError((error as Error).message || "Unable to consume part stock.");
        }
        finally
        {
            setIsPartActionSubmitting(false);
        }
    }

    async function handleStartWork()
    {
        setIsStarting(true);
        setActionError("");
        setActionWarning("");

        try
        {
            const result = await startWorkOrderPartFlow({
                startedAt: new Date().toISOString(),
                workOrder: workOrderSnapshot,
            });

            setWorkOrderSnapshot(result.workOrder);
            setActionWarning(result.warningMessage || "");
            await loadWorkOrderParts(result.workOrder.id);
        }
        catch (error)
        {
            setActionError((error as Error).message || "Unable to start work.");
        }
        finally
        {
            setIsStarting(false);
        }
    }

    async function handleFinishWork()
    {
        setIsFinishing(true);
        setActionError("");
        setActionWarning("");

        try
        {
            const result = await finishWorkOrderPartFlow({
                endedAt: new Date().toISOString(),
                workOrder: workOrderSnapshot,
            });

            setWorkOrderSnapshot(result.workOrder);
            setActionWarning(result.warningMessage || "");
            await loadWorkOrderParts(result.workOrder.id);
        }
        catch (error)
        {
            setActionError((error as Error).message || "Unable to finish work.");
        }
        finally
        {
            setIsFinishing(false);
        }
    }

    if (isLoadingParts)
    {
        return <Loading message="Loading work order parts..." />;
    }

    return (
        <>
            <ConfirmModal
                cancelText="Cancel"
                closeOnConfirm={false}
                confirmText={isPartActionSubmitting ? "Consuming..." : "Consume"}
                isOpen={modalState.consumeTarget !== null}
                message="This will consume real stock for the selected planned part. Continue?"
                onClose={() => setModalState((currentState) => ({ ...currentState, consumeTarget: null }))}
                onConfirm={confirmConsumePart}
                title="Consume Part"
                variant="primary"
            />

            <ConfirmModal
                cancelText="Cancel"
                closeOnConfirm={false}
                confirmText={isPartActionSubmitting ? "Deleting..." : "Delete"}
                isOpen={modalState.deleteTarget !== null}
                message="This will delete the selected planned part. Continue?"
                onClose={() => setModalState((currentState) => ({ ...currentState, deleteTarget: null }))}
                onConfirm={confirmDeletePlannedPart}
                title="Delete Planned Part"
                variant="danger"
            />

            {actionError && (
                <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                    {actionError}
                </div>
            )}

            {actionWarning && (
                <div className="mb-4 rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-300">
                    {actionWarning}
                </div>
            )}

            <WorkOrderWorkbench
                canOpenPartPicker={scope.canOpenPicker}
                currentUserId={currentUserId}
                isFinishing={isFinishing}
                isPartActionSubmitting={isPartActionSubmitting}
                isStarting={isStarting}
                onAddPart={handleAddDraftPart}
                onChangeParts={handleChangeParts}
                onConsumePart={requestConsumePart}
                onCreatePart={handleCreatePart}
                onDeletePlannedPart={requestDeletePlannedPart}
                onFinishWork={handleFinishWork}
                onStartWork={handleStartWork}
                onUpdatePlannedPart={handleUpdatePlannedPart}
                parts={parts}
                productTypeId={scope.productTypeId}
                readOnlyReason={buildReadOnlyReason(workOrderSnapshot, scope, currentUserId)}
                workOrder={workOrderSnapshot}
            />
        </>
    );
}

export default function EmployeeWorkOrderPartsPage()
{
    const params = useParams();
    const { currentUser, isLoadingUser, userError } = useUserContext();

    if (isLoadingUser && currentUser === null)
    {
        return <Loading message="Loading your access profile..." />;
    }

    if (!currentUser)
    {
        return (
            <ErrorCard
                backHref="/work-orders"
                backLabel="Back to Work Orders"
                message={userError || "Unable to load your user profile."}
            />
        );
    }

    const resolvedCurrentUser = currentUser;

    function renderDetailContent(workOrder: IWorkOrder)
    {
        return (
            <EmployeeWorkOrderPartsContent
                currentUserId={resolvedCurrentUser.id}
                workOrder={workOrder}
            />
        );
    }

    async function loadData(id: number)
    {
        const workOrder = await getWorkOrderById(id);
        const isActiveAssignee = resolveIsActiveAssignee(workOrder, resolvedCurrentUser.id);

        if (!isActiveAssignee)
        {
            throw new Error("You can only manage parts for work orders assigned to you.");
        }

        return workOrder;
    }

    return (
        <Detail<IWorkOrder>
            backHref={`/work-orders/${params.id ?? ""}`}
            backLabel="Back to Work Order"
            buildSections={buildWorkOrderPartSections}
            content={renderDetailContent}
            description="Start or continue the assigned work order part flow."
            id={params.id}
            invalidIdMessage="The requested work order id is invalid."
            loadData={loadData}
            loadErrorMessage="Unable to load the selected work order."
            loadingMessage="Loading work order part flow..."
            notFoundMessage="Work order not found."
            title="Work Order Parts"
        />
    );
}
