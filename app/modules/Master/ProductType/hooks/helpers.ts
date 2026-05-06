import type { IProductType, IProductTypeForCreate, IProductTypeForUpdate } from "~/api/types/types";

interface IProductTypeFormValues
{
    code: string;
    name: string;
    departmentId: number;
    departmentCode: string;
    departmentName: string;
}

function createEmptyProductTypeFormValues(): IProductTypeFormValues
{
    return {
        code: "",
        name: "",
        departmentId: 0,
        departmentCode: "",
        departmentName: "",
    };
}

function mapProductTypeToFormValues(productType: IProductType): IProductTypeFormValues
{
    return {
        code: productType.code ?? "",
        name: productType.name ?? "",
        departmentId: productType.departmentId ?? 0,
        departmentCode: productType.departmentCode ?? "",
        departmentName: productType.departmentName ?? "",
    };
}

function buildCreatePayload(values: IProductTypeFormValues): IProductTypeForCreate
{
    return {
        code: values.code.trim(),
        name: values.name.trim(),
        departmentId: Number(values.departmentId),
    };
}

function buildUpdatePayload(values: IProductTypeFormValues): IProductTypeForUpdate
{
    return {
        code: values.code.trim(),
        name: values.name.trim(),
        departmentId: Number(values.departmentId),
    };
}

export {
    buildCreatePayload,
    buildUpdatePayload,
    createEmptyProductTypeFormValues,
    mapProductTypeToFormValues,
};

export type { IProductTypeFormValues }; 