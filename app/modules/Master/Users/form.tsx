import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import CommonForm, { FormActions } from "~/components/Common/Form";
import ListPickerModal from "~/components/Common/ListPickerModal";
import Loading from "~/components/Common/Loading";
import { useManagedForm } from "~/components/Common/Form/useManagedForm";
import type { IDepartment } from "~/api/types/types";
import { searchDepartments } from "~/services/departments.service";
import { useFormItem } from "./hooks/useFormItem";
import type { IUserFormValues } from "./hooks//helpers";
import { UserFormSchema } from "~/schemas/userFormSchema";

type IDepartmentPickerRow = IDepartment & Record<string, unknown>;

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
    const [isDepartmentLookupOpen, setIsDepartmentLookupOpen] = React.useState(false);
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
        onOpenDepartmentLookup: handleOpenDepartmentLookup,
    });

    const departmentColumns = React.useMemo(() => [
        {
            key: "code",
            label: "Code",
        },
        {
            key: "name",
            label: "Name",
        },
    ], []);

    function handleValueChange<TKey extends keyof IUserFormValues>(fieldName: TKey, value: IUserFormValues[TKey])
    {
        setFieldValue(fieldName, value);
    }

    const fetchDepartments = React.useCallback(async (params: {
        search: string;
        page: number;
        limit: number;
        sortBy?: string;
        sortDir?: "asc" | "desc";
    }) =>
    {
        const response = await searchDepartments({
            deleted: false,
            orderBy: params.sortBy
                ? `${params.sortBy} ${params.sortDir === "desc" ? "desc" : "asc"}`
                : "code asc",
            pageNumber: params.page,
            pageSize: params.limit,
            searchTerm: params.search
                ? {
                    name: "code,name",
                    value: params.search,
                }
                : undefined,
        });

        return {
            data: response.data as IDepartmentPickerRow[],
            total: response.pagination.totalCount,
            totalPages: response.pagination.totalPages,
            pageItemCount: response.pagination.pageSize,
            currentPage: response.pagination.currentPage,
            hasNext: response.pagination.hasNext,
            hasPrevious: response.pagination.hasPrevious,
        };
    }, []);

    function handleDepartmentSelect(department: IDepartmentPickerRow)
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

    function handleOpenDepartmentLookup()
    {
        setIsDepartmentLookupOpen(true);
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
        <>
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

            <ListPickerModal<IDepartmentPickerRow>
                columns={departmentColumns}
                emptyDefault="No departments found."
                emptySearch="No matching departments found."
                fetchData={fetchDepartments}
                initialSearch={values.departmentCode || values.departmentName}
                isOpen={isDepartmentLookupOpen}
                itemName="department"
                onClose={() => setIsDepartmentLookupOpen(false)}
                onSelect={handleDepartmentSelect}
                searchPlaceholder="Search code or department name..."
                title="Select Department"
            />
        </>
    );
}
