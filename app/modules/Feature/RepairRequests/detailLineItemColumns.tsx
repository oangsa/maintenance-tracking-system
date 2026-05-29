import type { ReactNode } from "react"
import type { ILineItemColumn, ILineItemValue } from "~/components/Common/LineItemsEditor"
import { columns } from "./useLineItemColumn"

export interface IRepairRequestDetailLineItem extends ILineItemValue
{
    description?: string | null;
    productLabel?: string | null;
    quantity?: number | string | null;
    repairStatus?: string | null;
    workOrderId?: number | null;
}

interface ICreateRepairRequestDetailLineItemColumnsOptions
{
    renderAction?: (item: IRepairRequestDetailLineItem, index: number) => ReactNode;
}



export function createRepairRequestDetailLineItemColumns({ renderAction }: ICreateRepairRequestDetailLineItemColumnsOptions = {}): ILineItemColumn<IRepairRequestDetailLineItem>[]
{
    const newColumns = [...columns]

    if (renderAction)
    {
        newColumns.push({
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

    return newColumns
}
