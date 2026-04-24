import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { type IRepairRequestItemStatusFormValues } from "./hooks/helpers";
import { RepairRequestItemStatusFormSchema } from "@/schemas/repairRequestItemStatusFormSchema";
import CommonForm, { FormActions } from "~/components/Common/Form";
import { useFormItem } from "./hooks/useFormItem";
import Loading from "@/components/Common/Loading";
import { useManagedForm } from "~/components/Common/Form/useManagedForm";

interface IRepairRequestItemStatusFormProps
{
    mode: "create" | "edit";
    initialValues: IRepairRequestItemStatusFormValues;
    loading?: boolean;
    submitting?: boolean;
    onCancel: () => void;
    onSubmit: (values: IRepairRequestItemStatusFormValues) => void | Promise<void>;
}

interface IRepairRequestItemStatusFormErrors
{
    code?: string;
    name?: string;
    isFinal?: string;
    orderSequence?: string;
}

export default function RepairRequestItemStatusForm({
    mode,
    initialValues,
    loading = false,
    submitting = false,
    onCancel,
    onSubmit,
}: IRepairRequestItemStatusFormProps)
{
    const { formItems } = useFormItem({ mode });
    const {
        values,
        errors: formErrors,
        clearFieldError,
        handleFormSubmit,
        setFieldValue,
    } = useManagedForm<IRepairRequestItemStatusFormValues, IRepairRequestItemStatusFormErrors>({
        initialValues,
        mapErrors: React.useCallback((fieldErrors) => ({
            code: fieldErrors.code?.message,
            isFinal: fieldErrors.isFinal?.message,
            name: fieldErrors.name?.message,
            orderSequence: fieldErrors.orderSequence?.message,
        }), []),
        onSubmit,
        resolver: zodResolver(RepairRequestItemStatusFormSchema),
    });

    function handleValueChange<TKey extends keyof IRepairRequestItemStatusFormValues>(fieldName: TKey, value: IRepairRequestItemStatusFormValues[TKey])
    {
        setFieldValue(fieldName, value);
    }

    if (loading)
    {
        return (
            <div className="card">
                <Loading message={mode === "create" ? "Creating Repair Request Item Status..." : "Loading Repair Request Item Status..."} />
            </div>
        )
    }

    return (
        <CommonForm<IRepairRequestItemStatusFormValues>
            actions={
                (
                    <FormActions
                        cancelDisabled={submitting}
                        onCancel={onCancel}
                        submitDisabled={submitting}
                        submitLabel={mode === "create" ? "Create Repair Request Item Status" : "Save Changes"}
                        submitting={submitting}
                        submittingLabel={mode === "create" ? "Creating..." : "Saving..."}
                    />
                )
            }
            clearError={clearFieldError}
            disabled={submitting}
            sections={formItems}
            errors={formErrors}
            onSubmit={handleFormSubmit}
            setValue={handleValueChange}
            values={values}
        />
    );
}
