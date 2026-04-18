import type { ILineItemColumn } from "@/components/Common/LineItemsEditor"
import type { IRepairRequestDetailLineItem } from "./detailLineItemColumns"


function renderTextValue(value?: string | null): string
{
    if (!value?.trim())
    {
        return "-"
    }

    return value.trim()
}

export const columns: ILineItemColumn<IRepairRequestDetailLineItem>[] = [
    {
        cellClassName: "w-16 align-top",
        headerClassName: "w-16",
        key: "index",
        label: "No",
        renderCell: (context) => context.renderReadOnlyValue(String(context.index + 1), "font-medium text-muted-foreground"),
    },
    {
        cellClassName: "min-w-[220px] align-top",
        headerClassName: "min-w-[220px]",
        key: "product",
        label: "Product",
        renderCell: (context) => context.renderReadOnlyValue(renderTextValue(context.item.productLabel), "font-medium"),
    },
    {
        cellClassName: "min-w-[260px] align-top",
        headerClassName: "min-w-[260px]",
        key: "description",
        label: "Description",
        renderCell: (context) => context.renderReadOnlyValue(renderTextValue(context.item.description), "whitespace-pre-wrap"),
    },
    {
        cellClassName: "w-[120px] align-top",
        headerClassName: "w-[120px] text-right",
        key: "quantity",
        label: "Qty",
        renderCell: (context) => context.renderReadOnlyValue(String(context.item.quantity ?? "-"), "text-right font-medium"),
    },
    {
        cellClassName: "min-w-[180px] align-top",
        headerClassName: "min-w-[180px]",
        key: "repairStatus",
        label: "Repair Status",
        renderCell: (context) => context.renderReadOnlyValue(renderTextValue(context.item.repairStatus)),
    },
]
