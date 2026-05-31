import { SEARCH_OPERATOR } from "~/constants";
import type {
    IRepairRequestItemStatus,
    IRepairStatus,
    IWorkOrder,
} from "~/api/types/types";
import { searchRepairRequestItemStatus } from "./repairRequestItemStatus.service";
import {
    searchAllRepairRequestItems,
    searchRepairRequests,
    updateRepairRequest,
    updateRepairRequestItemStatus,
} from "./repairRequests.service";
import { searchRepairStatuses } from "./repairStatuses.service";
import { getWorkOrderById } from "./workOrders.service";
import { finishWorkTask, startWorkTask } from "./workTasks.service";

const START_STATUS_CODE_CANDIDATES = ["INPROGRESS", "IN_PROGRESS", "WIP", "WORKING", "PROCESSING"];
const FINISH_STATUS_CODE_CANDIDATES = ["FINISHED", "DONE", "COMPLETED", "COMPLETE", "RESOLVED", "CLOSED"];
const MAX_PAGE_SCAN = 20;
const DEFAULT_PAGE_SIZE = 200;

export interface IStartWorkOrderPartFlowInput
{
    workOrder: IWorkOrder;
    startedAt: string;
}

export interface IFinishWorkOrderPartFlowInput
{
    workOrder: IWorkOrder;
    endedAt: string;
}

export interface IWorkOrderPartFlowResult
{
    warningMessage: string | null;
    workOrder: IWorkOrder;
}

interface IStatusLike
{
    code: string;
    isFinal: boolean;
    name: string;
    orderSequence: number;
}

function normalizeStatusToken(value: string | null | undefined): string
{
    return String(value ?? "")
        .trim()
        .toUpperCase()
        .replace(/[\s-]/g, "_");
}

function matchesAnyStatusCode(statusCode: string | null | undefined, candidates: string[]): boolean
{
    const normalizedStatusCode = normalizeStatusToken(statusCode);

    return candidates.some((candidate) => normalizeStatusToken(candidate) === normalizedStatusCode);
}

function selectStartStatus<TStatus extends IStatusLike>(statuses: TStatus[]): TStatus | null
{
    const codeMatch = statuses.find((status) => matchesAnyStatusCode(status.code, START_STATUS_CODE_CANDIDATES));

    if (codeMatch)
    {
        return codeMatch;
    }

    const nameMatch = statuses.find((status) => !status.isFinal && normalizeStatusToken(status.name).includes("PROGRESS"));

    if (nameMatch)
    {
        return nameMatch;
    }

    const nonFinalStatuses = statuses
        .filter((status) => !status.isFinal)
        .sort((leftStatus, rightStatus) => leftStatus.orderSequence - rightStatus.orderSequence);

    return nonFinalStatuses[0] ?? null;
}

function selectFinishStatus<TStatus extends IStatusLike>(statuses: TStatus[]): TStatus | null
{
    const codeMatch = statuses.find((status) => matchesAnyStatusCode(status.code, FINISH_STATUS_CODE_CANDIDATES));

    if (codeMatch)
    {
        return codeMatch;
    }

    const nameMatch = statuses.find((status) =>
    {
        const normalizedName = normalizeStatusToken(status.name);

        return normalizedName.includes("FINISH")
            || normalizedName.includes("COMPLETE")
            || normalizedName.includes("DONE")
            || normalizedName.includes("RESOLVE")
            || normalizedName.includes("CLOSE");
    });

    if (nameMatch)
    {
        return nameMatch;
    }

    const finalStatuses = statuses
        .filter((status) => status.isFinal)
        .sort((leftStatus, rightStatus) => rightStatus.orderSequence - leftStatus.orderSequence);

    return finalStatuses[0] ?? null;
}

async function loadAllRepairStatuses(): Promise<IRepairStatus[]>
{
    const allStatuses: IRepairStatus[] = [];
    let pageNumber = 1;

    while (pageNumber <= MAX_PAGE_SCAN)
    {
        const response = await searchRepairStatuses({
            deleted: false,
            orderBy: "order_sequence asc",
            pageNumber,
            pageSize: DEFAULT_PAGE_SIZE,
        });

        allStatuses.push(...response.data);

        if (!response.pagination.hasNext)
        {
            break;
        }

        pageNumber += 1;
    }

    return allStatuses;
}

async function loadAllRepairRequestItemStatuses(): Promise<IRepairRequestItemStatus[]>
{
    const allStatuses: IRepairRequestItemStatus[] = [];
    let pageNumber = 1;

    while (pageNumber <= MAX_PAGE_SCAN)
    {
        const response = await searchRepairRequestItemStatus({
            deleted: false,
            orderBy: "order_sequence asc",
            pageNumber,
            pageSize: DEFAULT_PAGE_SIZE,
        });

        allStatuses.push(...response.data);

        if (!response.pagination.hasNext)
        {
            break;
        }

        pageNumber += 1;
    }

    return allStatuses;
}

