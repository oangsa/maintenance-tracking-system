import React from "react";
import { FiFileText } from "react-icons/fi";
import { useParams, useNavigate } from "react-router";
import LineItemsEditor from "~/components/Common/LineItemsEditor";
import type { IDetailSection } from "~/components/Common/DetailSections";
import Loading from "~/components/Common/Loading";
import Detail from "~/components/Maintain/Detail";
import ErrorCard from "~/components/Maintain/ErrorCard";
import { useUserContext } from "~/providers/UserProvider";
import { Button } from "~/components/ui/button";
import { getRepairRequestById } from "~/services/repairRequests.service";
import { createRepairRequestDetailLineItemColumns } from "../../../RepairRequests/detailLineItemColumns";
import { formatDateTime, formatRequesterLabel, formatTitleCase } from "~/lib/formatters";
import useLineItem from "../hooks/useLineItem";


interface IManagerRepairRequestItemsSectionProps
{
    currentUserDepartmentId: number | null;
    repairRequestId: number;
}

function ManagerRepairRequestItemsSection({
    currentUserDepartmentId,
    repairRequestId,
}: IManagerRepairRequestItemsSectionProps)
{
    const navigate = useNavigate();

    const {
        emptyMessage,
        itemsError,
        lineItems,
        loadingItems,
    } = useLineItem({
        currentUserDepartmentId,
        repairRequestId,
    });

    const lineItemColumns = React.useMemo(() => createRepairRequestDetailLineItemColumns({
        renderAction: (item: any) => {
            const statusStr = String(
                item?.repairStatus || 
                item?.repairStatusCode || 
                item?.repairStatusName || 
                ""
            ).toUpperCase();
            
            if (statusStr.includes("PENDING") || statusStr.includes("REQUESTED")) {
                return (
                    <Button 
                        onClick={() => {
                            const productName = item?.productLabel || `${item?.productCode || ""} - ${item?.productName || ""}`;
                            const descText = encodeURIComponent(productName);
                            
                            navigate(`/manager/work-orders/new?repairRequestItemId=${item.id}&desc=${descText}`);
                        }} 
                        type="button" 
                        variant="outline"
                    >
                        Assign Work Order
                    </Button>
                );
            }
            return null;
        }
    }), [navigate]);
        

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

export default function RepairRequestManagerDetailPage()
{
    const params = useParams();
    const navigate = useNavigate();
    const { currentUser, isLoadingUser, userError } = useUserContext();

    if (isLoadingUser && currentUser === null)
    {
        return <Loading message="Loading your access profile..." />;
    }

    if (!currentUser)
    {
        return (
            <ErrorCard
                backHref="/manager/repair-requests"
                backLabel="Back to Repair Requests"
                message={userError || "Unable to load your user profile."}
            />
        );
    }

    const currentUserDepartmentId = currentUser.departmentId;

    function DetailContent(repairRequest: Awaited<ReturnType<typeof getRepairRequestById>>)
    {
        return (
            <ManagerRepairRequestItemsSection
                currentUserDepartmentId={currentUserDepartmentId}
                repairRequestId={repairRequest.id}
            />
        );
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

    function ActionButtons(repairRequest: Awaited<ReturnType<typeof getRepairRequestById>>)
    {
        function handleViewWorkOrder()
        {
            const targetWorkOrderId = (repairRequest as any).workOrderId || (repairRequest as any).workOrder?.id;

            if (targetWorkOrderId) {
                navigate(`/manager/work-orders/${targetWorkOrderId}`);
            } else {
                navigate(`/manager/work-orders?searchTerm=${repairRequest.requestNo}`);
            }
        }

        return (
            <Button className="gap-1.5" onClick={handleViewWorkOrder} type="button" variant="outline">
                <FiFileText size={14} />
                View Work Order
            </Button>
        );
    }

    return (
        <Detail
            actions={ActionButtons}
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
