import { z } from "zod";

export const ProductTypeFormSchema = z.object({
    code: z.string().trim().min(1, "Code is required.").max(150, "Code must be 150 characters or fewer."),
    name: z.string().trim().min(1, "Name is required.").max(150, "Name must be 150 characters or fewer."),
    description: z.string().optional(),
    departmentId: z.string().trim().min(1, "Department is required.").regex(/^[0-9]+$/, "Department selection is invalid."),
    departmentCode: z.string(),
    departmentName: z.string(),
});

export type IProductTypeFormValues = z.infer<typeof ProductTypeFormSchema>;
