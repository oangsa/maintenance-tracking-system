import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import type { FieldErrors } from "react-hook-form";
import CommonForm, { FormActions } from "~/components/Common/Form";
import { useManagedForm } from "~/components/Common/Form/useManagedForm";
import { WorkOrderFormSchema } from "~/schemas/workOrderFormSchema";
import type { IWorkOrderFormValues } from "~/schemas/workOrderFormSchema";
import { useFormItem } from "./hooks/useFormItem";
import type { IRepairRequestItemLookupRow } from "~/components/Common/LookupField/lookups/repairRequestItem.lookup";
import type { IRepairStatusLookupRow } from "~/components/Common/LookupField/lookups/repairStatus.lookup";


interface IWorkOrderFormProps
{
    mode: "create" | "edit";
    initialValues: IWorkOrderFormValues;
    submitting?: boolean;
    onCancel: () => void;
    onSubmit: (values: IWorkOrderFormValues) => void | Promise<void>;
}

interface IWorkOrderFormErrors
{
    repairRequestItemId?: string;
    orderSequence?: string;
    statusId?: string;
    scheduledEnd?: string;
}

function mapWorkOrderFormErrors(fieldErrors: FieldErrors<IWorkOrderFormValues>): IWorkOrderFormErrors
{
    return {
        repairRequestItemId: fieldErrors.repairRequestItemId?.message,
        orderSequence: fieldErrors.orderSequence?.message,
        statusId: fieldErrors.statusId?.message,
        scheduledEnd: fieldErrors.scheduledEnd?.message,
    };
}

export default function WorkOrderForm({
    mode,
    initialValues,
    submitting = false,
    onCancel,
    onSubmit,
}: IWorkOrderFormProps)
{
    const {
        values,
        errors: formErrors,
        clearFieldError,
        handleFormSubmit,
        setFieldValue,
    } = useManagedForm<IWorkOrderFormValues, IWorkOrderFormErrors>({
        initialValues,
        mapErrors: mapWorkOrderFormErrors,
        onSubmit,
        resolver: zodResolver(WorkOrderFormSchema),
    });

    const onClearItem = React.useCallback(() =>
    {
        setFieldValue("repairRequestItemId", "");
        setFieldValue("repairRequestItemProductName", "");
    }, [setFieldValue]);

    const onSelectItem = React.useCallback((item: IRepairRequestItemLookupRow) =>
    {
        setFieldValue("repairRequestItemId", String(item.id));
        setFieldValue("repairRequestItemProductName", item.repairRequestItemProductName || item.description || "");
    }, [setFieldValue]);

    const onClearStatus = React.useCallback(() =>
    {
        setFieldValue("statusId", "");
        setFieldValue("statusCode", "");
        setFieldValue("statusName", "");
    }, [setFieldValue]);

    const onSelectStatus = React.useCallback((status: IRepairStatusLookupRow) =>
    {
        setFieldValue("statusId", String(status.id));
        setFieldValue("statusCode", status.code || "");
        setFieldValue("statusName", status.name || "");
    }, [setFieldValue]);

    
    const { formItems } = useFormItem({
        mode,
        onClearItem,
        onSelectItem,
        onClearStatus,
        onSelectStatus,
    });

    return (
        <CommonForm
            actions={(
                <FormActions
                    cancelDisabled={submitting}
                    onCancel={onCancel}
                    submitDisabled={submitting}
                    submitLabel={mode === "create" ? "Create Work Order" : "Save Changes"}
                    submitting={submitting}
                    submittingLabel={mode === "create" ? "Creating..." : "Saving..."}
                />
            )}
            clearError={clearFieldError}
            disabled={submitting}
            errors={formErrors as Partial<Record<keyof IWorkOrderFormValues, string>>}
            onSubmit={handleFormSubmit}
            sections={formItems}
            setValue={setFieldValue}
            values={values}
        />
    );
}
