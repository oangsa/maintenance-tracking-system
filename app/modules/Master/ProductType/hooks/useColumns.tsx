import React from "react";
import type { IProductType } from "~/api/types/types";
import { formatDateTime } from "~/lib/formatters";

type IProductTypeTableRow = IProductType & Record<string, unknown>;

function useColumns()
{
    return React.useMemo(() => [
        {
            key: "code",
            label: "Code",
            render: (value: unknown, row: IProductTypeTableRow) => String(value ?? row.code),
        },
        {
            key: "name",
            label: "Name",
            render: (value: unknown, row: IProductTypeTableRow) => String(value ?? row.name),
        },
        {
            key: "departmentName",
            label: "Department",
            render: (value: unknown, row: IProductTypeTableRow) => String(value ?? row.departmentName),
        },
        {
            key: "updated_at",
            label: "Updated At",
            render: (value: unknown, row: IProductTypeTableRow) => formatDateTime(row.updatedAt as string | null | undefined),
        },
    ], []);
}

export default useColumns;
export type { IProductTypeTableRow };       