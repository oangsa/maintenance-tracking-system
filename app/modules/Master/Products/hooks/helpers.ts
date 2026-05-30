import type { IProduct, IProductForCreate, IProductForUpdate } from "~/api/types/types";

interface IProductFormValues
{
    code: string;
    name: string;
    productTypeId: string;
    productTypeCode: string;
    productTypeName: string;
}

function createEmptyProductFormValues(): IProductFormValues
{
    return {
        code: "",
        name: "",
        productTypeId: "",
        productTypeCode: "",
        productTypeName: "",
    };
}

function mapProductToFormValues(product: IProduct): IProductFormValues
{
    return {
        code: product.code ?? "",
        name: product.name ?? "",
        productTypeId: Number.isFinite(product.productTypeId) ? String(product.productTypeId) : "",
        productTypeCode: product.productTypeCode ?? "",
        productTypeName: product.productTypeName ?? "",
    };
}

function parseProductTypeId(productTypeId: string): number | undefined
{
    const normalized = productTypeId.trim();

    if (!normalized) return undefined;
    const parsedId = Number(normalized);

    if (!Number.isFinite(parsedId)) return undefined;
    return parsedId;
}

function buildCreatePayload(values: IProductFormValues): IProductForCreate
{
    return {
        code: values.code.trim(),
        name: values.name.trim(),
        productTypeId: parseProductTypeId(values.productTypeId) ?? 0,
    };
}

function buildUpdatePayload(values: IProductFormValues): IProductForUpdate
{
    return {
        code: values.code.trim(),
        name: values.name.trim(),
        productTypeId: parseProductTypeId(values.productTypeId),
    };
}

export {
    buildCreatePayload,
    buildUpdatePayload,
    createEmptyProductFormValues,
    mapProductToFormValues,
};

export type { IProductFormValues };
