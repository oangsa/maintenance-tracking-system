import type { IDepartment, IDepartmentForCreate, IDepartmentForUpdate } from "~/api/types";

interface IDepartmentFormValues
{
    code: string;
    name: string;
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
    mapDepartmentToFormValues,
};

export type { IDepartmentFormValues };
