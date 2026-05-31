import React from "react";
import { buildLookupPayload, SEARCH_OPERATOR } from "~/constants";
import { searchRepairRequestItems, searchRepairRequestWorkOrders } from "~/services/repairRequests.service";
import { formatProductLabel, formatRepairStatusLabel } from "~/lib/repairRequestUtils";
import type { IRepairRequestDetailLineItem } from "../../../RepairRequests/detailLineItemColumns";
import type { IWorkOrder } from "~/api/types/types";

const MANAGER_ITEM_SEARCH_FIELD = "department_id";
const REPAIR_REQUEST_ITEMS_PAGE_SIZE = 100;
const WORK_ORDERS_PAGE_SIZE = 100;
const DONE_STATUS_CODE_CANDIDATES = ["DONE", "COMPLETED", "COMPLETE", "FINISHED", "RESOLVED", "CLOSED"];

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

interface IWorkOrderLineItemState
{
    workOrderId: number | null;
    isWorkOrderDone: boolean;
}

function normalizeStatusToken(value: string | null | undefined): string
{
    return String(value ?? "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function isDoneWorkOrder(workOrder: IWorkOrder): boolean
{
    const normalizedStatusCode = normalizeStatusToken(workOrder.repairRequestItemRepairStatusCode);

    if (DONE_STATUS_CODE_CANDIDATES.includes(normalizedStatusCode))
    {
        return true;
    }

    if (workOrder.workTaskEndedAt)
    {
        return true;
    }

    return false;
}

async function loadManagerLineItems(repairRequestId: number, currentUserDepartmentId: number): Promise<IRepairRequestDetailLineItem[]>
{
    const workOrderByRepairRequestItemId = new Map<number, IWorkOrderLineItemState>();
    const lineItems: IRepairRequestDetailLineItem[] = [];
    let currentPage = 1;
    let totalPages = 1;

    while (currentPage <= totalPages)
    {
        const response = await searchRepairRequestWorkOrders(repairRequestId, {
            deleted: false,
            pageNumber: currentPage,
            pageSize: WORK_ORDERS_PAGE_SIZE,
        });

        response.data.forEach((workOrder) =>
        {
            if (typeof workOrder.repairRequestItemId !== "number")
            {
                return;
            }

            const existingState = workOrderByRepairRequestItemId.get(workOrder.repairRequestItemId);
            const parsedWorkOrderId = Number(workOrder.id);
            const resolvedWorkOrderId = Number.isFinite(parsedWorkOrderId) && parsedWorkOrderId > 0
                ? parsedWorkOrderId
                : null;

            if (!existingState)
            {
                workOrderByRepairRequestItemId.set(workOrder.repairRequestItemId, {
                    isWorkOrderDone: isDoneWorkOrder(workOrder),
                    workOrderId: resolvedWorkOrderId,
                });

                return;
            }

            workOrderByRepairRequestItemId.set(workOrder.repairRequestItemId, {
                isWorkOrderDone: existingState.isWorkOrderDone || isDoneWorkOrder(workOrder),
                workOrderId: existingState.workOrderId ?? resolvedWorkOrderId,
            });
        });

        totalPages = response.pagination.totalPages;
        currentPage += 1;
    }

    currentPage = 1;
    totalPages = 1;

    while (currentPage <= totalPages)
    {
        const response = await searchRepairRequestItems(repairRequestId, {
            ...buildLookupPayload("repairRequestItem", {
                limit: REPAIR_REQUEST_ITEMS_PAGE_SIZE,
                page: currentPage,
                searchTerm: "",
                search: [
                    {
                        condition: SEARCH_OPERATOR.EQUAL,
                        name: MANAGER_ITEM_SEARCH_FIELD,
                        value: String(currentUserDepartmentId),
                    },
                ],
            }),
        });

        lineItems.push(...response.data.map((item) =>
        {
            const workOrderState = workOrderByRepairRequestItemId.get(item.id);

            return {
            description: item.description,
            id: item.id,
            productLabel: formatProductLabel(item),
            quantity: item.quantity,
            repairStatus: formatRepairStatusLabel(item),
            repairStatusCode: item.repairStatusCode,
            repairStatusId: item.repairStatusId,
            repairStatusName: item.repairStatusName,
            isWorkOrderDone: workOrderState?.isWorkOrderDone ?? false,
            workOrderId: workOrderState?.workOrderId ?? null,
        };
        }));

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
