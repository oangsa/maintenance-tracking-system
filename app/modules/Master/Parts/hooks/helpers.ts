import type { IPart, IPartForCreate, IPartForUpdate } from "~/api/types/types";

interface IPartFormValues
{
    code: string;
    name: string;
    productTypeId: number;
    productTypeCode: string;
    productTypeName: string;
}

function createEmptyPartFormValues(): IPartFormValues
{
    return {
        code: "",
        name: "",
        productTypeId: 0,
        productTypeCode: "",
        productTypeName: "",
    };
}

function mapPartToFormValues(part: IPart): IPartFormValues
{
    return {
        code: part.code ?? "",
        name: part.name ?? "",
        productTypeId: part.productTypeId ?? 0,
        productTypeCode: part.productTypeCode ?? "",
        productTypeName: part.productTypeName ?? "",
    };
}

function buildCreatePayload(values: IPartFormValues): IPartForCreate
{
    return {
        code: values.code.trim(),
        name: values.name.trim(),
        productTypeId: Number(values.productTypeId),
    };
}

function buildUpdatePayload(values: IPartFormValues): IPartForUpdate
{
    return {
        code: values.code.trim(),
        name: values.name.trim(),
        productTypeId: Number(values.productTypeId),
    };
}

export {
    buildCreatePayload,
    buildUpdatePayload,
    createEmptyPartFormValues,
    mapPartToFormValues,
};

export type { IPartFormValues };    