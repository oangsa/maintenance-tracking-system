import { z } from "zod";

export const RepairRequestItemStatusFormSchema = z.object({
    code: z.string().trim().min(1, "Code is required.").max(150, "Code must be 150 characters or fewer."),
    name: z.string().trim().min(1, "Name is required.").max(150, "Name must be 150 characters or fewer."),
    isFinal: z.boolean(),
    orderSequence: z.number().int().positive("Order sequence must be a positive integer."),
});
