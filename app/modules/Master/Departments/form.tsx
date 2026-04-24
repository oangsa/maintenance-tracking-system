import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import CommonForm, { FormActions } from "~/components/Common/Form";
import Loading from "~/components/Common/Loading";
import { useManagedForm } from "~/components/Common/Form/useManagedForm";
import type { IDepartmentFormValues } from "./hooks/helpers";
import { useFormItem } from "./hooks/useFormItem";
import { DepartmentFormSchema } from "~/schemas/departmentFormSchema";

interface IDepartmentFormProps
{
    mode: "create" | "edit";
    initialValues: IDepartmentFormValues;
    loading?: boolean;
    submitting?: boolean;
    onCancel: () => void;
    onSubmit: (values: IDepartmentFormValues) => void | Promise<void>;
}

interface IDepartmentFormErrors
{
    code?: string;
    name?: string;
}

export default function DepartmentForm({
    mode,
    initialValues,
    loading = false,
    submitting = false,
    onCancel,
    onSubmit,
}: IDepartmentFormProps)
{
    const { formItems } = useFormItem({ mode });
    const {
        values,
        errors: formErrors,
        clearFieldError,
        handleFormSubmit,
        setFieldValue,
    } = useManagedForm<IDepartmentFormValues, IDepartmentFormErrors>({
        initialValues,
        mapErrors: React.useCallback((fieldErrors) => ({
            code: fieldErrors.code?.message,
            name: fieldErrors.name?.message,
        }), []),
        onSubmit,
        resolver: zodResolver(DepartmentFormSchema),
    });

    function handleValueChange<TKey extends keyof IDepartmentFormValues>(fieldName: TKey, value: IDepartmentFormValues[TKey])
    {
        setFieldValue(fieldName, value);
    }

    if (loading)
    {
        return (
            <div className="card">
                <Loading message="Loading department details..." />
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
                    submitLabel={mode === "create" ? "Create Department" : "Save Changes"}
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
