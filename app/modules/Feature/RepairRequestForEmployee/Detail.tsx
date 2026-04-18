import React, { useSyncExternalStore } from "react";
import { Link, useParams } from "react-router";
import Loading from "~/components/Common/Loading";
import { buttonVariants } from "~/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "~/components/ui/table";
import type { IRepairRequest } from "~/api/types";
import { cn } from "~/lib/utils";
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

interface IDetailField
{
    label: string;
    value: string;
}

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

    const requestFields: IDetailField[] = [
        { label: "Request No", value: repairRequest.requestNo },
        { label: "Requester", value: formatRequesterLabel(repairRequest.requesterName, repairRequest.requesterEmail) },
        { label: "Requester Email", value: repairRequest.requesterEmail ?? "-" },
        { label: "Priority", value: formatTitleCase(repairRequest.priority) },
        { label: "Current Status", value: repairRequest.currentStatusName ?? repairRequest.currentStatusCode ?? "-" },
        { label: "Requested At", value: formatDateTime(repairRequest.requestedAt) },
    ];

    const commonFields: IDetailField[] = [
        { label: "Created At", value: formatDateTime(repairRequest.createdAt) },
        { label: "Updated At", value: formatDateTime(repairRequest.updatedAt) },
        { label: "Created By", value: repairRequest.createdBy ?? "-" },
        { label: "Updated By", value: repairRequest.updatedBy ?? "-" },
    ];

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

            <div className="card mt-6">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                        Repair Request Items
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                        {repairRequest.repairRequestItems.length} submitted line item{repairRequest.repairRequestItems.length === 1 ? "" : "s"}.
                    </p>
                </div>

                <div className="mt-4 overflow-x-auto rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-16">No</TableHead>
                                <TableHead>Product</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-right">Qty</TableHead>
                                <TableHead>Repair Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {repairRequest.repairRequestItems.map((item, index) => (
                                <TableRow key={item.id}>
                                    <TableCell className="align-top font-medium">{index + 1}</TableCell>
                                    <TableCell className="align-top">{formatProductLabel(item)}</TableCell>
                                    <TableCell className="align-top">{item.description?.trim() || "-"}</TableCell>
                                    <TableCell className="align-top text-right">{item.quantity}</TableCell>
                                    <TableCell className="align-top">{formatRepairStatusLabel(item)}</TableCell>
                                </TableRow>
                            ))}
                            {repairRequest.repairRequestItems.length === 0 && (
                                <TableRow>
                                    <TableCell className="py-8 text-center text-muted-foreground" colSpan={5}>
                                        No repair request items were submitted for this request.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </>
    );
}