function resolveRepairRequestItemId(workOrder: IWorkOrder): number
{
    const parsedRepairRequestItemId = Number(workOrder.repairRequestItemId);

    if (!Number.isFinite(parsedRepairRequestItemId) || parsedRepairRequestItemId <= 0)
    {
        throw new Error("Unable to continue because repair request item id is invalid.");
    }

    return parsedRepairRequestItemId;
}

function resolveWorkTaskId(workOrder: IWorkOrder): number
{
    const parsedWorkTaskId = Number(workOrder.workTaskId);

    if (!Number.isFinite(parsedWorkTaskId) || parsedWorkTaskId <= 0)
    {
        throw new Error("Unable to continue because work task id is invalid.");
    }

    return parsedWorkTaskId;
}

async function resolveRepairRequestId(workOrder: IWorkOrder): Promise<number>
{
    const rawWorkOrder = workOrder as unknown as Record<string, unknown>;
    const directCandidates: unknown[] = [
        rawWorkOrder.repairRequestId,
        rawWorkOrder.repair_request_id,
    ];

    for (const candidate of directCandidates)
    {
        const parsedId = Number(candidate);

        if (Number.isFinite(parsedId) && parsedId > 0)
        {
            return parsedId;
        }
    }

    const repairRequestItemId = resolveRepairRequestItemId(workOrder);
    const itemResponse = await searchAllRepairRequestItems({
        deleted: false,
        pageNumber: 1,
        pageSize: 1,
        search: [
            {
                condition: SEARCH_OPERATOR.EQUAL,
                name: "id",
                value: String(repairRequestItemId),
            },
        ],
    });

    const itemBasedId = Number(itemResponse.data[0]?.repairRequestId);

    if (Number.isFinite(itemBasedId) && itemBasedId > 0)
    {
        return itemBasedId;
    }

    const requestNo = String(workOrder.repairRequestRequestNo ?? "").trim();

    if (requestNo === "")
    {
        throw new Error("Unable to resolve linked repair request id from work order.");
    }

    const requestResponse = await searchRepairRequests({
        deleted: false,
        orderBy: "id desc",
        pageNumber: 1,
        pageSize: 1,
        search: [
            {
                condition: SEARCH_OPERATOR.EQUAL,
                name: "request_no",
                value: requestNo,
            },
        ],
    });

    const requestId = Number(requestResponse.data[0]?.id);

    if (!Number.isFinite(requestId) || requestId <= 0)
    {
        throw new Error("Unable to resolve linked repair request id from request number.");
    }

    return requestId;
}

export async function startWorkOrderPartFlow(input: IStartWorkOrderPartFlowInput): Promise<IWorkOrderPartFlowResult>
{
    const { startedAt, workOrder } = input;
    const workTaskId = resolveWorkTaskId(workOrder);
    const repairRequestItemId = resolveRepairRequestItemId(workOrder);

    const [repairStatuses, itemStatuses] = await Promise.all([
        loadAllRepairStatuses(),
        loadAllRepairRequestItemStatuses(),
    ]);
    const startRepairStatus = selectStartStatus(repairStatuses);
    const startItemStatus = selectStartStatus(itemStatuses);

    if (!startRepairStatus)
    {
        throw new Error("Unable to resolve an in-progress repair status.");
    }

    if (!startItemStatus)
    {
        throw new Error("Unable to resolve an in-progress repair request item status.");
    }

    await startWorkTask(workTaskId, startedAt);
    await updateRepairRequestItemStatus(repairRequestItemId, {
        note: "Work task started",
        repairStatusId: startItemStatus.id,
    });

    let warningMessage: string | null = null;

    try
    {
        const repairRequestId = await resolveRepairRequestId(workOrder);
        await updateRepairRequest(repairRequestId, {
            currentStatusId: startRepairStatus.id,
        });
    }
    catch (error)
    {
        warningMessage = `Work started successfully, but repair request header status was not updated. ${(error as Error).message || ""}`.trim();
    }

    return {
        warningMessage,
        workOrder: await getWorkOrderById(workOrder.id),
    };
}

export async function finishWorkOrderPartFlow(input: IFinishWorkOrderPartFlowInput): Promise<IWorkOrderPartFlowResult>
{
    const { endedAt, workOrder } = input;
    const workTaskId = resolveWorkTaskId(workOrder);
    const repairRequestItemId = resolveRepairRequestItemId(workOrder);
    const itemStatuses = await loadAllRepairRequestItemStatuses();
    const finishItemStatus = selectFinishStatus(itemStatuses);

    if (!finishItemStatus)
    {
        throw new Error("Unable to resolve a finished repair request item status.");
    }

    await finishWorkTask(workTaskId, endedAt);
    await updateRepairRequestItemStatus(repairRequestItemId, {
        note: "Work task finished",
        repairStatusId: finishItemStatus.id,
    });

    return {
        warningMessage: null,
        workOrder: await getWorkOrderById(workOrder.id),
    };
}
