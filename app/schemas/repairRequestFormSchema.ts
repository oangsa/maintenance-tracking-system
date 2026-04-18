import { z } from "zod";
import { PRIORITY_OPTIONS as priorityOptions } from "@/constants";
import type { IPriority } from "@/constants";

export const RepairRequestFormSchema = z.object({
    items: z.array(z.object({
        code: z.string().trim().min(1, "Product is required."),
        description: z.string().trim().min(1, "Description is required."),
        name: z.string().trim().min(1, "Product name is required."),
        productId: z.string().trim().regex(/^\d+$/, "Product is required."),
        quantity: z.union([z.number(), z.string()]),
    })).min(1, "At least one repair request item is required."),
    priority: z.string().trim().refine((value) => priorityOptions.includes(value as IPriority), {
        message: "Priority is required.",
    }),
})
