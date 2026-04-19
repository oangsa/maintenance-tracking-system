import React from "react";
import { useParams } from "react-router";
import LineItemsEditor from "~/components/Common/LineItemsEditor";
import type { IRepairRequest } from "~/api/types";
import type { IDetailSection } from "~/components/Common/DetailSections";
import Loading from "~/components/Common/Loading";
import Detail from "~/components/Maintain/Detail";
import ErrorCard from "~/components/Maintain/ErrorCard";
import {
    createRepairRequestDetailLineItemColumns,
    type IRepairRequestDetailLineItem,
} from "../RepairRequests/detailLineItemColumns";
import { useUserContext } from "~/providers/UserProvider";
import { getRepairRequestById } from "~/services/repairRequests.service";
import {
    formatDateTime,
    formatRequesterLabel,
    formatTitleCase,
} from "~/lib/formatters";
import {
    formatProductLabel,
    formatRepairStatusLabel,
} from "~/lib/repairRequestUtils";

export default function RepairRequestDetailPage()
{
    const params = useParams();
    const { currentUser, isLoadingUser, userError } = useUserContext();

    if (isLoadingUser && currentUser === null)
    {
        return <Loading message="Loading your access profile..." />;
    }

    if (currentUser === null)
    {
        return (
            <ErrorCard
                backHref="/repair-requests"
                backLabel="Back to Repair Requests"
                message={userError || "Unable to load your user profile."}
            />
        );
    }

    return (
        <Detail<IRepairRequest>
            backHref="/repair-requests"
            backLabel="Back to Repair Requests"
            buildSections={(repairRequest): IDetailSection[] => [
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
            ]}
            content={(repairRequest) =>
            {
                const lineItems: IRepairRequestDetailLineItem[] = repairRequest.repairRequestItems.map((item) => ({
                    description: item.description,
                    id: item.id,
                    productLabel: formatProductLabel(item),
                    quantity: item.quantity,
                    repairStatus: formatRepairStatusLabel(item),
                }));
                const lineItemColumns = createRepairRequestDetailLineItemColumns();

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
            }}
            description="Review your submitted repair request and its line items."
            id={params.id}
            invalidIdMessage="The requested repair request id is invalid."
            loadData={async (id) =>
            {
                const repairRequest = await getRepairRequestById(id);

                if (repairRequest.requesterId !== currentUser.id)
                {
                    throw new Error("You can only view your own repair requests.");
                }

                return repairRequest;
            }}
            loadErrorMessage="Unable to load the selected repair request."
            loadingMessage="Loading repair request..."
            notFoundMessage="Repair request not found."
            title="Repair Request Details"
        />
    );
}
