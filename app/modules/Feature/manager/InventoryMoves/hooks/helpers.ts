import type { IInventoryMoveForCreate } from "~/api/types/types";
import type { IInventoryMoveFormValues } from "~/schemas/inventoryMoveFormSchema";

function createEmptyInventoryMoveFormValues(): IInventoryMoveFormValues
{
    return {
        remarks: "",
        items: [],
    };
}

function parseNumberField(value: string | undefined | null): number | null
{
    if (!value) return null;
    const trimmed = value.trim();
    if (!trimmed) return null;
    
    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed)) return null;
    
    return parsed;
}

function buildCreatePayload(values: IInventoryMoveFormValues): any 
{
    const payload = {
        reason: values.remarks?.trim() || "", 
        inventoryMoveItems: values.items.map(item => ({
            partId: parseNumberField(item.partId) ?? 0,
            quantityIn: parseNumberField(item.quantityIn) ?? 0,
            quantityOut: parseNumberField(item.quantityOut) ?? 0,
            workOrderPartId: null
        })),
    };

    return payload as unknown as IInventoryMoveForCreate;
}

export {
    buildCreatePayload,
    createEmptyInventoryMoveFormValues,
};