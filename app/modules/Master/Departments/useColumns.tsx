import React from "react";
import type { IDepartment } from "~/api/types";
import { formatDateTime } from "./helpers";

type IDepartmentTableRow = IDepartment & Record<string, unknown>;

function useColumns()
{
    return React.useMemo(() => [
        {
            key: "code",
            label: "Code",
            render: (value: unknown, row: IDepartmentTableRow) => String(value ?? row.name),
        },
        {
            key: "name",
            label: "Name",
            render: (value: unknown, row: IDepartmentTableRow) => String(value ?? row.code),
        },
        {
            key: "updatedAt",
            label: "Updated",
            render: (value: unknown) => formatDateTime(value as string | null | undefined),
        },
    ], []);
}

export default useColumns;
export type { IDepartmentTableRow };