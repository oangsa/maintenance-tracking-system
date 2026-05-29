import { z } from "zod";

const InventoryMoveItemSchema = z.object({
    partId: z.string().trim().min(1, "Part is required.").refine((value) => /^\d+$/.test(value), {
        message: "Part selection is invalid.",
    }),
    partCode: z.string().optional(),
    partName: z.string().optional(),
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
});

export type IInventoryMoveFormValues = z.infer<typeof InventoryMoveFormSchema>;