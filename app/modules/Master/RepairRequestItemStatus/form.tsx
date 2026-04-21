import React from "react";
import { type IRepairRequestItemStatusFormValues } from "./hooks/helpers";
import { RepairRequestItemStatusFormSchema } from "@/schemas/repairRequestItemStatusFormSchema";
import CommonForm, { FormActions } from "~/components/Common/Form";
import { useFormItem } from "./hooks/useFormItem";
import Loading from "@/components/Common/Loading";

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

function validateForm(values: IRepairRequestItemStatusFormValues): IRepairRequestItemStatusFormErrors
{
    const nextErrors: IRepairRequestItemStatusFormErrors = {};
    const validationResult = RepairRequestItemStatusFormSchema.safeParse(values);

    if (validationResult.success)
    {
        return nextErrors;
    }

    for (const issue of validationResult.error.issues)
    {
        const fieldName = issue.path[0];

        if (typeof fieldName === "string" && !nextErrors[fieldName as keyof IRepairRequestItemStatusFormErrors])
        {
            nextErrors[fieldName as keyof IRepairRequestItemStatusFormErrors] = issue.message;
        }
    }

    return nextErrors;
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
    const [values, setValues] = React.useState<IRepairRequestItemStatusFormValues>(initialValues);
    const [formErrors, setFormErrors] = React.useState<IRepairRequestItemStatusFormErrors>({});
    const { formItems } = useFormItem();

    React.useEffect(() =>
    {
        setValues(initialValues);
        setFormErrors({});
    }, [initialValues]);

    function handleValueChange<TKey extends keyof IRepairRequestItemStatusFormValues>(fieldName: TKey, value: IRepairRequestItemStatusFormValues[TKey])
    {
        setValues((currentValue) => ({ ...currentValue, ...{ [fieldName]: value } }));
        setFormErrors((currentErrors) => ({ ...currentErrors, ...{ [fieldName]: undefined } }));
    }

    function clearFieldError(fieldName: string)
    {
        setFormErrors((currentErrors) => ({ ...currentErrors, ...{ [fieldName]: undefined } }));
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
            onSubmit={handleSubmit}
            setValue={handleValueChange}
            values={values}
        />
    );
}
