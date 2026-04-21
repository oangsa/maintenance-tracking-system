import { useParams } from "react-router";
import LineItemsEditor from "~/components/Common/LineItemsEditor";
import type { IRepairRequest } from "~/api/types/types";
import type { IDetailSection } from "~/components/Common/DetailSections";
import Loading from "~/components/Common/Loading";
import Detail from "~/components/Maintain/Detail";
import ErrorCard from "~/components/Maintain/ErrorCard";
import { createRepairRequestDetailLineItemColumns } from "../../../RepairRequests/detailLineItemColumns";
import { useUserContext } from "~/providers/UserProvider";
import { getRepairRequestById } from "~/services/repairRequests.service";
import { formatDateTime, formatRequesterLabel, formatTitleCase } from "~/lib/formatters";
import useLineItem from "../hooks/useLineItem";

interface IEmployeeRepairRequestItemsSectionProps
{
    repairRequestId: number;
}

function EmployeeRepairRequestItemsSection({ repairRequestId }: IEmployeeRepairRequestItemsSectionProps)
{
    const {
        emptyMessage,
        itemsError,
        lineItems,
        loadingItems,
    } = useLineItem({ repairRequestId });

    const lineItemColumns = createRepairRequestDetailLineItemColumns();

    if (loadingItems)
    {
        return <Loading message="Loading repair request items..." />;
    }

    if (itemsError)
    {
        return (
            <div className="card">
                <div className="alert alert-error">{itemsError}</div>
            </div>
        );
    }

    return (
        <LineItemsEditor
            columns={lineItemColumns}
            emptyMessage={emptyMessage}
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

    const resolvedCurrentUser = currentUser;

    function DetailContent(repairRequest: IRepairRequest)
    {
        return <EmployeeRepairRequestItemsSection repairRequestId={repairRequest.id} />;
    }

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
