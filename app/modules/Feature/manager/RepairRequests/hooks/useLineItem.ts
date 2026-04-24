import React from "react";
import { buildLookupPayload, SEARCH_OPERATOR } from "~/constants";
import { searchRepairRequestItems } from "~/services/repairRequests.service";
import { formatProductLabel, formatRepairStatusLabel } from "~/lib/repairRequestUtils";
import type { IRepairRequestDetailLineItem } from "../../../RepairRequests/detailLineItemColumns";

const MANAGER_ITEM_SEARCH_FIELD = "department_id";
const REPAIR_REQUEST_ITEMS_PAGE_SIZE = 100;

interface IUseLineItemProps
{
    currentUserDepartmentId: number | null;
    repairRequestId: number;
}

interface IUseLineItemResult
{
    lineItems: IRepairRequestDetailLineItem[];
    loadingItems: boolean;
    itemsError: string;
    emptyMessage: string;
}

async function loadManagerLineItems(repairRequestId: number, currentUserDepartmentId: number): Promise<IRepairRequestDetailLineItem[]>
{
    const lineItems: IRepairRequestDetailLineItem[] = [];
    let currentPage = 1;
    let totalPages = 1;

    while (currentPage <= totalPages)
    {
        const response = await searchRepairRequestItems(repairRequestId, {
            ...buildLookupPayload("repairRequestItem", {
                limit: REPAIR_REQUEST_ITEMS_PAGE_SIZE,
                page: currentPage,
                search: "",
            }),
            search: [
                {
                    condition: SEARCH_OPERATOR.EQUAL,
                    name: MANAGER_ITEM_SEARCH_FIELD,
                    value: String(currentUserDepartmentId),
                },
            ],
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

export default function useLineItem({ currentUserDepartmentId, repairRequestId }: IUseLineItemProps): IUseLineItemResult
{
    const [lineItems, setLineItems] = React.useState<IRepairRequestDetailLineItem[]>([]);
    const [loadingItems, setLoadingItems] = React.useState(currentUserDepartmentId !== null);
    const [itemsError, setItemsError] = React.useState("");

    React.useEffect(() =>
    {
        let cancelled = false;

        if (currentUserDepartmentId === null)
        {
            setLineItems([]);
            setItemsError("");
            setLoadingItems(false);

            return () =>
            {
                cancelled = true;
            };
        }

        const resolvedCurrentUserDepartmentId = currentUserDepartmentId;

        setLoadingItems(true);
        setItemsError("");

        async function loadItems()
        {
            try
            {
                const response = await loadManagerLineItems(repairRequestId, resolvedCurrentUserDepartmentId);

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
    }, [currentUserDepartmentId, repairRequestId]);

    const emptyMessage = React.useMemo(() => currentUserDepartmentId === null
        ? "Your user account is not assigned to a department, so no line items are available."
        : "No repair request items were submitted for your department."
    , [currentUserDepartmentId]);

    return {
        emptyMessage,
        itemsError,
        lineItems,
        loadingItems,
    };
}
