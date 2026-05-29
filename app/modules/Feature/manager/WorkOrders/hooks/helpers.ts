import type { IWorkOrder, IWorkOrderForCreate, IWorkOrderForUpdate } from "~/api/types/types";

interface IWorkOrderFormValues
{
    repairRequestItemId: string;
    repairRequestItemProductName: string;
    scheduledStart: string;
    scheduledEnd: string;
    orderSequence: string;
    statusId: string;
    statusCode: string;
    statusName: string;
}


function createEmptyWorkOrderFormValues(): IWorkOrderFormValues
{
    return {
        repairRequestItemId: "",
        repairRequestItemProductName: "",
        scheduledStart: "",
        scheduledEnd: "",
        orderSequence: "1",
        statusId: "",
        statusCode: "",
        statusName: "",
    };
}

function mapWorkOrderToFormValues(workOrder: IWorkOrder): IWorkOrderFormValues
{
    return {
        repairRequestItemId: String(workOrder.repairRequestItemId),
        repairRequestItemProductName: workOrder.repairRequestItemProductName ?? workOrder.repairRequestItemDescription ?? "",
        scheduledStart: workOrder.scheduledStart ? new Date(workOrder.scheduledStart).toISOString().split('T')[0] : "",
        scheduledEnd: workOrder.scheduledEnd ? new Date(workOrder.scheduledEnd).toISOString().split('T')[0] : "",
        orderSequence: String(workOrder.orderSequence),
        statusId: String(workOrder.repairRequestItemRepairStatusId),
        statusCode: workOrder.repairRequestItemRepairStatusCode ?? "",
        statusName: workOrder.repairRequestItemRepairStatusName ?? "",
    };
}

function parseNumberField(value: string | undefined): number | undefined
{
    if (!value) return undefined;
    const trimmed = value.trim();
    if (!trimmed) return undefined;

    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed)) return undefined;

    return parsed;
}

function buildCreatePayload(values: IWorkOrderFormValues): IWorkOrderForCreate
{
    const payload: IWorkOrderForCreate = {
        repairRequestItemId: parseNumberField(values.repairRequestItemId) ?? 0,
        orderSequence: parseNumberField(values.orderSequence) ?? 1,
        statusId: parseNumberField(values.statusId) ?? 0,
    };

    if (values.scheduledStart?.trim())
    {
        payload.scheduledStart = values.scheduledStart.trim();
    }

    if (values.scheduledEnd?.trim())
    {
        payload.scheduledEnd = values.scheduledEnd.trim();
    }

    return payload;
}

function buildUpdatePayload(values: IWorkOrderFormValues): IWorkOrderForUpdate
{
    const payload: IWorkOrderForUpdate = {
        orderSequence: parseNumberField(values.orderSequence) ?? 1,
        statusId: parseNumberField(values.statusId) ?? 0,
    };

    if (values.scheduledStart?.trim())
    {
        payload.scheduledStart = values.scheduledStart.trim();
    }

    if (values.scheduledEnd?.trim())
    {
        payload.scheduledEnd = values.scheduledEnd.trim();
    }

    return payload;
}

export {
    buildCreatePayload,
    buildUpdatePayload,
    createEmptyWorkOrderFormValues,
    mapWorkOrderToFormValues,
};

export type { IWorkOrderFormValues };
