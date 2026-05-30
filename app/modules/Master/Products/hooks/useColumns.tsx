import React from "react";
import { Link } from "react-router";
import type { IProduct } from "~/api/types/types";
import { buttonVariants } from "~/components/ui/button";
import { formatDateTime } from "~/lib/formatters";
import { cn } from "~/lib/utils";

export type IProductTableRow = IProduct & Record<string, unknown>;

export function useColumns()
{
    return React.useMemo(
        () => [
            {
                key: "code",
                label: "Code",
                render: (value: unknown, row: IProductTableRow) => String((value ?? row.code) || "-"),
            },
            {
                key: "name",
                label: "Name",
                render: (value: unknown, row: IProductTableRow) => String((value ?? row.name) || "-"),
            },
            {
                key: "productType",
                label: "Product Type",
                render: (value: unknown, row: IProductTableRow) =>
                {
                    if (row.productTypeCode && row.productTypeName)
                    {
                        return `[${row.productTypeCode}] ${row.productTypeName}`;
                    }
                    return String(row.productTypeCode || row.productTypeName || "-");
                },
            },
            {
                key: "createdAt",
                label: "Created At",
                render: (value: unknown, row: IProductTableRow) => formatDateTime(row.createdAt as string | null | undefined),
            },
            {
                key: "updatedAt",
                label: "Updated At",
                render: (value: unknown, row: IProductTableRow) => formatDateTime(row.updatedAt as string | null | undefined),
            },
            {
                key: "actions",
                label: "Actions",
                headerClassName: "w-[120px] text-right",
                cellClassName: "text-right",
                render: (value: unknown, row: IProductTableRow) => (
                    <Link
                        className={cn(buttonVariants({ size: "sm", variant: "outline" }), "text-foreground! hover:text-foreground!")}
                        to={`/master/products/${row.id}`}
                    >
                        View
                    </Link>
                ),
            },
        ],
        [],
    );
}
