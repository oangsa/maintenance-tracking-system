import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import CommonForm, { FormActions } from "~/components/Common/Form";
import Loading from "~/components/Common/Loading";
import { useManagedForm } from "~/components/Common/Form/useManagedForm";
import type { IProductFormValues } from "./hooks/helpers";
import { useFormItem } from "./hooks/useFormItem";
import { ProductFormSchema} from "~/schemas/productFormSchema";


interface IProductFormProps
{
    mode: "create" | "edit";
    initialValues: IProductFormValues;
    loading?: boolean;
    submitting?: boolean;
    onCancel: () => void;
    onSubmit: (values: IProductFormValues) => void | Promise<void>;
}

type IProductFormErrors = {
    code?: string;
    name?: string;
    productTypeId?: string;
};

export default function ProductForm({
    mode,
    initialValues,
    loading = false,
    submitting = false,
    onCancel,
    onSubmit,
}: IProductFormProps)
{
    const { formItems } = useFormItem({ mode });
    const {
        values,
        errors: formErrors,
        clearFieldError,
        handleFormSubmit,
        setFieldValue,
    } = useManagedForm<IProductFormValues, IProductFormErrors>({
        initialValues,
        mapErrors: React.useCallback((fieldErrors) => ({
            code: fieldErrors.code?.message,
            name: fieldErrors.name?.message,
            productTypeId: fieldErrors.productTypeId?.message,
        }), []),
        onSubmit,
        resolver: zodResolver(ProductFormSchema),
    });

    function handleValueChange(fieldName: string, value: any)
    {
        setFieldValue(fieldName as keyof IProductFormValues, value);
    }

    if (loading)
    {
        return (
            <div className="card">
                <Loading message="Loading product details..." />
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
                    submitLabel={mode === "create" ? "Create Product" : "Save Changes"}
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
