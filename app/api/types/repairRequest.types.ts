import type { IPriority } from "../../constants";

export interface IRepairRequestItem
{
    id: number;
    repairRequestId: number;
    productId: number;
    productCode: string;
    productName: string;
    description: string;
    quantity: number;
    repairStatusId: number | null;
    repairStatusCode: string | null;
    repairStatusName: string | null;
    departmentId: number;
}

export interface IRepairRequestStatusLog
{
    id: number;
    repairRequestId: number;
    oldStatusId: number | null;
    oldStatusCode: string | null;
    oldStatusName: string | null;
    newStatusId: number;
    newStatusCode: string;
    newStatusName: string;
    changedBy: number | null;
    changedByName: string | null;
    changedByEmail: string | null;
    note: string | null;
    changedAt: string | null;
}

export interface IRepairRequest
{
    id: number;
    requestNo: string;
    requesterId: number;
    requesterName: string | null;
    requesterEmail: string;
    priority: IPriority;
    requestedAt: string | null;
    currentStatusId: number;
    currentStatusCode: string;
    currentStatusName: string;
    createdAt: string | null;
    updatedAt: string | null;
    createdBy: string | null;
    updatedBy: string | null;
    repairRequestItems: IRepairRequestItem[];
}

export interface IRepairRequestItemForCreate
{
    productId: number;
    description: string;
    quantity: number;
    departmentId: number;
}

export interface IRepairRequestForCreate
{
    priority: IPriority;
    currentStatusId: number;
    items: IRepairRequestItemForCreate[];
}

export interface IRepairRequestForUpdate
{
    priority?: IPriority;
    currentStatusId?: number;
}

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
}
