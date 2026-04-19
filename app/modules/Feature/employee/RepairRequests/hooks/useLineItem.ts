import React from "react";
import { searchRepairRequestItems } from "~/services/repairRequests.service";
import { formatProductLabel, formatRepairStatusLabel } from "~/lib/repairRequestUtils";
import type { IRepairRequestDetailLineItem } from "../../../RepairRequests/detailLineItemColumns";

const REPAIR_REQUEST_ITEMS_PAGE_SIZE = 100;

interface IUseLineItemProps
{
    repairRequestId: number;
}

interface IUseLineItemResult
{
    lineItems: IRepairRequestDetailLineItem[];
    loadingItems: boolean;
    itemsError: string;
    emptyMessage: string;
}

async function loadEmployeeLineItems(repairRequestId: number): Promise<IRepairRequestDetailLineItem[]>
{
    const lineItems: IRepairRequestDetailLineItem[] = [];
    let currentPage = 1;
    let totalPages = 1;

    while (currentPage <= totalPages)
    {
        const response = await searchRepairRequestItems(repairRequestId, {
            deleted: false,
            orderBy: "id asc",
            pageNumber: currentPage,
            pageSize: REPAIR_REQUEST_ITEMS_PAGE_SIZE,
        });

        lineItems.push(...response.data.map((item) => ({
            description: item.description,
            id: item.id,
            productLabel: formatProductLabel(item),
            quantity: item.quantity,
            repairStatus: formatRepairStatusLabel(item),
        })));

        totalPages = response.pagination.totalPages;
        currentPage += 1;
    }

    return lineItems;
}

export default function useLineItem({ repairRequestId }: IUseLineItemProps): IUseLineItemResult
{
    const [lineItems, setLineItems] = React.useState<IRepairRequestDetailLineItem[]>([]);
    const [loadingItems, setLoadingItems] = React.useState(true);
    const [itemsError, setItemsError] = React.useState("");

    React.useEffect(() =>
    {
        let cancelled = false;

        setLoadingItems(true);
        setItemsError("");

        async function loadItems()
        {
            try
            {
                const response = await loadEmployeeLineItems(repairRequestId);

                if (!cancelled)
                {
                    setLineItems(response);
                }
            }
            catch (error)
            {
                if (!cancelled)
                {
                    setItemsError((error as Error).message || "Unable to load repair request items.");
                    setLineItems([]);
                }
            }
            finally
            {
                if (!cancelled)
                {
                    setLoadingItems(false);
                }
            }
        }

        void loadItems();

        return () =>
        {
            cancelled = true;
        };
    }, [repairRequestId]);

    return {
        emptyMessage: "No repair request items were submitted for this request.",
        itemsError,
        lineItems,
        loadingItems,
    };
}
