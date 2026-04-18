import React from "react";
import { FiFileText } from "react-icons/fi";
import { Link, useParams } from "react-router";
import LineItemsEditor, { type ILineItemColumn } from "../../../components/Common/LineItemsEditor/index";
import Loading from "~/components/Common/Loading";
import { Button, buttonVariants } from "~/components/ui/button";
import type { IRepairRequest } from "~/api/types";
import { getRepairRequestById } from "~/services/repairRequests.service";
import { cn } from "~/lib/utils";
import {
    formatDateTime,
    formatRepairStatusLabel,
    formatRequesterLabel,
    formatTitleCase,
} from "./helpers";

interface IDetailField
{
    label: string;
    value: string;
}

export default function RepairRequestManagerDetailPage()
{
    const params = useParams();

    const [repairRequest, setRepairRequest] = React.useState<IRepairRequest | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [pageError, setPageError] = React.useState("");

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
    }, [params.id]);

    function handleViewWorkOrder()
    {
        // TODO: Open the related work order flow when the manager work-order module is available.
    }

    function handleAssignWorkOrder(repairRequestItemId: number)
    {
        void repairRequestItemId;

        // TODO: Assign a work order for the selected repair request item when the manager work-order flow is available.
    }

    if (loading)
    {
        return <Loading message="Loading repair request..." />;
    }

    if (!repairRequest)
    {
        return (
            <div className="card">
                <div className="alert alert-error">{pageError || "Repair request not found."}</div>
                <Link className={cn(buttonVariants({ variant: "outline" }), "!text-foreground hover:!text-foreground")} to="/manager/repair-requests">
                    Back to Repair Requests
                </Link>
            </div>
        );
    }

    // TODO: Refactor the request/common field sections to a separate component when the manager repair request create/edit flow is implemented and they can be reused.
    const requestFields: IDetailField[] = [
        { label: "Request No", value: repairRequest.requestNo },
        { label: "Requester", value: formatRequesterLabel(repairRequest.requesterName, repairRequest.requesterEmail) },
        { label: "Requester Email", value: repairRequest.requesterEmail ?? "-" },
        { label: "Priority", value: formatTitleCase(repairRequest.priority) },
        { label: "Current Status", value: repairRequest.currentStatusName ?? repairRequest.currentStatusCode ?? "-" },
        { label: "Requested At", value: formatDateTime(repairRequest.requestedAt) },
    ];

    // The common fields are currently only created/updated info, but more fields can be added here in the future if needed.
    const commonFields: IDetailField[] = [
        { label: "Created At", value: formatDateTime(repairRequest.createdAt) },
        { label: "Updated At", value: formatDateTime(repairRequest.updatedAt) },
        { label: "Created By", value: repairRequest.createdBy ?? "-" },
        { label: "Updated By", value: repairRequest.updatedBy ?? "-" },
    ];


    const lineItems = repairRequest.repairRequestItems.map((item) => ({
        id: item.id,
        code: item.productCode,
        name: item.productName,
        description: item.description,
        quantity: item.quantity,
        status: formatRepairStatusLabel(item),
    }));


    // TODO: Refactor the line item columns to a separate hook when the manager repair request create/edit flow is implemented and they can be reused.
    const lineItemColumns: ILineItemColumn<(typeof lineItems)[number]>[] = [
        {
            cellClassName: "w-[72px] align-top",
            headerClassName: "w-[72px] text-center",
            key: "index",
            label: "#",
            renderCell: (context) => (
                <div className="pt-2 text-center text-xs font-semibold text-muted-foreground">
                    {context.index + 1}
                </div>
            ),
        },
        {
            cellClassName: "min-w-[180px] align-top",
            headerClassName: "min-w-[180px]",
            key: "code",
            label: "Product Code",
            renderCell: (context) => context.renderReadOnlyValue(String(context.item.code ?? "-")),
        },
        {
            cellClassName: "min-w-[220px] align-top",
            headerClassName: "min-w-[220px]",
            key: "name",
            label: "Product Name",
            renderCell: (context) => context.renderReadOnlyValue(String(context.item.name ?? "-")),
        },
        {
            cellClassName: "min-w-[260px] align-top",
            headerClassName: "min-w-[260px]",
            key: "description",
            label: "Description",
            renderCell: (context) => context.renderReadOnlyValue(String(context.item.description ?? "-"), "min-h-20 whitespace-pre-wrap"),
        },
        {
            cellClassName: "w-[120px] align-top",
            headerClassName: "w-[120px] text-right",
            key: "quantity",
            label: "Qty",
            renderCell: (context) => context.renderReadOnlyValue(String(context.item.quantity ?? "-"), "text-right"),
        },
        {
            cellClassName: "w-[160px] align-top",
            headerClassName: "w-[160px]",
            key: "status",
            label: "Repair Status",
            renderCell: (context) => context.renderReadOnlyValue(String(context.item.status ?? "-")),
        },
        {
            cellClassName: "w-[180px] align-top",
            headerClassName: "w-[180px] text-right",
            key: "actions",
            label: "Action",
            renderCell: (context) => (
                <div className="flex justify-end">
                    <Button onClick={() => handleAssignWorkOrder(Number(context.item.id))} type="button" variant="outline">
                        Assign Work Order
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Repair Request Details</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Review the selected repair request and its submitted line items.
                    </p>
                </div>

                <div className="flex gap-2">
                    <Link className={cn(buttonVariants({ variant: "outline" }), "!text-foreground hover:!text-foreground")} to="/manager/repair-requests">
                        Back to Repair Requests
                    </Link>
                    <Button className="gap-1.5" onClick={handleViewWorkOrder} type="button" variant="outline">
                        <FiFileText size={14} />
                        View Work Order
                    </Button>
                </div>
            </div>

            {pageError && <div className="alert alert-error">{pageError}</div>}

            <div className="card">
                <div>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                            Request Information
                        </p>
                        <div className="mt-4 grid gap-5 md:grid-cols-2">
                            {requestFields.map((field) => (
                                <div className="rounded-md border border-[var(--border)] bg-[var(--bg-surface)] p-4" key={field.label}>
                                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                                        {field.label}
                                    </p>
                                    <p className="mt-2 text-sm font-medium text-[var(--text-main)]">
                                        {field.value}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="my-6 h-px bg-[var(--border)]" />

                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                            Common Information
                        </p>
                        <div className="mt-4 grid gap-5 md:grid-cols-2">
                            {commonFields.map((field) => (
                                <div className="rounded-md border border-[var(--border)] bg-[var(--bg-surface)] p-4" key={field.label}>
                                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                                        {field.label}
                                    </p>
                                    <p className="mt-2 text-sm font-medium text-[var(--text-main)]">
                                        {field.value}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-6">
                <LineItemsEditor
                    columns={lineItemColumns}
                    emptyMessage="No repair request items were submitted for this request."
                    itemLabel="line item"
                    onChange={() => undefined}
                    readOnly
                    title="Repair Request Items"
                    value={lineItems}
                />
            </div>
        </>
    );
}
