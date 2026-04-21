import type { IUser, IUserForCreate, IUserForUpdate } from "~/api/types/types";
import type { IRole } from "~/constants";
import { formatDepartmentLabel as formatDepartmentLabelBase } from "~/lib/formatters";

interface IUserFormValues
{
    name: string;
    email: string;
    password: string;
    role: IRole;
    departmentId: string;
    departmentCode: string;
    departmentName: string;
    avatarUrl: string;
}

function formatRoleLabel(role?: string | null): string
{
    if (!role)
    {
        return "-";
    }

    return role.charAt(0).toUpperCase() + role.slice(1);
}

function createEmptyUserFormValues(): IUserFormValues
{
    return {
        name: "",
        email: "",
        password: "",
        role: "employee",
        departmentId: "",
        departmentCode: "",
        departmentName: "",
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
        departmentCode: user.departmentCode ?? "",
        departmentName: user.departmentName ?? "",
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

function formatDepartmentLabel(departmentCode?: string | null, departmentName?: string | null): string
{
    return formatDepartmentLabelBase(departmentCode, departmentName, "");
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
    formatDepartmentLabel,
    formatRoleLabel,
    mapUserToFormValues,
};

export type { IUserFormValues };
