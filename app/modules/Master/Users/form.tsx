import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import CommonForm, { FormActions } from "~/components/Common/Form";
import Loading from "~/components/Common/Loading";
import { useManagedForm } from "~/components/Common/Form/useManagedForm";
import { useFormItem } from "./hooks/useFormItem";
import type { IUserFormValues } from "./hooks//helpers";
import { UserFormSchema } from "~/schemas/userFormSchema";
import type { IDepartmentLookupRow } from "~/components/Common/LookupField/lookups/department.lookup";

interface IUserFormProps
{
    mode: "create" | "edit";
    initialValues: IUserFormValues;
    loading?: boolean;
    submitting?: boolean;
    onCancel: () => void;
    onSubmit: (values: IUserFormValues) => void | Promise<void>;
}

interface IUserFormErrors
{
    name?: string;
    email?: string;
    password?: string;
    role?: string;
    departmentId?: string;
    avatarUrl?: string;
}

export default function UserForm({
    mode,
    initialValues,
    loading = false,
    submitting = false,
    onCancel,
    onSubmit,
}: IUserFormProps)
{
    const resolvedSchema = React.useMemo(() => UserFormSchema.superRefine((currentValues, ctx) =>
    {
        if (mode === "create" && currentValues.password.length < 6)
        {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Password must be at least 6 characters.",
                path: ["password"],
            });
        }

        if (mode === "edit" && currentValues.password.length > 0 && currentValues.password.length < 6)
        {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Password must be at least 6 characters.",
                path: ["password"],
            });
        }
    }), [mode]);
    const {
        values,
        errors: formErrors,
        clearFieldError,
        handleFormSubmit,
        setFieldValue,
        setFieldValues,
    } = useManagedForm<IUserFormValues, IUserFormErrors>({
        initialValues,
        mapErrors: React.useCallback((fieldErrors) => ({
            avatarUrl: fieldErrors.avatarUrl?.message,
            departmentId: fieldErrors.departmentId?.message,
            email: fieldErrors.email?.message,
            name: fieldErrors.name?.message,
            password: fieldErrors.password?.message,
            role: fieldErrors.role?.message,
        }), []),
        onSubmit,
        resolver: zodResolver(resolvedSchema),
    });
    const { formItems } = useFormItem({
        mode,
        onClearDepartment: handleDepartmentClear,
        onSelectDepartment: handleDepartmentSelect,
    });

    function handleValueChange<TKey extends keyof IUserFormValues>(fieldName: TKey, value: IUserFormValues[TKey])
    {
        setFieldValue(fieldName, value);
    }

    function handleDepartmentSelect(department: IDepartmentLookupRow)
    {
        setFieldValues({
            departmentCode: department.code,
            departmentId: String(department.id),
            departmentName: department.name,
        });
        clearFieldError("departmentId");
    }

    function handleDepartmentClear()
    {
        setFieldValues({
            departmentCode: "",
            departmentId: "",
            departmentName: "",
        });
        clearFieldError("departmentId");
    }

    if (loading)
    {
        return (
            <div className="card">
                <Loading message="Loading user details..." />
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
                    submitLabel={mode === "create" ? "Create User" : "Save Changes"}
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
