import { z } from "zod";

export const ProductFormSchema = z.object({
    code: z.string().trim().min(1, "Code is required.").max(150, "Code must be 150 characters or fewer."),
    name: z.string().trim().min(1, "Name is required.").max(150, "Name must be 150 characters or fewer."),
    productTypeId: z.string().trim().regex(/^[0-9]+$/, "Product Type is required."),
});
