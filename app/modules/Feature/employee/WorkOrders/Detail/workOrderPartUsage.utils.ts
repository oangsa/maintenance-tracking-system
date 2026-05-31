export interface IWorkOrderPartInventoryMoveLike extends Record<string, unknown>
{
    inventoryMoveItemId?: unknown;
    inventory_move_item_id?: unknown;
}

export function resolveInventoryMoveItemId(value: unknown): number | null
{
    if (value && typeof value === "object")
    {
        const objectValue = value as Record<string, unknown>;
        const nestedCandidates: unknown[] = [
            objectValue.id,
            objectValue.inventoryMoveItemId,
            objectValue.inventory_move_item_id,
        ];

        for (const candidate of nestedCandidates)
        {
            const nestedResolvedId = resolveInventoryMoveItemId(candidate);

            if (nestedResolvedId !== null)
            {
                return nestedResolvedId;
            }
        }
    }

    const parsedInventoryMoveItemId = Number(value);

    if (!Number.isFinite(parsedInventoryMoveItemId) || parsedInventoryMoveItemId <= 0)
    {
        return null;
    }

    return parsedInventoryMoveItemId;
}

export function resolveInventoryMoveItemIdFromPart(part: IWorkOrderPartInventoryMoveLike | null | undefined): number | null
{
    if (!part || typeof part !== "object")
    {
        return null;
    }

    const rawPart = part as Record<string, unknown>;
    const directCandidates: unknown[] = [
        rawPart.inventoryMoveItemId,
        rawPart.inventory_move_item_id,
        rawPart.inventoryMoveItemID,
        rawPart.inventoryMoveItem,
        rawPart.inventory_move_item,
    ];

    for (const candidate of directCandidates)
    {
        const resolvedId = resolveInventoryMoveItemId(candidate);

        if (resolvedId !== null)
        {
            return resolvedId;
        }
    }

    for (const [key, value] of Object.entries(rawPart))
    {
        const normalizedKey = key.toLowerCase().replace(/[_-]/g, "");

        if (normalizedKey !== "inventorymoveitemid" && normalizedKey !== "inventorymoveitem")
        {
            continue;
        }

        const resolvedId = resolveInventoryMoveItemId(value);

        if (resolvedId !== null)
        {
            return resolvedId;
        }
    }

    return null;
}

export function isConsumedWorkOrderPart(part: IWorkOrderPartInventoryMoveLike | null | undefined): boolean
{
    return resolveInventoryMoveItemIdFromPart(part) !== null;
}
