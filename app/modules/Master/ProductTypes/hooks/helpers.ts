import type { IProductType, IProductTypeForCreate, IProductTypeForUpdate } from "~/api/types/types";
import type { IProductTypeFormValues } from "~/schemas/productTypeFormSchema";
import { formatDepartmentLabel } from "~/lib/formatters";

function createEmptyProductTypeFormValues(): IProductTypeFormValues
{
    return {
        code: "",
        name: "",
        description: "",
        departmentId: "",
        departmentCode: "",
        departmentName: "",
    };
}

function mapProductTypeToFormValues(productType: IProductType): IProductTypeFormValues
{
    return {
        code: productType.code ?? "",
        name: productType.name ?? "",
        description: productType.description ?? "",
        departmentId: Number.isFinite(productType.departmentId) ? String(productType.departmentId) : "",
        departmentCode: productType.department?.code ?? "",
        departmentName: productType.department?.name ?? "",
    };
}

function parseDepartmentId(departmentId: string): number | undefined
{
    const normalized = departmentId.trim();

    if (!normalized)
    {
        return undefined;
    }

    const parsedId = Number(normalized);

    if (!Number.isFinite(parsedId))
    {
        return undefined;
    }

    return parsedId;
}

function buildCreatePayload(values: IProductTypeFormValues): IProductTypeForCreate
{
    const payload: IProductTypeForCreate = {
        code: values.code.trim(),
        name: values.name.trim(),
        description: values.description?.trim() || undefined,
        departmentId: parseDepartmentId(values.departmentId) ?? 0,
    };

    return payload;
}

function buildUpdatePayload(values: IProductTypeFormValues): IProductTypeForUpdate
{
    const payload: IProductTypeForUpdate = {
        code: values.code.trim(),
        name: values.name.trim(),
        description: values.description?.trim() || undefined,
        departmentId: parseDepartmentId(values.departmentId),
    };

    return payload;
}

function formatDepartmentLabelValue(departmentCode?: string, departmentName?: string): string
{
    return formatDepartmentLabel(departmentCode, departmentName, "");
}

export {
    buildCreatePayload,
    buildUpdatePayload,
    createEmptyProductTypeFormValues,
    mapProductTypeToFormValues,
    formatDepartmentLabelValue,
};

export type { IProductTypeFormValues };
