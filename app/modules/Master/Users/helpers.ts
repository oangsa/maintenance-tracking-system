import type { IUser, IUserForCreate, IUserForUpdate } from "~/api/types";
import type { IRole } from "~/constants";

interface IUserFormValues
{
    name: string;
    email: string;
    password: string;
    role: IRole;
    departmentId: string;
    avatarUrl: string;
}

const roleOptions: IRole[] = ["admin", "manager", "employee"];

function formatRoleLabel(role?: string | null): string
{
    if (!role)
    {
        return "-";
    }

    return role.charAt(0).toUpperCase() + role.slice(1);
}

function formatDateTime(value?: string | null): string
{
    if (!value)
    {
        return "-";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime()))
    {
        return value;
    }

    return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}

function createEmptyUserFormValues(): IUserFormValues
{
    return {
        name: "",
        email: "",
        password: "",
        role: "employee",
        departmentId: "",
        avatarUrl: "",
    };
}

function mapUserToFormValues(user: IUser): IUserFormValues
{
    return {
        name: user.name ?? "",
        email: user.email,
        password: "",
        role: user.role,
        departmentId: user.departmentId !== null ? String(user.departmentId) : "",
        avatarUrl: "",
    };
}

function parseDepartmentId(departmentId: string): number | undefined
{
    const trimmedDepartmentId = departmentId.trim();

    if (!trimmedDepartmentId)
    {
        return undefined;
    }

    const parsedDepartmentId = Number(trimmedDepartmentId);

    if (!Number.isFinite(parsedDepartmentId))
    {
        return undefined;
    }

    return parsedDepartmentId;
}

function buildCreatePayload(values: IUserFormValues): IUserForCreate
{
    const payload: IUserForCreate = {
        email: values.email.trim(),
        password: values.password,
        role: values.role,
    };

    if (values.name.trim())
    {
        payload.name = values.name.trim();
    }

    if (values.avatarUrl.trim())
    {
        payload.avatarUrl = values.avatarUrl.trim();
    }

    const departmentId = parseDepartmentId(values.departmentId);

    if (departmentId !== undefined)
    {
        payload.departmentId = departmentId;
    }

    return payload;
}

function buildUpdatePayload(values: IUserFormValues): IUserForUpdate
{
    const payload: IUserForUpdate = {
        email: values.email.trim(),
        role: values.role,
    };

    if (values.name.trim())
    {
        payload.name = values.name.trim();
    }

    if (values.avatarUrl.trim())
    {
        payload.avatarUrl = values.avatarUrl.trim();
    }

    if (values.password)
    {
        payload.password = values.password;
    }

    const departmentId = parseDepartmentId(values.departmentId);

    if (departmentId !== undefined)
    {
        payload.departmentId = departmentId;
    }

    return payload;
}

export {
    buildCreatePayload,
    buildUpdatePayload,
    createEmptyUserFormValues,
    formatDateTime,
    formatRoleLabel,
    mapUserToFormValues,
    roleOptions,
};

export type { IUserFormValues };
