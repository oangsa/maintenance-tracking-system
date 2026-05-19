import type { IProduct } from "./types";
export interface IWorkOrder
{
    id: number;
    repairRequestItemId: number;
    scheduledStart: string;
    scheduledEnd: string;
    orderSequence: number;
    isFinal: boolean;
    statusId: number;
    createdAt: string | null;
    updatedAt: string | null;
    createdBy: string | null;
    updatedBy: string | null;

    repairRequestItem?: IRepairRequestItemDisplay;
    status?: IRepairStatusDisplay;
}

export interface IWorkOrderForCreate
{
    repairRequestItemId: number;
    scheduledStart?: string | null;
    scheduledEnd?: string | null;
    orderSequence: number;
    statusId: number;
}

export interface IWorkOrderForUpdate
{
    scheduledStart?: string | null;
    scheduledEnd?: string | null;
    orderSequence: number;
    statusId: number;
}

export interface IRepairRequestDisplay
{
    requestNo: string;
}

export interface IRepairRequestItemDisplay
{
    id: number;
    description: string;
    product?: Pick<IProduct, "code" | "name">;
    repairRequest?: IRepairRequestDisplay;
}

export interface IRepairStatusDisplay
{
    id: number;
    code: string;
    name: string;
}