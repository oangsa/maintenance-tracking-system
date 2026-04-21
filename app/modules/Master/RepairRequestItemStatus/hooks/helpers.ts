import type { IRepairRequestItemStatus, IRepairRequestItemStatusForCreate, IRepairRequestItemStatusForUpdate } from "~/api/types/types";

interface IRepairRequestItemStatusFormValues
{
    code: string;
    name: string;
    isFinal: boolean;
    orderSequence: number;
}

function createEmptyRepairRequestItemStatusFormValues(): IRepairRequestItemStatusFormValues
{
    return {
        code: "",
        name: "",
        isFinal: false,
        orderSequence: 0,
    };
}

function mapRepairRequestItemStatusToFormValues(department: IRepairRequestItemStatus): IRepairRequestItemStatusFormValues
{
    return {
        code: department.code ?? "",
        name: department.name ?? "",
        isFinal: department.isFinal ?? false,
        orderSequence: department.orderSequence ?? 0,
    };
}

function buildCreatePayload(values: IRepairRequestItemStatusFormValues): IRepairRequestItemStatusForCreate
{
    return {
        code: values.code.trim(),
        name: values.name.trim(),
        isFinal: values.isFinal,
        orderSequence: values.orderSequence,
    };
}

function buildUpdatePayload(values: IRepairRequestItemStatusFormValues): IRepairRequestItemStatusForUpdate
{
    return {
        code: values.code.trim(),
        name: values.name.trim(),
    };
}

export {
    buildCreatePayload,
    buildUpdatePayload,
    createEmptyRepairRequestItemStatusFormValues,
    mapRepairRequestItemStatusToFormValues,
};

export type { IRepairRequestItemStatusFormValues };
