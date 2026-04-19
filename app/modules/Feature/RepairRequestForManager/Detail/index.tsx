import React from "react";
import { FiFileText } from "react-icons/fi";
import { useParams } from "react-router";
import LineItemsEditor from "~/components/Common/LineItemsEditor";
import type { IDetailSection } from "~/components/Common/DetailSections";
import Detail from "~/components/Maintain/Detail";
import { Button } from "~/components/ui/button";
import { getRepairRequestById } from "~/services/repairRequests.service";
import { createRepairRequestDetailLineItemColumns, type IRepairRequestDetailLineItem } from "../../RepairRequests/detailLineItemColumns";
import { formatDateTime, formatRequesterLabel, formatTitleCase } from "~/lib/formatters";
import { formatProductLabel, formatRepairStatusLabel } from "~/lib/repairRequestUtils";

function handleAssignWorkOrder(repairRequestItemId: number)
{
    void repairRequestItemId;

    // TODO: Assign a work order for the selected repair request item when the manager work-order flow is available.
}

function DetailContent(repairRequest: Awaited<ReturnType<typeof getRepairRequestById>>)
{
    const lineItems: IRepairRequestDetailLineItem[] = repairRequest.repairRequestItems.map((item) => ({
        description: item.description,
        id: item.id,
        productLabel: formatProductLabel(item),
        quantity: item.quantity,
        repairStatus: formatRepairStatusLabel(item),
    }));

    const lineItemColumns = createRepairRequestDetailLineItemColumns({
        renderAction: (item) => (
            <Button onClick={() => handleAssignWorkOrder(Number(item.id))} type="button" variant="outline">
                Assign Work Order
            </Button>
        ),
    });

    return (
        <LineItemsEditor
            columns={lineItemColumns}
            emptyMessage="No repair request items were submitted for this request."
            itemLabel="line item"
            onChange={() => undefined}
            readOnly
            readOnlyVariant="plain"
            title="Repair Request Items"
            value={lineItems}
        />
    );
}


export default function RepairRequestManagerDetailPage()
{
    const params = useParams();

    function handleViewWorkOrder()
    {
        // TODO: Open the related work order flow when the manager work-order module is available.
    }

    function sectionBuilder(repairRequest: Awaited<ReturnType<typeof getRepairRequestById>>): IDetailSection[]
    {
        return [
            {
                fields: [
                    { label: "Request No", value: repairRequest.requestNo },
                    { label: "Requester", value: formatRequesterLabel(repairRequest.requesterName, repairRequest.requesterEmail) },
                    { label: "Requester Email", value: repairRequest.requesterEmail ?? "-" },
                    { label: "Priority", value: formatTitleCase(repairRequest.priority) },
                    { label: "Current Status", value: repairRequest.currentStatusName ?? repairRequest.currentStatusCode ?? "-" },
                    { label: "Requested At", value: formatDateTime(repairRequest.requestedAt) },
                ],
                title: "Request Information",
            },
            {
                fields: [
                    { label: "Created At", value: formatDateTime(repairRequest.createdAt) },
                    { label: "Updated At", value: formatDateTime(repairRequest.updatedAt) },
                    { label: "Created By", value: repairRequest.createdBy ?? "-" },
                    { label: "Updated By", value: repairRequest.updatedBy ?? "-" },
                ],
                title: "Common Information",
            },
        ];
    }

    return (
        <Detail
            actions={(
                <Button className="gap-1.5" onClick={handleViewWorkOrder} type="button" variant="outline">
                    <FiFileText size={14} />
                    View Work Order
                </Button>
            )}
            backHref="/manager/repair-requests"
            backLabel="Back to Repair Requests"
            buildSections={sectionBuilder}
            content={DetailContent}
            description="Review the selected repair request and its submitted line items."
            id={params.id}
            invalidIdMessage="The requested repair request id is invalid."
            loadData={getRepairRequestById}
            loadErrorMessage="Unable to load the selected repair request."
            loadingMessage="Loading repair request..."
            notFoundMessage="Repair request not found."
            title="Repair Request Details"
        />
    );
}
