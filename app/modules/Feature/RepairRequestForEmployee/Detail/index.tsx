import React, { useSyncExternalStore } from "react";
import { useParams } from "react-router";
import LineItemsEditor from "~/components/Common/LineItemsEditor";
import type { IRepairRequest } from "~/api/types";
import type { IDetailSection } from "~/components/Common/DetailSections";
import Detail from "~/components/Maintain/Detail";
import ErrorCard from "~/components/Maintain/ErrorCard";
import { createRepairRequestDetailLineItemColumns, type IRepairRequestDetailLineItem } from "../../RepairRequests/detailLineItemColumns";
import { ensureCurrentUser, getCurrentUser, subscribeCurrentUser } from "~/services/auth.service";
import { getRepairRequestById } from "~/services/repairRequests.service";
import { formatDateTime, formatRequesterLabel, formatTitleCase } from "~/lib/formatters";
import { formatProductLabel, formatRepairStatusLabel } from "~/lib/repairRequestUtils";


function DetailContent(repairRequest: IRepairRequest)
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
}

export default function RepairRequestDetailPage()
{
    const params = useParams();
    const currentUser = useSyncExternalStore(subscribeCurrentUser, getCurrentUser, getCurrentUser);

    const [pageError, setPageError] = React.useState("");

    React.useEffect(() =>
    {
        let cancelled = false;

        if (currentUser !== null)
        {
            return () =>
            {
                cancelled = true;
            };
        }

        async function loadCurrentUser()
        {
            try
            {
                await ensureCurrentUser();
            }
            catch
            {
                if (!cancelled)
                {
                    setPageError("Unable to load your user profile.");
                }
            }
        }

        void loadCurrentUser();

        return () =>
        {
            cancelled = true;
        };
    }, [currentUser]);

    if (currentUser === null)
    {
        return (
            <ErrorCard
                backHref="/repair-requests"
                backLabel="Back to Repair Requests"
                message={pageError || "Unable to load your user profile."}
            />
        );
    }

    const resolvedCurrentUser = currentUser;

    function sectionBuilder(repairRequest: IRepairRequest): IDetailSection[]
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

    async function loadData(id: number)
    {
        const repairRequest = await getRepairRequestById(id);

        if (repairRequest.requesterId !== resolvedCurrentUser.id)
        {
            throw new Error("You can only view your own repair requests.");
        }

        return repairRequest;
    }

    return (
        <Detail<IRepairRequest>
            backHref="/repair-requests"
            backLabel="Back to Repair Requests"
            buildSections={sectionBuilder}
            content={DetailContent}
            description="Review your submitted repair request and its line items."
            id={params.id}
            invalidIdMessage="The requested repair request id is invalid."
            loadData={loadData}
            loadErrorMessage="Unable to load the selected repair request."
            loadingMessage="Loading repair request..."
            notFoundMessage="Repair request not found."
            title="Repair Request Details"
        />
    );
}
