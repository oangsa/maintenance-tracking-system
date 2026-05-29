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
    repairRequestItemDescription: string;
    repairRequestItemRepairStatusId: number;
    repairRequestItemRepairStatusCode: string;
    repairRequestItemRepairStatusName: string;
    repairRequestItemProductName: string;
    repairRequestRequestNo: string;
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



export interface IRepairStatusDisplay
{
    id: number;
    code: string;
    name: string;
}

export interface IRepairRequestDisplay
{
    id: number;
    requestNo: string;
}

export interface IRepairRequestItemDisplay
{
    id: number;
    repairRequestId: number;
    description: string;
    productName: string;
}
