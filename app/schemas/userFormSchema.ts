import { z } from "zod";
import { ROLE_OPTIONS as roleOptions } from "@/constants";

export const UserFormSchema = z.object({
    name: z.string().trim().max(150, "Name must be 150 characters or fewer."),
    email: z.string().trim().min(1, "Email is required.").email("Enter a valid email address."),
    password: z.string(),
    role: z.string().trim().refine((value) => roleOptions.includes(value as typeof roleOptions[number]), {
        message: "Role is required.",
    }),
    departmentId: z.string().trim().refine((value) => value === "" || /^\d+$/.test(value), {
        message: "Department selection is invalid.",
    }),
    departmentCode: z.string(),
    departmentName: z.string(),
    avatarUrl: z.string().trim().refine((value) => value === "" || z.string().url().safeParse(value).success, {
        message: "Avatar URL must be a valid URL.",
    }),
});
