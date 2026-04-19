import React from "react";
import { z } from "zod";
import CommonForm, { FormActions } from "~/components/Common/Form";
import Loading from "~/components/Common/Loading";
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

function validateForm(values: IDepartmentFormValues): IDepartmentFormErrors
{
    const nextErrors: IDepartmentFormErrors = {};
    const validationResult = DepartmentFormSchema.safeParse(values);

    if (validationResult.success)
    {
        return nextErrors;
    }

    for (const issue of validationResult.error.issues)
    {
        const fieldName = issue.path[0];

        if (typeof fieldName === "string" && !nextErrors[fieldName as keyof IDepartmentFormErrors])
        {
            nextErrors[fieldName as keyof IDepartmentFormErrors] = issue.message;
        }
    }

    return nextErrors;
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
    const [values, setValues] = React.useState<IDepartmentFormValues>(initialValues);
    const [formErrors, setFormErrors] = React.useState<IDepartmentFormErrors>({});
    const { formItems } = useFormItem();

    React.useEffect(() =>
    {
        setValues(initialValues);
        setFormErrors({});
    }, [initialValues]);

    function handleValueChange<TKey extends keyof IDepartmentFormValues>(fieldName: TKey, value: IDepartmentFormValues[TKey])
    {
        setValues((currentValues) => ({
            ...currentValues,
            [fieldName]: value,
        }));

        setFormErrors((currentErrors) => ({
            ...currentErrors,
            [fieldName]: undefined,
        }));
    }

    function clearFieldError(fieldName: string)
    {
        setFormErrors((currentErrors) => ({
            ...currentErrors,
            [fieldName]: undefined,
        }));
    }

    function handleSubmit(event: React.FormEvent<HTMLFormElement>)
    {
        event.preventDefault();

        const nextErrors = validateForm(values);

        if (Object.keys(nextErrors).length > 0)
        {
            setFormErrors(nextErrors);
            return;
        }

        void onSubmit(values);
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
            onSubmit={handleSubmit}
            sections={formItems}
            setValue={handleValueChange}
            values={values}
        />
    );
}
