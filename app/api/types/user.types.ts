import type { IRole } from "../../constants";

export interface IUser
{
    id: number;
    name: string | null;
    email: string;
    role: IRole;
    departmentId: number | null;
    departmentName: string | null;
    departmentCode: string | null;
    createdAt: string | null;
    updatedAt: string | null;
    createdBy: string | null;
    updatedBy: string | null;
}

export interface IUserForCreate
{
    email: string;
    password: string;
    role: IRole;
    departmentId?: number;
    name?: string;
    avatarUrl?: string;
}

export interface IUserForUpdate
{
    email?: string;
    password?: string;
    role?: IRole;
    departmentId?: number;
    name?: string;
    avatarUrl?: string;
}

export interface IDeleteCollectionRequest
{
    ids: string[];
}
