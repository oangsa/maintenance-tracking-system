import { z } from "zod";
import type { IWorkTask, IWorkTaskForCreate, IWorkTaskForUpdate } from "~/api/types/workTask.types";

const workTaskSchema = z.object({
    description: z.string().min(1, { message: "Description is required" }),
    started_at: z.string().nullable().optional(),
    ended_at: z.string().nullable().optional(),
    note: z.string().nullable().optional(),
});

interface IWorkTaskFormValues 
{
    description: string;
    started_at?: string | null;
    ended_at?: string | null;
    note?: string | null;
}

function createEmptyWorkTaskFormValues(): IWorkTaskFormValues 
{
    return {
        description: "",
        started_at: null,
        ended_at: null,
        note: null,
    };
}

function toDateTimeLocal(isoString?: string | null) 
{
    if (!isoString) return null;
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return null;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function mapWorkTaskToFormValues(task: IWorkTask): IWorkTaskFormValues 
{
    return {
        description: task.description || "",
        started_at: toDateTimeLocal(task.startedAt),
        ended_at: toDateTimeLocal(task.endedAt),
        note: task.note || null,
    };
}

function buildUpdatePayload(values: IWorkTaskFormValues): IWorkTaskForUpdate 
{
    return {
        description: values.description,
        startedAt: values.started_at ? new Date(values.started_at).toISOString() : undefined,
        endedAt: values.ended_at ? new Date(values.ended_at).toISOString() : undefined,
        note: values.note || undefined,
    };
}

function buildCreatePayload(workOrderId: number, values: IWorkTaskFormValues): IWorkTaskForCreate 
{
    return {
        workOrderId: workOrderId,
        description: values.description,
        startedAt: values.started_at ? new Date(values.started_at).toISOString() : null,
        endedAt: values.ended_at ? new Date(values.ended_at).toISOString() : null,
        note: values.note || null,
    };
}

export {
    workTaskSchema,
    buildCreatePayload,
    buildUpdatePayload,
    createEmptyWorkTaskFormValues,
    mapWorkTaskToFormValues,
};

export type { IWorkTaskFormValues };