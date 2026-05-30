import React from "react";
import type { IWorkTaskAssignment } from "~/api/types/types";
import type { IFetchParams, IFetchResult } from "~/components/Common/ListPickerModal";
import { SEARCH_OPERATOR } from "~/constants";
import { searchAllRepairRequestItems } from "~/services/repairRequests.service";
import { searchUsers } from "~/services/users.service";
import { assignWorkTask, getWorkTaskAssignmentHistoryById } from "~/services/workTasks.service";

interface IWorkTaskAssigneeCandidate
{
    [key: string]: unknown;
    id: number;
    name: string | null;
    email: string;
    role: string;
    departmentName: string | null;
}

interface IUseWorkTaskAssignmentProps
{
    repairRequestItemId: number;
    workTaskId: number | null;
}

interface IUseWorkTaskAssignmentResult
{
    assignmentHistory: IWorkTaskAssignment[];
    assigneeDepartmentId: number | null;
    fetchAssigneeOptions: (params: IFetchParams) => Promise<IFetchResult<IWorkTaskAssigneeCandidate>>;
    isLoading: boolean;
    isSubmitting: boolean;
    loadError: string;
    reloadAssignmentData: () => Promise<void>;
    submitError: string;
    submitAssignment: (assigneeId: number) => Promise<void>;
}

async function getRepairRequestItemDepartmentId(repairRequestItemId: number): Promise<number | null>
{
    const response = await searchAllRepairRequestItems({
        deleted: false,
        orderBy: "id asc",
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

    if (response.data.length === 0)
    {
        return null;
    }

    const departmentId = Number(response.data[0]?.departmentId);

    if (!Number.isFinite(departmentId))
    {
        return null;
    }

    return departmentId;
}

export default function useWorkTaskAssignment({
    repairRequestItemId,
    workTaskId,
}: IUseWorkTaskAssignmentProps): IUseWorkTaskAssignmentResult
{
    const [assignmentHistory, setAssignmentHistory] = React.useState<IWorkTaskAssignment[]>([]);
    const [assigneeDepartmentId, setAssigneeDepartmentId] = React.useState<number | null>(null);
    const [isLoading, setIsLoading] = React.useState<boolean>(workTaskId !== null);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [loadError, setLoadError] = React.useState("");
    const [submitError, setSubmitError] = React.useState("");

    const loadAssignmentData = React.useCallback(async () =>
    {
        if (workTaskId === null)
        {
            setAssignmentHistory([]);
            setAssigneeDepartmentId(null);
            setLoadError("");
            setSubmitError("");
            setIsLoading(false);

            return;
        }

        setIsLoading(true);
        setLoadError("");
        setSubmitError("");

        try
        {
            const [history, departmentId] = await Promise.all([
                getWorkTaskAssignmentHistoryById(String(workTaskId)),
                getRepairRequestItemDepartmentId(repairRequestItemId),
            ]);

            setAssignmentHistory(history);
            setAssigneeDepartmentId(departmentId);
        }
        catch (error)
        {
            setLoadError((error as Error).message || "Unable to load work task assignment details.");
            setAssignmentHistory([]);
            setAssigneeDepartmentId(null);
        }
        finally
        {
            setIsLoading(false);
        }
    }, [repairRequestItemId, workTaskId]);

    React.useEffect(() =>
    {
        let cancelled = false;

        async function loadInitialData()
        {
            if (cancelled)
            {
                return;
            }

            await loadAssignmentData();
        }

        void loadInitialData();

        return () =>
        {
            cancelled = true;
        };
    }, [loadAssignmentData]);

    const fetchAssigneeOptions = React.useCallback(async (params: IFetchParams): Promise<IFetchResult<IWorkTaskAssigneeCandidate>> =>
    {
        if (assigneeDepartmentId === null)
        {
            return {
                currentPage: 1,
                data: [],
                hasNext: false,
                hasPrevious: false,
                pageItemCount: params.limit,
                total: 0,
                totalPages: 0,
            };
        }

        const response = await searchUsers({
            deleted: false,
            orderBy: "name asc",
            pageNumber: params.page,
            pageSize: params.limit,
            search: [
                {
                    condition: SEARCH_OPERATOR.EQUAL,
                    name: "department_id",
                    value: String(assigneeDepartmentId),
                },
                {
                    condition: SEARCH_OPERATOR.NOTEQUAL,
                    name: "role",
                    value: "admin",
                },
            ],
            searchTerm: params.searchTerm
                ? {
                    name: "name,email",
                    value: params.searchTerm,
                }
                : undefined,
        });

        return {
            currentPage: response.pagination.currentPage,
            data: response.data.map((user) => ({
                departmentName: user.departmentName,
                email: user.email,
                id: user.id,
                name: user.name,
                role: user.role,
            })),
            hasNext: response.pagination.hasNext,
            hasPrevious: response.pagination.hasPrevious,
            pageItemCount: response.pagination.pageSize,
            total: response.pagination.totalCount,
            totalPages: response.pagination.totalPages,
        };
    }, [assigneeDepartmentId]);

    const submitAssignment = React.useCallback(async (assigneeId: number) =>
    {
        if (workTaskId === null)
        {
            throw new Error("Work task is not available for assignment.");
        }

        setIsSubmitting(true);
        setSubmitError("");

        try
        {
            await assignWorkTask(String(workTaskId), {
                assigneeId,
            });

            await loadAssignmentData();
        }
        catch (error)
        {
            const message = (error as Error).message || "Unable to assign technician to this task.";

            setSubmitError(message);

            throw new Error(message);
        }
        finally
        {
            setIsSubmitting(false);
        }
    }, [loadAssignmentData, workTaskId]);

    return {
        assignmentHistory,
        assigneeDepartmentId,
        fetchAssigneeOptions,
        isLoading,
        isSubmitting,
        loadError,
        reloadAssignmentData: loadAssignmentData,
        submitAssignment,
        submitError,
    };
}

export type {
    IWorkTaskAssigneeCandidate,
};
