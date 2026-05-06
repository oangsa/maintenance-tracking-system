import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import CommonForm, { FormActions } from "~/components/Common/Form";
import Loading from "~/components/Common/Loading";
import { useManagedForm } from "~/components/Common/Form/useManagedForm";
import type { IPartFormValues } from "./hooks/helpers";
import { useFormItem } from "./hooks/useFormItem";
import { PartFormSchema } from "~/schemas/partFormSchema";

interface IPartFormProps
{
    mode: "create" | "edit";
    initialValues: IPartFormValues;
    loading?: boolean;
    submitting?: boolean;
    onCancel: () => void;
    onSubmit: (values: IPartFormValues) => void | Promise<void>;
}

interface IPartFormErrors
{
    code?: string;
    name?: string;
    productTypeId?: string;
}

export default function PartForm({
    mode,
    initialValues,
    loading = false,
    submitting = false,
    onCancel,
    onSubmit,
}: IPartFormProps)
{
    const { formItems } = useFormItem({ mode });
    const {
        values,
        errors: formErrors,
        clearFieldError,
        handleFormSubmit,
        setFieldValue,
    } = useManagedForm<IPartFormValues, IPartFormErrors>({
        initialValues,
        mapErrors: React.useCallback((fieldErrors) => ({
            code: fieldErrors.code?.message,
            name: fieldErrors.name?.message,
            productTypeId: fieldErrors.productTypeId?.message,
        }), []),
        onSubmit,
        resolver: zodResolver(PartFormSchema),
    });

    function handleValueChange<TKey extends keyof IPartFormValues>(fieldName: TKey, value: IPartFormValues[TKey])
    {
        setFieldValue(fieldName, value);
    }

    if (loading)
    {
        return (
            <div className="card">
                <Loading />
            </div>
        );
    }

    return (
        <CommonForm
            actions={
                <FormActions
                    cancelDisabled={submitting}
                    onCancel={onCancel}
                    submitDisabled={submitting}
                    submitLabel={mode === "create" ? "Create Part" : "Save Changes"}
                    submitting={submitting}
                    submittingLabel={mode === "create" ? "Creating..." : "Saving..."}
                />
            }
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