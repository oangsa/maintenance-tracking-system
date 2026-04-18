import React from "react";
import type { IUser } from "~/api/types";
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
            key: "departmentName",
            label: "Department",
            render: (_value: unknown, row: IUserTableRow) => row.departmentName ?? row.departmentCode ?? "-",
            sortable: false,
        },
        {
            key: "updatedAt",
            label: "Updated",
            render: (value: unknown) => formatDateTime(value as string | null | undefined),
        },
    ], []);
}

export default useColumns;
export type { IUserTableRow };
