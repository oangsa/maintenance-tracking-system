export interface IRepairStatus
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

export interface IRepairStatusForCreate {
    code: string;
    name: string;
}

export interface IRepairStatusForUpdate {
    code: string;
    name: string;
}