import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import CommonForm, { FormActions } from "~/components/Common/Form";
import Loading from "~/components/Common/Loading";
import { useManagedForm } from "~/components/Common/Form/useManagedForm";
import type { IProductTypeFormValues } from "./hooks/helpers";
import { useFormItem } from "./hooks/useFormItem";
import { ProductTypeFormSchema } from "~/schemas/productTypeFormSchema";

interface IProductTypeFormProps
{
    mode: "create" | "edit";
    initialValues: IProductTypeFormValues;
    loading?: boolean;
    submitting?: boolean;
    onCancel: () => void;
    onSubmit: (values: IProductTypeFormValues) => void | Promise<void>;
}

interface IProductTypeFormErrors
{
    code?: string;
    departmentId?: string;
    name?: string;
}

export default function ProductTypeForm({
    mode,
    initialValues,
    loading = false,
    submitting = false,
    onCancel,
    onSubmit,
}: IProductTypeFormProps)
{
    const { formItems } = useFormItem({ mode });
    const {
        values,
        errors: formErrors,
        clearFieldError,
        handleFormSubmit,
        setFieldValue,
    } = useManagedForm<IProductTypeFormValues, IProductTypeFormErrors>({
        initialValues,
        mapErrors: React.useCallback((fieldErrors) => ({
            code: fieldErrors.code?.message,
            departmentId: fieldErrors.departmentId?.message,
            name: fieldErrors.name?.message,
        }), []),
        onSubmit,
        resolver: zodResolver(ProductTypeFormSchema),
    });

    function handleValueChange<TKey extends keyof IProductTypeFormValues>(fieldName: TKey, value: IProductTypeFormValues[TKey])
    {
        setFieldValue(fieldName, value);
    }

    if (loading)
    {
        return (
            <div className="card">
                <Loading message="Loading product type details..." />
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
                    submitLabel={mode === "create" ? "Create Product Type" : "Save Changes"}
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
