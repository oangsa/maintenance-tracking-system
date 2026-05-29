import type { IRepairStatus, IRepairStatusForCreate, IRepairStatusForUpdate } from "~/api/types/types";

export const REPAIR_STATUS_FORM_ITEM = {
    CODE_LABEL: "Code",
    CODE_PLACEHOLDER: "e.g., PENDING",
    NAME_LABEL: "Name",
    NAME_PLACEHOLDER: "e.g., Pending Review",
    SECTION_KEY: "general-info"
};

interface IRepairStatusFormValues
{
    code: string;
    name: string;
}

function createEmptyRepairStatusFormValues(): IRepairStatusFormValues
{
    return {
        code: "",
        name: "",
    };
}

function mapRepairStatusToFormValues(repairStatus: IRepairStatus): IRepairStatusFormValues
{
    return {
        code: repairStatus.code ?? "",
        name: repairStatus.name ?? "",
    };
}

function buildCreatePayload(values: IRepairStatusFormValues): IRepairStatusForCreate
{
    return {
        code: values.code.trim(),
        name: values.name.trim(),
    };
}

function buildUpdatePayload(values: IRepairStatusFormValues): IRepairStatusForUpdate
{
    return {
        code: values.code.trim(),
        name: values.name.trim(),
    };
}

export {
    buildCreatePayload,
    buildUpdatePayload,
    createEmptyRepairStatusFormValues,
    mapRepairStatusToFormValues,
};

export type { IRepairStatusFormValues };