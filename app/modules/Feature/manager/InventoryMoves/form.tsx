import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import type { FieldErrors } from "react-hook-form";
import CommonForm, { FormActions } from "~/components/Common/Form";
import { useManagedForm } from "~/components/Common/Form/useManagedForm";
import { InventoryMoveFormSchema } from "~/schemas/inventoryMoveFormSchema";
import type { IInventoryMoveFormValues } from "~/schemas/inventoryMoveFormSchema";
import InventoryMoveLineItemsEditor from "./InventoryMoveLineItemsEditor";
import { useFormItem } from "./hooks/useFormItem";

interface IInventoryMoveFormProps
{
    mode: "create"; 
    initialValues: IInventoryMoveFormValues;
    submitting?: boolean;
    onCancel: () => void;
    onSubmit: (values: IInventoryMoveFormValues) => void | Promise<void>;
}

interface IInventoryMoveFormErrors
{
    remarks?: string;
    items?: string;
}

function mapInventoryMoveFormErrors(fieldErrors: FieldErrors<IInventoryMoveFormValues>): IInventoryMoveFormErrors
{
    return {
        remarks: fieldErrors.remarks?.message,
        items: fieldErrors.items?.root?.message || fieldErrors.items?.message,
    };
}

export default function InventoryMoveForm({
    mode,
    initialValues,
    submitting = false,
    onCancel,
    onSubmit,
}: IInventoryMoveFormProps)
{
    const {
        values,
        errors: formErrors,
        clearFieldError,
        handleFormSubmit,
        setFieldValue,
    } = useManagedForm<IInventoryMoveFormValues, IInventoryMoveFormErrors>({
        initialValues,
        mapErrors: mapInventoryMoveFormErrors,
        onSubmit,
        resolver: zodResolver(InventoryMoveFormSchema),
    });

    const handleItemsChange = React.useCallback((nextItems: IInventoryMoveFormValues["items"]) =>
    {
        setFieldValue("items", nextItems);
    }, [setFieldValue]);

    const lineItemsEditor = React.useMemo(() => (
        <InventoryMoveLineItemsEditor
            disabled={submitting}
            items={values.items}
            onChange={handleItemsChange}
        />
    ), [handleItemsChange, submitting, values.items]);

    const { formItems } = useFormItem({
        lineItemsEditor,
        mode,
    });

    return (
        <CommonForm
            actions={(
                <FormActions
                    cancelDisabled={submitting}
                    onCancel={onCancel}
                    submitDisabled={submitting}
                    submitLabel="Create Inventory Move"
                    submitting={submitting}
                    submittingLabel="Creating..."
                />
            )}
            clearError={clearFieldError}
            disabled={submitting}
            errors={formErrors as Partial<Record<keyof IInventoryMoveFormValues, string>>}
            onSubmit={handleFormSubmit}
            sections={formItems}
            setValue={setFieldValue}
            values={values}
        />
    );
}
