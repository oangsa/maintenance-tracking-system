import { z } from "zod";

export const WorkOrderFormSchema = z.object({
    repairRequestItemId: z.string().trim().min(1, "Repair Request Item is required.").refine((value) => /^\d+$/.test(value), {
        message: "Repair Request Item selection is invalid.",
    }),
    repairRequestItemProductName: z.string().optional(),
    
    scheduledStart: z.string().trim().optional(),
    scheduledEnd: z.string().trim().optional(),
    
    orderSequence: z.string().trim().min(1, "Order Sequence is required.").refine((value) => /^\d+$/.test(value) && parseInt(value, 10) >= 1, {
        message: "Order Sequence must be a valid number and at least 1.",
    }),
    
    statusId: z.string().trim().min(1, "Status is required.").refine((value) => /^\d+$/.test(value), {
        message: "Status selection is invalid.",
    }),
    statusCode: z.string().optional(),
    statusName: z.string().optional(),
})
.refine(
    (data) =>
    {
        if (data.scheduledStart && data.scheduledEnd)
        {
            return new Date(data.scheduledStart) <= new Date(data.scheduledEnd);
        }

        return true;
    },
    {
        message: "Scheduled End date cannot be before Scheduled Start date.",
        path: ["scheduledEnd"],
    }
);

export type IWorkOrderFormValues = z.infer<typeof WorkOrderFormSchema>;

