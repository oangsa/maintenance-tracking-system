import { z } from "zod";

function parseNumber(value: string | undefined): number | null
{
    if (!value)
    {
        return null;
    }

    const parsed = Number(value);

    if (!Number.isFinite(parsed))
    {
        return null;
    }

    return parsed;
}

const InventoryMoveItemSchema = z.object({
    partId: z.string().trim().min(1, "Part is required.").refine((value) => /^\d+$/.test(value), {
        message: "Part selection is invalid.",
    }),
    partCode: z.string().optional(),
    partName: z.string().optional(),
    partTotalStock: z.string().optional(),
    quantityIn: z.string().trim().optional(),
    quantityOut: z.string().trim().optional(),
})
.refine(
    (data) =>
    {
        const qIn = parseFloat(data.quantityIn || "0");
        const qOut = parseFloat(data.quantityOut || "0");
        
        const hasIn = qIn > 0;
        const hasOut = qOut > 0;

        return (hasIn && !hasOut) || (!hasIn && hasOut);
    },
    {
        message: "Each item must have either a Quantity In or Quantity Out (cannot have both or neither).",
        path: ["quantityIn"], 
    }
);

export const InventoryMoveFormSchema = z.object({
    remarks: z.string().optional(),
    items: z.array(InventoryMoveItemSchema).min(1, "At least one item is required."),
})
.superRefine((values, context) =>
{
    const hasQuantityOutOverStock = values.items.some((item) =>
    {
        const quantityOut = parseNumber(item.quantityOut);
        const totalStock = parseNumber(item.partTotalStock);

        if (quantityOut === null || quantityOut <= 0 || totalStock === null)
        {
            return false;
        }

        return quantityOut > totalStock;
    });

    if (hasQuantityOutOverStock)
    {
        context.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Quantity Out cannot be greater than current stock.",
            path: ["items"],
        });
    }
});

export type IInventoryMoveFormValues = z.infer<typeof InventoryMoveFormSchema>;
