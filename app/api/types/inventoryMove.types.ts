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
}

export interface IInventoryMove {
    id: number;
    moveNo: string;      
    remark: string | null; 
    items?: IInventoryMoveItem[]; 
    createdAt: string | null;
    updatedAt: string | null;
    createdBy: string | null;
    updatedBy: string | null;
}

export interface IInventoryMoveForCreate
{
    remarks?: string;
    inventoryMoveItems: IInventoryMoveItemForCreate[];
}