import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import CommonForm, { FormActions } from "~/components/Common/Form";
import Loading from "~/components/Common/Loading";
import { useManagedForm } from "~/components/Common/Form/useManagedForm";
import type { IRepairStatusFormValues } from "./hooks/helpers";
import { useFormItem } from "./hooks/useFormItem";
import { RepairStatusFormSchema } from "~/schemas/repairStatusFormSchema";

interface IRepairStatusFormProps {
    mode: "create" | "edit";
    initialValues: IRepairStatusFormValues;
    loading?: boolean;
    submitting?: boolean;
    onCancel: () => void;
    onSubmit: (values: IRepairStatusFormValues) => void | Promise<void>;
}

interface IRepairStatusFormErrors {
    code?: string;
    name?: string;
}

export default function RepairStatusForm({
    mode,
    initialValues,
    loading = false,
    submitting = false,
    onCancel,
    onSubmit,
}: IRepairStatusFormProps) {
    const { formItems } = useFormItem({ mode });
    const {
        values,
        errors: formErrors,
        clearFieldError,
        handleFormSubmit,
        setFieldValue,
    } = useManagedForm<IRepairStatusFormValues, IRepairStatusFormErrors>({
        initialValues,
        mapErrors: React.useCallback((fieldErrors) => ({
            code: fieldErrors.code?.message,
            name: fieldErrors.name?.message,
        }), []),
        onSubmit,
        resolver: zodResolver(RepairStatusFormSchema),
    });

    function handleValueChange<TKey extends keyof IRepairStatusFormValues>(fieldName: TKey, value: IRepairStatusFormValues[TKey]) {
        setFieldValue(fieldName, value);
    }

    if (loading) {
        return (
            <div className="card">
                <Loading message="Loading repair status details..." />
            </div>
        );
    }

    return (
        <CommonForm
            actions={(
                <FormActions
                    cancelDisabled={submitting}
                    onCancel={onCancel}
                    submitDisabled={submitting}
                    submitLabel={mode === "create" ? "Create Repair Status" : "Save Changes"}
                    submitting={submitting}
                    submittingLabel={mode === "create" ? "Creating..." : "Saving..."}
                />
            )}
            clearError={clearFieldError}
            disabled={submitting}
            errors={formErrors}
            onSubmit={handleFormSubmit}
            sections={formItems}
            setValue={handleValueChange}
            values={values}
        />
    );
}