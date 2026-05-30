import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import CommonForm, { FormActions } from "~/components/Common/Form";
import Loading from "~/components/Common/Loading";
import { useManagedForm } from "~/components/Common/Form/useManagedForm";
import type { IWorkTaskFormValues } from "./hooks/helpers";
import { workTaskSchema } from "./hooks/helpers";
import { useFormItem } from "./hooks/useFormItem";

interface WorkTaskFormProps 
{
    mode: "create" | "edit";
    initialValues: IWorkTaskFormValues;
    loading?: boolean;
    submitting?: boolean;
    onCancel: () => void;
    onSubmit: (values: IWorkTaskFormValues) => void | Promise<void>;
}

interface IWorkTaskFormErrors 
{
    description?: string;
    started_at?: string;
    ended_at?: string;
    note?: string;
}

export default function WorkTaskForm({
    mode,
    initialValues,
    loading = false,
    submitting = false,
    onCancel,
    onSubmit,
}: WorkTaskFormProps) 
{
    const { formItems } = useFormItem({ mode });
    const {
        values,
        errors: formErrors,
        clearFieldError,
        handleFormSubmit,
        setFieldValue,
    } = useManagedForm<IWorkTaskFormValues, IWorkTaskFormErrors>({
        initialValues,
        mapErrors: React.useCallback((fieldErrors) => ({
            description: fieldErrors.description?.message,
            started_at: fieldErrors.started_at?.message,
            ended_at: fieldErrors.ended_at?.message,
            note: fieldErrors.note?.message,
        }), []),
        onSubmit,
        resolver: zodResolver(workTaskSchema),
    });

    function handleValueChange<TKey extends keyof IWorkTaskFormValues>(fieldName: TKey, value: IWorkTaskFormValues[TKey]) {
        setFieldValue(fieldName, value);
    }

    if (loading) {
        return (
            <div className="card">
                <Loading message="Loading work task details..." />
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
                    submitLabel={mode === "create" ? "Create Work Task" : "Save Changes"}
                    submitting={submitting}
                    submittingLabel={mode === "create" ? "Creating..." : "Saving..."}
                />
            )}
            clearError={clearFieldError}
            disabled={submitting}
            errors={formErrors}
            onSubmit={handleFormSubmit}
            sections={formItems as any}
            setValue={handleValueChange}
            values={values}
        />
    );
}