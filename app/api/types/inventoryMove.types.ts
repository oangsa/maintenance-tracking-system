export type IInventoryMoveReason = "buy" | "use" | "lost" | "found" | "adjust";

export interface IInventoryMoveItem
{
    id: number;
    inventoryMoveId: number;
    partId: number;
    partCode: string;
    partName: string;
    quantityIn: number | null;
    quantityOut: number | null;
}

export interface IInventoryMoveItemForCreate
{
    partId: number;
    quantityIn: number | null;
    quantityOut: number | null;
    workOrderPartId?: number | null;
}

export interface IInventoryMove
{
    id: number;
    moveNo: string;
    reason: IInventoryMoveReason;
    moveDate: string;
    remark: string;
    inventoryMoveItems: IInventoryMoveItem[];
    createdAt: string | null;
    updatedAt: string | null;
    createdBy: string | null;
    updatedBy: string | null;
}

export interface IInventoryMoveForCreate
{
    moveNo?: string;
    reason: IInventoryMoveReason;
    moveDate?: string;
    remark?: string;
    inventoryMoveItems: IInventoryMoveItemForCreate[];
}
