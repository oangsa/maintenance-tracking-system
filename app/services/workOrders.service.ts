import {
    createWorkOrderRequest,
    deleteWorkOrderCollectionRequest,
    deleteWorkOrderRequest,
    getWorkOrderByIdRequest,
    searchWorkOrdersByRepairRequestIdRequest,
    searchWorkOrdersRequest,
    updateWorkOrderRequest,
} from "../api/workOrders.api";
import type {
    IDeleteCollectionRequest,
    IWorkOrder,
    IWorkOrderForCreate,
    IWorkOrderForUpdate,
    IPagedResult,
    ISearchRequest,
} from "../api/types/types";

export async function searchWorkOrders(params: ISearchRequest): Promise<IPagedResult<IWorkOrder>>
{
    return searchWorkOrdersRequest(params);
}

export async function createWorkOrder(data: IWorkOrderForCreate): Promise<IWorkOrder>
{
    return createWorkOrderRequest(data);
}

export async function getWorkOrderById(id: number): Promise<IWorkOrder>
{
    return getWorkOrderByIdRequest(id);
}

export async function updateWorkOrder(id: number, data: IWorkOrderForUpdate): Promise<IWorkOrder>
{
    return updateWorkOrderRequest(id, data);
}

function buildWorkOrderUpdatePayload(workOrder: IWorkOrder, statusId: number): IWorkOrderForUpdate
{
    const payload: IWorkOrderForUpdate = {
        orderSequence: workOrder.orderSequence,
        statusId,
    };

    if (workOrder.scheduledStart)
    {
        payload.scheduledStart = workOrder.scheduledStart;
    }

    if (workOrder.scheduledEnd)
    {
        payload.scheduledEnd = workOrder.scheduledEnd;
    }

    return payload;
}

export async function markWorkOrderInProgress(workOrder: IWorkOrder, statusId: number): Promise<IWorkOrder>
{
    return updateWorkOrder(workOrder.id, buildWorkOrderUpdatePayload(workOrder, statusId));
}

export async function markWorkOrderFinished(workOrder: IWorkOrder, statusId: number): Promise<IWorkOrder>
{
    return updateWorkOrder(workOrder.id, buildWorkOrderUpdatePayload(workOrder, statusId));
}

export async function deleteWorkOrder(id: number): Promise<void>
{
    return deleteWorkOrderRequest(id);
}

export async function deleteWorkOrders(body: IDeleteCollectionRequest): Promise<void>
{
    return deleteWorkOrderCollectionRequest(body);
}

export async function searchWorkOrdersByRepairRequestId(repairRequestId: number, params: ISearchRequest): Promise<IPagedResult<IWorkOrder>>
{
    return searchWorkOrdersByRepairRequestIdRequest(repairRequestId, params);
}
