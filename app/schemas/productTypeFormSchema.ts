import { z } from "zod";

export const ProductTypeFormSchema = z.object({
    code: z.string().trim().min(1, "Code is required.").max(150, "Code must be 150 characters or fewer."),
    name: z.string().trim().min(1, "Name is required.").max(150, "Name must be 150 characters or fewer."),
    departmentId: z.string().trim().refine((value) => value === "" || /^\d+$/.test(value), {
        message: "Department selection is invalid.",
    }),
    departmentCode: z.string(),
    departmentName: z.string(),
});