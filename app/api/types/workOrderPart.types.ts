export interface IWorkOrderPart {
    id: number;
    workOrderId: number;
    partId: number;
    partCode?: string;
    partName?: string;
    quantity: number;
    note?: string;
    inventoryMoveItemId?: number | null;
    createdAt?: string;
    updatedAt?: string;
    createdBy?: string;
    updatedBy?: string;
}

export interface IWorkOrderPartForCreate {
    workOrderId: number;
    partId: number;
    quantity: number;
    note?: string;
}

export interface IWorkOrderPartForUpdate {
    quantity: number;
    note?: string;
}