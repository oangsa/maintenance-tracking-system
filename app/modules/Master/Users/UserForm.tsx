import React from "react";
import Loading from "~/components/Common/Loading";
import { formatRoleLabel, roleOptions } from "./helpers";
import type { IUserFormValues } from "./helpers";

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
    const trimmedEmail = values.email.trim();
    const trimmedDepartmentId = values.departmentId.trim();

    if (!trimmedEmail)
    {
        nextErrors.email = "Email is required.";
    }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail))
    {
        nextErrors.email = "Enter a valid email address.";
    }

    if (mode === "create" && values.password.length < 6)
    {
        nextErrors.password = "Password must be at least 6 characters.";
    }

    if (mode === "edit" && values.password && values.password.length < 6)
    {
        nextErrors.password = "Password must be at least 6 characters.";
    }

    if (!values.role)
    {
        nextErrors.role = "Role is required.";
    }

    if (trimmedDepartmentId && !/^\d+$/.test(trimmedDepartmentId))
    {
        nextErrors.departmentId = "Department ID must be numeric.";
    }

    if (values.name.trim().length > 150)
    {
        nextErrors.name = "Name must be 150 characters or fewer.";
    }

    if (values.avatarUrl.trim().length > 0)
    {
        try
        {
            new URL(values.avatarUrl.trim());
        }
        catch
        {
            nextErrors.avatarUrl = "Avatar URL must be a valid URL.";
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

    React.useEffect(() =>
    {
        setValues(initialValues);
        setFormErrors({});
    }, [initialValues]);

    function handleFieldChange(event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>)
    {
        const { name, value } = event.target;

        setValues((currentValues) => ({
            ...currentValues,
            [name]: value,
        }));

        setFormErrors((currentErrors) => ({
            ...currentErrors,
            [name]: undefined,
        }));
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

            <form onSubmit={handleSubmit}>
                <div className="grid gap-5 md:grid-cols-2">
                    <div className="form-group">
                        <label className="form-label" htmlFor="name">
                            Name
                        </label>
                        <input
                            className="form-control"
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

                    <div className="form-group">
                        <label className="form-label" htmlFor="email">
                            Email
                            <span className="required-marker">*</span>
                        </label>
                        <input
                            className="form-control"
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

                    <div className="form-group">
                        <label className="form-label" htmlFor="password">
                            Password
                            {mode === "create" && <span className="required-marker">*</span>}
                        </label>
                        <input
                            className="form-control"
                            disabled={submitting}
                            id="password"
                            name="password"
                            onChange={handleFieldChange}
                            placeholder={mode === "create" ? "Minimum 6 characters" : "Leave blank to keep current password"}
                            type="password"
                            value={values.password}
                        />
                        <span className="mt-1 block text-xs text-[var(--text-muted)]">
                            {mode === "create" ? "Set an initial password for the new user." : "Only fill this in when you want to change the current password."}
                        </span>
                        {formErrors.password && <span className="form-error">{formErrors.password}</span>}
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="role">
                            Role
                            <span className="required-marker">*</span>
                        </label>
                        <select
                            className="form-control"
                            disabled={submitting}
                            id="role"
                            name="role"
                            onChange={handleFieldChange}
                            value={values.role}
                        >
                            {roleOptions.map((roleOption) => (
                                <option key={roleOption} value={roleOption}>
                                    {formatRoleLabel(roleOption)}
                                </option>
                            ))}
                        </select>
                        {formErrors.role && <span className="form-error">{formErrors.role}</span>}
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="departmentId">
                            Department ID
                        </label>
                        <input
                            className="form-control"
                            disabled={submitting}
                            id="departmentId"
                            name="departmentId"
                            onChange={handleFieldChange}
                            placeholder="Optional numeric department id"
                            type="text"
                            value={values.departmentId}
                        />
                        <span className="mt-1 block text-xs text-[var(--text-muted)]">
                            Department lookup is not wired in this project yet, so this field accepts a numeric department ID.
                        </span>
                        {formErrors.departmentId && <span className="form-error">{formErrors.departmentId}</span>}
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="avatarUrl">
                            Avatar URL
                        </label>
                        <input
                            className="form-control"
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
                    <button
                        className="btn btn-outline"
                        disabled={submitting}
                        onClick={onCancel}
                        type="button"
                    >
                        Cancel
                    </button>
                    <button className="btn btn-primary" disabled={submitting} type="submit">
                        {submitting
                            ? (mode === "create" ? "Creating..." : "Saving...")
                            : (mode === "create" ? "Create User" : "Save Changes")
                        }
                    </button>
                </div>
            </form>
        </div>
    );
}
