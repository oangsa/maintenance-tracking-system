import React from "react";
import { z } from "zod";
import Loading from "~/components/Common/Loading";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import type { IDepartmentFormValues } from "./helpers";

interface IDepartmentFormProps
{
    mode: "create" | "edit";
    initialValues: IDepartmentFormValues;
    loading?: boolean;
    submitting?: boolean;
    error?: string;
    onCancel: () => void;
    onSubmit: (values: IDepartmentFormValues) => void | Promise<void>;
}

interface IDepartmentFormErrors
{
    code?: string;
    name?: string;
}

const DepartmentFormSchema = z.object({
    code: z.string().trim().min(1, "Code is required.").max(150, "Code must be 150 characters or fewer."),
    name: z.string().trim().min(1, "Name is required.").max(150, "Name must be 150 characters or fewer."),
});

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
    error = "",
    onCancel,
    onSubmit,
}: IDepartmentFormProps)
{
    const [values, setValues] = React.useState<IDepartmentFormValues>(initialValues);
    const [formErrors, setFormErrors] = React.useState<IDepartmentFormErrors>({});

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

    function handleFieldChange(event: React.ChangeEvent<HTMLInputElement>)
    {
        const fieldName = event.target.name as keyof IDepartmentFormValues;

        handleValueChange(fieldName, event.target.value as IDepartmentFormValues[keyof IDepartmentFormValues]);
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
        <div className="card">
            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="code">
                            Code
                            <span className="required-marker">*</span>
                        </Label>
                        <Input
                            aria-invalid={Boolean(formErrors.code)}
                            disabled={submitting}
                            id="code"
                            name="code"
                            onChange={handleFieldChange}
                            placeholder="Enter department code"
                            type="text"
                            value={values.code}
                        />
                        {formErrors.code && <span className="form-error">{formErrors.code}</span>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name">
                            Name
                            <span className="required-marker">*</span>
                        </Label>
                        <Input
                            aria-invalid={Boolean(formErrors.name)}
                            disabled={submitting}
                            id="name"
                            name="name"
                            onChange={handleFieldChange}
                            placeholder="Enter department name"
                            type="text"
                            value={values.name}
                        />
                        {formErrors.name && <span className="form-error">{formErrors.name}</span>}
                    </div>
                </div>

                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <Button
                        variant="outline"
                        disabled={submitting}
                        onClick={onCancel}
                        type="button"
                    >
                        Cancel
                    </Button>
                    <Button disabled={submitting} type="submit">
                        {submitting
                            ? (mode === "create" ? "Creating..." : "Saving...")
                            : (mode === "create" ? "Create Department" : "Save Changes")
                        }
                    </Button>
                </div>
            </form>
        </div>
    );
}