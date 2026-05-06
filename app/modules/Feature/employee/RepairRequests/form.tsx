import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { FieldErrors } from "react-hook-form";
import CommonForm, { FormActions } from "~/components/Common/Form";
import { useManagedForm } from "~/components/Common/Form/useManagedForm";
import type { IUser } from "~/api/types/types";
import { formatDepartmentLabel, formatRequesterLabel } from "~/lib/formatters";
import { parsePositiveNumber } from "./hooks/helpers";
import { useFormItem } from "./hooks/useFormItem";
import type { IRepairRequestFormLineItem, IRepairRequestFormValues } from "./hooks/helpers";
import { RepairRequestFormSchema } from "~/schemas/repairRequestFormSchema";
import RepairRequestLineItemsEditor from "./RepairRequestLineItemsEditor";

interface IRepairRequestFormProps
{
    mode: "create" | "edit";
    currentUser: IUser;
    initialValues: IRepairRequestFormValues;
    submitting?: boolean;
    onCancel: () => void;
    onSubmit: (values: IRepairRequestFormValues) => void | Promise<void>;
}

interface IRepairRequestFormErrors
{
    items?: string;
    itemIssues: string[];
    priority?: string;
}

function resolveErrorMessage(errorValue: unknown): string | undefined
{
    if (!errorValue || typeof errorValue !== "object")
    {
        return undefined;
    }

    if (!("message" in errorValue))
    {
        return undefined;
    }

    const messageValue = (errorValue as { message?: unknown }).message;

    if (typeof messageValue === "string" && messageValue.trim() !== "")
    {
        return messageValue;
    }

    return undefined;
}

function mapRepairRequestFormErrors(fieldErrors: FieldErrors<IRepairRequestFormValues>): IRepairRequestFormErrors
{
    const nextItemIssues: string[] = [];
    const itemErrors = fieldErrors.items;

    if (Array.isArray(itemErrors))
    {
        itemErrors.forEach((itemError, index) =>
        {
            if (!itemError || typeof itemError !== "object")
            {
                return;
            }

            Object.values(itemError).forEach((fieldErrorValue) =>
            {
                const message = resolveErrorMessage(fieldErrorValue);

                if (!message)
                {
                    return;
                }

                nextItemIssues.push(`Item ${index + 1}: ${message}`);
            });
        });
    }

    let itemsMessage = resolveErrorMessage(itemErrors);

    if (!itemsMessage && nextItemIssues.length > 0)
    {
        itemsMessage = "Review the repair request items and complete all required fields.";
    }

    return {
        itemIssues: nextItemIssues,
        items: itemsMessage,
        priority: fieldErrors.priority?.message,
    };
}

export default function RepairRequestForm({
    mode,
    currentUser,
    initialValues,
    submitting = false,
    onCancel,
    onSubmit,
}: IRepairRequestFormProps)
{
    const resolvedSchema = React.useMemo(() => RepairRequestFormSchema.superRefine((currentValues, ctx) =>
    {
        currentValues.items.forEach((item, index) =>
        {
            const quantity = parsePositiveNumber(item.quantity);

            if (quantity === null)
            {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Quantity must be greater than 0.",
                    path: ["items", index, "quantity"],
                });
            }
        });
    }), []);
    const {
        values,
        errors: formErrors,
        clearFieldError,
        handleFormSubmit,
        setFieldValue,
    } = useManagedForm<IRepairRequestFormValues, IRepairRequestFormErrors>({
        initialValues,
        mapErrors: mapRepairRequestFormErrors,
        onSubmit,
        resolver: zodResolver(resolvedSchema),
    });

    const fieldErrors = React.useMemo<Partial<Record<keyof IRepairRequestFormValues, string>>>(() => ({
        items: formErrors.items,
        priority: formErrors.priority,
    }), [formErrors.items, formErrors.priority]);

    const requesterLabel = formatRequesterLabel(currentUser.name, currentUser.email);
    const departmentLabel = formatDepartmentLabel(currentUser.departmentCode, currentUser.departmentName);

    function handleValueChange<TKey extends keyof IRepairRequestFormValues>(fieldName: TKey, value: IRepairRequestFormValues[TKey])
    {
        setFieldValue(fieldName, value);
    }

    const handleItemsChange = React.useCallback((nextItems: IRepairRequestFormLineItem[]) =>
    {
        setFieldValue("items", nextItems);
    }, [setFieldValue]);

    const lineItemsEditor = React.useMemo(() => (
        <RepairRequestLineItemsEditor
            disabled={submitting}
            itemIssues={formErrors.itemIssues}
            items={values.items}
            itemsError={formErrors.items}
            onChange={handleItemsChange}
            resetTrigger={initialValues}
        />
    ), [formErrors.itemIssues, formErrors.items, handleItemsChange, initialValues, submitting, values.items]);

    const { formItems } = useFormItem({
        mode,
        departmentLabel,
        lineItemsEditor,
        requesterLabel,
    });

    return (
        <CommonForm
            actions={(
                <FormActions
                    cancelDisabled={submitting}
                    onCancel={onCancel}
                    submitDisabled={submitting}
                    submitLabel={mode === "create" ? "Create Repair Request" : "Save Changes"}
                    submitting={submitting}
                    submittingLabel={mode === "create" ? "Creating..." : "Saving..."}
                />
            )}
            clearError={clearFieldError}
            disabled={submitting}
            errors={fieldErrors}
            onSubmit={handleFormSubmit}
            sections={formItems}
            setValue={handleValueChange}
            values={values}
        />
    );
}
