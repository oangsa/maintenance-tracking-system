import React, { useSyncExternalStore } from "react";
import { Link, useParams } from "react-router";
import LineItemsEditor from "~/components/Common/LineItemsEditor";
import Loading from "~/components/Common/Loading";
import { buttonVariants } from "~/components/ui/button";
import type { IRepairRequest } from "~/api/types";
import { cn } from "~/lib/utils";
import {
    createRepairRequestDetailLineItemColumns,
    type IRepairRequestDetailLineItem,
} from "../RepairRequests/detailLineItemColumns";
import DetailSections, {
    type IDetailSection,
} from "~/components/Common/DetailSections";
import {
    ensureCurrentUser,
    getCurrentUser,
    subscribeCurrentUser,
} from "~/services/auth.service";
import { getRepairRequestById } from "~/services/repairRequests.service";
import {
    formatDateTime,
    formatProductLabel,
    formatRepairStatusLabel,
    formatRequesterLabel,
    formatTitleCase,
} from "./helpers";

export default function RepairRequestDetailPage()
{
    const params = useParams();
    const currentUser = useSyncExternalStore(subscribeCurrentUser, getCurrentUser, getCurrentUser);

    const [repairRequest, setRepairRequest] = React.useState<IRepairRequest | null>(null);
    const [loading, setLoading] = React.useState(true);
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

    React.useEffect(() =>
    {
        const parsedId = Number(params.id);

        if (!Number.isFinite(parsedId))
        {
            setLoading(false);
            setPageError("The requested repair request id is invalid.");
            return;
        }

        async function loadRepairRequest()
        {
            try
            {
                const repairRequestResponse = await getRepairRequestById(parsedId);

                if (currentUser !== null && repairRequestResponse.requesterId !== currentUser.id)
                {
                    setPageError("You can only view your own repair requests.");
                    setRepairRequest(null);
                    return;
                }

                setRepairRequest(repairRequestResponse);
            }
            catch (error)
            {
                setPageError((error as Error).message || "Unable to load the selected repair request.");
            }
            finally
            {
                setLoading(false);
            }
        }

        void loadRepairRequest();
    }, [currentUser, params.id]);

    if (loading)
    {
        return <Loading message="Loading repair request..." />;
    }

    if (!repairRequest)
    {
        return (
            <div className="card">
                <div className="alert alert-error">{pageError || "Repair request not found."}</div>
                <Link className={cn(buttonVariants({ variant: "outline" }), "!text-foreground hover:!text-foreground")} to="/repair-requests">
                    Back to Repair Requests
                </Link>
            </div>
        );
    }

    const detailSections: IDetailSection[] = [
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

    const lineItems: IRepairRequestDetailLineItem[] = repairRequest.repairRequestItems.map((item) => ({
        description: item.description,
        id: item.id,
        productLabel: formatProductLabel(item),
        quantity: item.quantity,
        repairStatus: formatRepairStatusLabel(item),
    }));
    const lineItemColumns = createRepairRequestDetailLineItemColumns();

    return (
        <>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Repair Request Details</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Review your submitted repair request and its line items.
                    </p>
                </div>

                <Link className={cn(buttonVariants({ variant: "outline" }), "!text-foreground hover:!text-foreground")} to="/repair-requests">
                    Back to Repair Requests
                </Link>
            </div>

            {pageError && <div className="alert alert-error">{pageError}</div>}

            <DetailSections sections={detailSections} />

            <div className="mt-6">
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
            </div>
        </>
    );
}
