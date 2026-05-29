import { useParams } from "react-router";
import type { IDetailSection } from "~/components/Common/DetailSections";
import Detail from "~/components/Maintain/Detail";
import { formatDateTime } from "~/lib/formatters";
import { getWorkOrderById } from "~/services/workOrders.service";

export default function EmployeeWorkOrdersDetailPage()
{
    const params = useParams();

    function sectionBuilder(workOrder: any): IDetailSection[]
    {
        return [
            {
                title: "Work Order Information",
                fields: [
                    { label: "Repair Request Item", value: workOrder.repairRequestItemDescription ?? workOrder.repairRequestItem?.description ?? "-" },
                    { label: "Status", value: workOrder.repairRequestItemRepairStatusName ?? "-" },
                    { label: "Order Sequence", value: workOrder.orderSequence ?? "-" },
                    { label: "Scheduled Start", value: workOrder.scheduledStart ? formatDateTime(workOrder.scheduledStart) : "-" },
                    { label: "Scheduled End", value: workOrder.scheduledEnd ? formatDateTime(workOrder.scheduledEnd) : "-" },
                ],
            },
            {
                title: "Work Task Detail",
                fields: [
                    { label: "Task Id", value: workOrder.workTaskId ?? "-" },
                    { label: "Task Description", value: workOrder.workTaskDescription ?? "-" },
                    { label: "Current Assignee", value: workOrder.workTaskAssigneeName ?? "-" },
                    { label: "Assigned By", value: workOrder.workTaskAssignedByName ?? "-" },
                    { label: "Assigned At", value: formatDateTime(workOrder.workTaskAssignmentAssignedAt) },
                    { label: "Started At", value: formatDateTime(workOrder.workTaskStartedAt) },
                    { label: "Ended At", value: formatDateTime(workOrder.workTaskEndedAt) },
                    { label: "Note", value: workOrder.workTaskNote ?? "-" },
                ],
            },
            {
                title: "Common Information",
                fields: [
                    { label: "Created At", value: formatDateTime(workOrder.createdAt) },
                    { label: "Updated At", value: formatDateTime(workOrder.updatedAt) },
                    { label: "Created By", value: workOrder.createdBy ?? "-" },
                    { label: "Updated By", value: workOrder.updatedBy ?? "-" },
                ],
            },

        ];
    }

    return (
        <Detail
            backHref="/work-orders"
            backLabel="Back to Work Orders"
            buildSections={sectionBuilder}
            description="View the details and current status of this work order."
            id={params.id}
            invalidIdMessage="The requested work order id is invalid."
            loadData={getWorkOrderById}
            loadErrorMessage="Unable to load the selected work order."
            loadingMessage="Loading work order details..."
            notFoundMessage="Work order not found."
            title="Work Order Details"
        />
    );
}
