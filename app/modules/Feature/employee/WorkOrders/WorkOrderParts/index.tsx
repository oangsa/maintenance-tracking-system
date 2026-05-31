import { useState } from "react";
import { useParams } from "react-router";
import type { IWorkOrder } from "~/api/types/types";
import type { IDetailSection } from "~/components/Common/DetailSections";
import Loading from "~/components/Common/Loading";
import Detail from "~/components/Maintain/Detail";
import ErrorCard from "~/components/Maintain/ErrorCard";
import { formatDateTime } from "~/lib/formatters";
import { useUserContext } from "~/providers/UserProvider";
import { getWorkOrderById } from "~/services/workOrders.service";
import { searchWorkOrderParts, createWorkOrderPart, deleteWorkOrderPart, searchInventoryMoves } from "~/services/workOrderParts.service";
import { consumeStock } from "~/services/parts.service";
import { searchProducts } from "~/services/products.service";
import { http } from "~/api/http";
import WorkOrderWorkbench from "../Detail/WorkOrderWorkbench";
import type { IWorkOrderPartLineItem } from "../Detail/WorkOrderPartLineItemsEditor";

export default function EmployeeWorkOrderPartsPage()
{
    const params = useParams();
    const { currentUser, isLoadingUser, userError } = useUserContext();
    const [parts, setParts] = useState<IWorkOrderPartLineItem[]>([]);
    const [departmentId, setDepartmentId] = useState<number | undefined>();
    const [productTypeId, setProductTypeId] = useState<number | undefined>();

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

    function sectionBuilder(workOrder: IWorkOrder): IDetailSection[]
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
                    { label: "Assignment Active", value: workOrder.workTaskAssignmentUnassignedAt ? "No" : "Yes" },
                ],
                title: "Assignment Information",
            },
        ];
    }

    async function reloadParts(workOrderId: number)
    {
        const partsResponse = await searchWorkOrderParts({
            search: [{ name: "work_order_id", condition: "EQUAL", value: String(workOrderId) }],
            pageNumber: 1,
            pageSize: 100
        });

        let loadedParts = partsResponse.data || [];

        loadedParts = loadedParts.map((p) => ({
            ...p,
            inventoryMoveItemId: p.inventoryMoveItemId ?? (p as any).inventory_move_item_id ?? null
        }));

        const unlinkedParts = loadedParts.filter(p => p.id > 0 && !p.inventoryMoveItemId);
        if (unlinkedParts.length > 0) {
            try {

                const movesResponse = await searchInventoryMoves({
                    pageNumber: 1,
                    pageSize: 1000
                });

                const recentMoves = (movesResponse.data || []).flatMap(move => move.inventoryMoveItems || []);

                loadedParts = loadedParts.map(part => {
                    if (part.id > 0 && !part.inventoryMoveItemId) {

                        const match = recentMoves.find((m: any) => Number(m.workOrderPartId) === part.id);
                        if (match) {
                            return { ...part, inventoryMoveItemId: match.id };
                        }
                    }
                    return part;
                });
            } catch (error) {
                console.warn("Could not scan inventory move items for missing links:", error);
            }
        }

        setParts(prev => {
            const unsaved = prev.filter(p => p.id < 0);
            return [...loadedParts, ...unsaved] as IWorkOrderPartLineItem[];
        });
    }

    async function handleSavePart(part: IWorkOrderPartLineItem) {
        if (!params.id || !part.partId || !part.quantity || Number(part.quantity) <= 0) return;
        await createWorkOrderPart({
            workOrderId: Number(params.id),
            partId: Number(part.partId),
            quantity: Number(part.quantity),
            note: part.note || undefined
        });
        setParts(prev => prev.filter(p => p.id !== part.id));
        await reloadParts(Number(params.id));
    }

    async function handleConsumePart(partId: number) {
        if (!params.id) return;
        const part = parts.find(p => p.id === partId);
        if (!part) return;

        await consumeStock(Number(part.partId), {
            quantity: Number(part.quantity),
            note: part.note || undefined,
            workOrderPartId: part.id
        });

        await reloadParts(Number(params.id));
    }

    async function handleDeletePlannedPart(partId: number) {
        if (!params.id) return;

        await deleteWorkOrderPart(String(partId));

        await reloadParts(Number(params.id));
    }

    function renderDetailContent(workOrder: IWorkOrder)
    {
        async function handleStartWork() {
            if (!workOrder.workTaskId) return;
            try {
                await http(`/api/v1/work-task/${workOrder.workTaskId}`, {
                    method: "PUT",
                    body: JSON.stringify({ startedAt: new Date().toISOString() })
                });
                window.location.reload(); 
            } catch (error) {
                console.error("Failed to start work:", error);
            }
        }

        async function handleFinishWork() {
            if (!workOrder.workTaskId) return;
            try {
                await http(`/api/v1/work-task/${workOrder.workTaskId}`, {
                    method: "PUT",
                    body: JSON.stringify({ endedAt: new Date().toISOString() })
                });
                window.location.reload();
            } catch (error) {
                console.error("Failed to finish work:", error);
            }
        }

        return (
            <WorkOrderWorkbench
                currentUserId={resolvedCurrentUser.id}
                departmentId={departmentId}
                productTypeId={productTypeId}
                onChangeParts={setParts}
                onConsumePart={handleConsumePart}
                onDeletePlannedPart={handleDeletePlannedPart}
                onFinishWork={handleFinishWork}
                onSavePart={handleSavePart}
                onStartWork={handleStartWork}
                parts={parts}
                workOrder={workOrder}
            />
        );
    }

    async function loadData(id: number)
    {
        const workOrder = await getWorkOrderById(id);
        const parsedAssigneeId = Number(workOrder.workTaskAssigneeId);
        const isActiveAssignee = Number.isFinite(parsedAssigneeId)
            && parsedAssigneeId > 0
            && !workOrder.workTaskAssignmentUnassignedAt
            && parsedAssigneeId === resolvedCurrentUser.id;

        if (!isActiveAssignee)
        {
            throw new Error("You can only manage parts for work orders assigned to you.");
        }

        setDepartmentId((workOrder as any).repairRequestItemDepartmentId);
        
        const directProductTypeId = (workOrder as any).repairRequestItemProductTypeId;

        if (directProductTypeId)
        {
            setProductTypeId(directProductTypeId);
        }
        else
        {
            const productId = (workOrder as any).repairRequestItemProductId;
            const productName = workOrder.repairRequestItemProductName;
            try
            {
                const searchCondition = productId 
                    ? { name: "id", condition: "EQUAL", value: String(productId) }
                    : { name: "name", condition: "EQUAL", value: String(productName || "") };
                    
                if (searchCondition.value)
                {
                    const productRes = await searchProducts({
                        search: [searchCondition as any],
                        pageNumber: 1,
                        pageSize: 1
                    });

                    if (productRes.data && productRes.data.length > 0)
                    {
                        setProductTypeId(productRes.data[0].productTypeId);
                    }
                }
            }
            catch (error)
            {
                console.warn("Could not fetch product type for part filtering", error);
            }
        }
        
        await reloadParts(id);

        return workOrder;
    }

    return (
        <Detail<IWorkOrder>
            backHref={`/work-orders/${params.id ?? ""}`}
            backLabel="Back to Work Order"
            buildSections={sectionBuilder}
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
