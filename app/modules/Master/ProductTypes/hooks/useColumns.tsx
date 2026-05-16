import { formatDateTime } from "@/lib/formatters";
import { useMemo } from "react";
import type { IProductType } from "~/api/types/types";

type IProductTypeTableRow = IProductType & Record<string, unknown>;

export default function useColumns()
{
    return useMemo(() => [
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
            key: "department_code",
            label: "Department Code",
            render: (value: unknown, row: IProductTypeTableRow) => String(value ?? row.departmentCode),
        },
        {
            key: "department_name",
            label: "Department Name",
            render: (value: unknown, row: IProductTypeTableRow) => String(value ?? row.departmentName),
        },
        {
            key: "updated_at",
            label: "Updated At",
            render: (value: unknown, row: IProductTypeTableRow) => formatDateTime(row.updatedAt as string | null | undefined),
        },
        
    ], []);
}