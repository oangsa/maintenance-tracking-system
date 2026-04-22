import React from "react";
import type { IUser } from "~/api/types/types";
import { formatDateTime } from "~/lib/formatters";
import { formatRoleLabel } from "./helpers";

type IUserTableRow = IUser & Record<string, unknown>;

function useColumns()
{
    return React.useMemo(() => [
        {
            key: "name",
            label: "Name",
            render: (value: unknown, row: IUserTableRow) => String(value ?? row.email),
        },
        {
            key: "email",
            label: "Email",
        },
        {
            key: "role",
            label: "Role",
            render: (value: unknown) => formatRoleLabel(String(value ?? "")),
        },
        {
            key: "department_code",
            label: "Department Code",
            render: (_value: unknown, row: IUserTableRow) => row.departmentCode ?? "-",
            sortable: false,
        },
        {
            key: "department_name",
            label: "Department Name",
            render: (_value: unknown, row: IUserTableRow) => row.departmentName ?? "-",
            sortable: false,
        },
        {
            key: "updated_at",
            label: "Updated At",
            render: (value: unknown, row: IUserTableRow) => formatDateTime( row.updatedAt as string | null | undefined),
        },
    ], []);
}

export default useColumns;
export type { IUserTableRow };
