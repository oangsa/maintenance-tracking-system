export interface IDepartment
{
    id: number;
    code: string;
    name: string;
    createdAt: string | null;
    updatedAt: string | null;
    createdBy: string | null;
    updatedBy: string | null;
}

export interface IDepartmentForCreate
{
    code: string;
    name: string;
}

export interface IDepartmentForUpdate
{
    code?: string;
    name?: string;
}
