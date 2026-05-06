import React from "react";
import type { IPart } from "~/api/types/types";
import { formatDateTime } from "~/lib/formatters";

type IPartTableRow = IPart & Record<string, unknown>;

function useColumns()
{
    return React.useMemo(() => [
        {
            key: "code",
            label: "Code",
            render: (value: unknown, row: IPartTableRow) => String(value ?? row.code),
        },
        {
            key: "name",
            label: "Name",
            render: (value: unknown, row: IPartTableRow) => String(value ?? row.name),
        },
        {
            key: "productTypeName",
            label: "Product Type",
            render: (value: unknown, row: IPartTableRow) => String(value ?? row.productTypeName),
            sortable: false,
        },
        {
            key: "totalStock",
            label: "Total Stock",
            render: (value: unknown, row: IPartTableRow) => String(value ?? row.totalStock),
            sortable: false,
        },
        {
            key: "updated_at",
            label: "Updated At",
            render: (value: unknown, row: IPartTableRow) => formatDateTime(row.updatedAt as string | null | undefined),
        },
    ], []);
}

export default useColumns;
export type { IPartTableRow };  