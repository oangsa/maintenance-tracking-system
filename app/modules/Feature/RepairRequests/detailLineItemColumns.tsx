import type { ReactNode } from "react"
import type { ILineItemColumn, ILineItemValue } from "~/components/Common/LineItemsEditor"

export interface IRepairRequestDetailLineItem extends ILineItemValue
{
    description?: string | null;
    productLabel?: string | null;
    quantity?: number | string | null;
    repairStatus?: string | null;
}

interface ICreateRepairRequestDetailLineItemColumnsOptions
{
    renderAction?: (item: IRepairRequestDetailLineItem, index: number) => ReactNode;
}

function renderTextValue(value?: string | null): string
{
    if (!value?.trim())
    {
        return "-"
    }

    return value.trim()
}

export function createRepairRequestDetailLineItemColumns({
    renderAction,
}: ICreateRepairRequestDetailLineItemColumnsOptions = {}): ILineItemColumn<IRepairRequestDetailLineItem>[]
{
    const columns: ILineItemColumn<IRepairRequestDetailLineItem>[] = [
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

    if (renderAction)
    {
        columns.push({
            cellClassName: "w-[180px] align-top",
            headerClassName: "w-[180px] text-right",
            key: "actions",
            label: "Action",
            renderCell: (context) => (
                <div className="flex justify-end">
                    {renderAction(context.item, context.index)}
                </div>
            ),
        })
    }

    return columns
}
