import React from "react";
import { z } from "zod";
import ListPickerModal from "~/components/Common/ListPickerModal";
import Loading from "~/components/Common/Loading";
import type { IDepartment } from "~/api/types";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select";
import { searchDepartments } from "~/services/departments.service";
import { formatDepartmentLabel, formatRoleLabel } from "./helpers";
import type { IUserFormValues } from "./helpers";
import { UserFormSchema } from "~/schemas/userFormSchema";
import { ROLE_OPTIONS as roleOptions } from "~/constants/role.constant";

type IDepartmentPickerRow = IDepartment & Record<string, unknown>;

interface IUserFormProps
{
    mode: "create" | "edit";
    initialValues: IUserFormValues;
    loading?: boolean;
    submitting?: boolean;
    error?: string;
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

function validateForm(values: IUserFormValues, mode: "create" | "edit"): IUserFormErrors
{
    const nextErrors: IUserFormErrors = {};
    const validationResult = UserFormSchema.superRefine((currentValues, ctx) =>
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
    }).safeParse(values);

    if (validationResult.success)
    {
        return nextErrors;
    }

    for (const issue of validationResult.error.issues)
    {
        const fieldName = issue.path[0];

        if (typeof fieldName === "string" && !nextErrors[fieldName as keyof IUserFormErrors])
        {
            nextErrors[fieldName as keyof IUserFormErrors] = issue.message;
        }
    }

    return nextErrors;
}

export default function UserForm({
    mode,
    initialValues,
    loading = false,
    submitting = false,
    error = "",
    onCancel,
    onSubmit,
}: IUserFormProps)
{
    const [values, setValues] = React.useState<IUserFormValues>(initialValues);
    const [formErrors, setFormErrors] = React.useState<IUserFormErrors>({});
    const [isDepartmentLookupOpen, setIsDepartmentLookupOpen] = React.useState(false);

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

    React.useEffect(() =>
    {
        setValues(initialValues);
        setFormErrors({});
    }, [initialValues]);

    function handleValueChange<TKey extends keyof IUserFormValues>(fieldName: TKey, value: IUserFormValues[TKey])
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
        const fieldName = event.target.name as keyof IUserFormValues;

        handleValueChange(fieldName, event.target.value as IUserFormValues[keyof IUserFormValues]);
    }

    function handleSubmit(event: React.FormEvent<HTMLFormElement>)
    {
        event.preventDefault();

        const nextErrors = validateForm(values, mode);

        if (Object.keys(nextErrors).length > 0)
        {
            setFormErrors(nextErrors);
            return;
        }

        void onSubmit(values);
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
        setValues((currentValues) => ({
            ...currentValues,
            departmentCode: department.code,
            departmentId: String(department.id),
            departmentName: department.name,
        }));

        setFormErrors((currentErrors) => ({
            ...currentErrors,
            departmentId: undefined,
        }));
    }

    function handleDepartmentClear()
    {
        setValues((currentValues) => ({
            ...currentValues,
            departmentCode: "",
            departmentId: "",
            departmentName: "",
        }));

        setFormErrors((currentErrors) => ({
            ...currentErrors,
            departmentId: undefined,
        }));
    }

    const departmentDisplayValue = formatDepartmentLabel(values.departmentCode, values.departmentName);

    if (loading)
    {
        return (
            <div className="card">
                <Loading message="Loading user details..." />
            </div>
        );
    }

    return (
        <div className="card">
            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="name">
                            Name
                        </Label>
                        <Input
                            aria-invalid={Boolean(formErrors.name)}
                            disabled={submitting}
                            id="name"
                            name="name"
                            onChange={handleFieldChange}
                            placeholder="Enter full name"
                            type="text"
                            value={values.name}
                        />
                        {formErrors.name && <span className="form-error">{formErrors.name}</span>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">
                            Email
                            <span className="required-marker">*</span>
                        </Label>
                        <Input
                            aria-invalid={Boolean(formErrors.email)}
                            disabled={submitting}
                            id="email"
                            name="email"
                            onChange={handleFieldChange}
                            placeholder="user@example.com"
                            type="email"
                            value={values.email}
                        />
                        {formErrors.email && <span className="form-error">{formErrors.email}</span>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">
                            Password
                            {mode === "create" && <span className="required-marker">*</span>}
                        </Label>
                        <Input
                            aria-invalid={Boolean(formErrors.password)}
                            disabled={submitting}
                            id="password"
                            name="password"
                            onChange={handleFieldChange}
                            placeholder={mode === "create" ? "Minimum 6 characters" : "Leave blank to keep current password"}
                            type="password"
                            value={values.password}
                        />
                        <span className="mt-1 block text-xs text-muted-foreground">
                            {mode === "create" ? "Set an initial password for the new user." : "Only fill this in when you want to change the current password."}
                        </span>
                        {formErrors.password && <span className="form-error">{formErrors.password}</span>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="role">
                            Role
                            <span className="required-marker">*</span>
                        </Label>
                        <Select
                            value={values.role}
                            onValueChange={(value) => handleValueChange("role", value as IUserFormValues["role"])}
                        >
                            <SelectTrigger id="role" className="w-full" aria-invalid={Boolean(formErrors.role)} disabled={submitting}>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {roleOptions.map((roleOption) => (
                                    <SelectItem key={roleOption} value={roleOption}>
                                    {formatRoleLabel(roleOption)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {formErrors.role && <span className="form-error">{formErrors.role}</span>}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="departmentLookupDisplay">
                            Department
                        </Label>
                        <div className="flex flex-col gap-3 md:flex-row md:items-start">
                            <div className="flex-1">
                                <Input
                                    aria-invalid={Boolean(formErrors.departmentId)}
                                    disabled={submitting}
                                    id="departmentLookupDisplay"
                                    placeholder="No department selected"
                                    readOnly={true}
                                    type="text"
                                    value={departmentDisplayValue}
                                />
                                {formErrors.departmentId && <span className="form-error">{formErrors.departmentId}</span>}
                            </div>

                            <div className="flex gap-2 md:pt-[2px]">
                                <Button
                                    variant="outline"
                                    disabled={submitting}
                                    onClick={() => setIsDepartmentLookupOpen(true)}
                                    type="button"
                                >
                                    Lookup Department
                                </Button>
                                <Button
                                    variant="outline"
                                    disabled={submitting || !values.departmentId}
                                    onClick={handleDepartmentClear}
                                    type="button"
                                >
                                    Clear
                                </Button>
                            </div>
                        </div>
                        <span className="mt-2 block text-xs text-muted-foreground">
                            Search and select a department from the lookup table.
                        </span>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="avatarUrl">
                            Avatar URL
                        </Label>
                        <Input
                            aria-invalid={Boolean(formErrors.avatarUrl)}
                            disabled={submitting}
                            id="avatarUrl"
                            name="avatarUrl"
                            onChange={handleFieldChange}
                            placeholder="https://example.com/avatar.png"
                            type="url"
                            value={values.avatarUrl}
                        />
                        {formErrors.avatarUrl && <span className="form-error">{formErrors.avatarUrl}</span>}
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
                            : (mode === "create" ? "Create User" : "Save Changes")
                        }
                    </Button>
                </div>
            </form>

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
        </div>
    );
}
