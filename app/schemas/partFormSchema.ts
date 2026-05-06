import { z } from "zod";

export const PartFormSchema = z.object({
    code: z.string().trim().min(1, "Code is required.").max(50, "Code must be 50 characters or fewer."),
    name: z.string().trim().min(1, "Name is required.").max(150, "Name must be 150 characters or fewer."),
    productTypeId: z.string().trim().refine((value) => value === "" || /^\d+$/.test(value), {
        message: "Product Type selection is invalid.",
    }),
    productTypeCode: z.string(),
    productTypeName: z.string(),
});
