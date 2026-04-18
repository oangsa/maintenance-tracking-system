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
