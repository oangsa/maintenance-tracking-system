export interface IRepairRequestItemStatus
{
    id: number;
    code: string;
    name: string;
    orderSequence: number;
    isFinal: boolean;
    createdAt: string | null;
    updatedAt: string | null;
    createdBy: string | null;
    updatedBy: string | null;
}

export interface IRepairRequestItemStatusForCreate
{
    code: string;
    name: string;
    orderSequence: number;
    isFinal?: boolean;
}

export interface IRepairRequestItemStatusForUpdate
{
    code?: string;
    name?: string;
    orderSequence?: number;
    isFinal?: boolean;
}

export interface IRepairRequestItemStatusIdParam
{
    id: string;
}
