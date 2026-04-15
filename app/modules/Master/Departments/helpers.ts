import type { IDepartment, IDepartmentForCreate, IDepartmentForUpdate } from "~/api/types";

interface IDepartmentFormValues
{
    code: string;
    name: string;
}

function formatDateTime(value?: string | null): string
{
    if (!value)
    {
        return "-";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime()))
    {
        return value;
    }

    return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}

function createEmptyDepartmentFormValues(): IDepartmentFormValues
{
    return {
        code: "",
        name: "",
    };
}

function mapDepartmentToFormValues(department: IDepartment): IDepartmentFormValues
{
    return {
        code: department.code ?? "",
        name: department.name ?? "",
    };
}

function buildCreatePayload(values: IDepartmentFormValues): IDepartmentForCreate
{
    return {
        code: values.code.trim(),
        name: values.name.trim(),
    };
}

function buildUpdatePayload(values: IDepartmentFormValues): IDepartmentForUpdate
{
    return {
        code: values.code.trim(),
        name: values.name.trim(),
    };
}

export {
    buildCreatePayload,
    buildUpdatePayload,
    createEmptyDepartmentFormValues,
    formatDateTime,
    mapDepartmentToFormValues,
};

export type { IDepartmentFormValues };