import { useParams } from "react-router";
import type { IWorkOrder } from "~/api/types/types";
import type { IDetailSection } from "~/components/Common/DetailSections";
import Loading from "~/components/Common/Loading";
import Detail from "~/components/Maintain/Detail";
import ErrorCard from "~/components/Maintain/ErrorCard";
import { formatDateTime } from "~/lib/formatters";
import { useUserContext } from "~/providers/UserProvider";
import { getWorkOrderById } from "~/services/workOrders.service";
import WorkOrderWorkbench from "./WorkOrderWorkbench";

export default function EmployeeWorkOrdersDetailPage()
{
    const params = useParams();
    const { currentUser, isLoadingUser, userError } = useUserContext();

    if (isLoadingUser && currentUser === null)
    {
        return <Loading message="Loading your access profile..." />;
    }

    if (!currentUser)
    {
        return (
            <ErrorCard
                backHref="/work-orders"
                backLabel="Back to Work Orders"
                message={userError || "Unable to load your user profile."}
            />
        );
    }

    const resolvedCurrentUser = currentUser;

    function sectionBuilder(workOrder: IWorkOrder): IDetailSection[]
    {
        return [
            {
                fields: [
                    { label: "Request No", value: workOrder.repairRequestRequestNo ?? "-" },
                    { label: "Repair Request Item", value: workOrder.repairRequestItemProductName ?? "-" },
                    { label: "Current Status", value: workOrder.repairRequestItemRepairStatusName ?? "-" },
                    { label: "Order Sequence", value: workOrder.orderSequence ?? "-" },
                    { label: "Scheduled Start", value: workOrder.scheduledStart ? formatDateTime(workOrder.scheduledStart) : "-" },
                    { label: "Scheduled End", value: workOrder.scheduledEnd ? formatDateTime(workOrder.scheduledEnd) : "-" },
                ],
                title: "Work Order Information",
            },
            {
                fields: [
                    { label: "Task Description", value: workOrder.workTaskDescription ?? "-" },
                    { label: "Task Note", value: workOrder.workTaskNote ?? "-" },
                    { label: "Current Assignee", value: workOrder.workTaskAssigneeName ?? "-" },
                    { label: "Assigned By", value: workOrder.workTaskAssignedByName ?? "-" },
                    { label: "Assigned At", value: formatDateTime(workOrder.workTaskAssignmentAssignedAt) },
                    { label: "Assignment Active", value: workOrder.workTaskAssignmentUnassignedAt ? "No" : "Yes" },
                ],
                title: "Assignment Information",
            },
            {
                fields: [
                    { label: "Created At", value: formatDateTime(workOrder.createdAt) },
                    { label: "Updated At", value: formatDateTime(workOrder.updatedAt) },
                    { label: "Created By", value: workOrder.createdBy ?? "-" },
                    { label: "Updated By", value: workOrder.updatedBy ?? "-" },
                ],
                title: "Common Information",
            },
        ];
    }

    function renderDetailContent(workOrder: IWorkOrder)
    {
        return (
            <WorkOrderWorkbench
                currentUserId={resolvedCurrentUser.id}
                workOrder={workOrder}
            />
        );
    }

    async function loadData(id: number)
    {
        const workOrder = await getWorkOrderById(id);
        const parsedAssigneeId = Number(workOrder.workTaskAssigneeId);

        if (Number.isFinite(parsedAssigneeId) && parsedAssigneeId > 0 && parsedAssigneeId !== resolvedCurrentUser.id)
        {
            throw new Error("You can only view work orders assigned to you.");
        }

        return workOrder;
    }

    return (
        <Detail<IWorkOrder>
            backHref="/work-orders"
            backLabel="Back to Work Orders"
            buildSections={sectionBuilder}
            content={renderDetailContent}
            description="Employee workbench for assigned work order execution and part usage."
            id={params.id}
            invalidIdMessage="The requested work order id is invalid."
            loadData={loadData}
            loadErrorMessage="Unable to load the selected work order."
            loadingMessage="Loading work order details..."
            notFoundMessage="Work order not found."
            title="Work Order Workbench"
        />
    );
}
