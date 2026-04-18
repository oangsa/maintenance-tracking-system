import React, { useSyncExternalStore } from "react";
import { Link, useNavigate } from "react-router";
import Loading from "~/components/Common/Loading";
import { buttonVariants } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import type { IRepairStatus, IUser } from "~/api/types";
import {
    ensureCurrentUser,
    getCurrentUser,
    subscribeCurrentUser,
} from "~/services/auth.service";
import { createRepairRequest } from "~/services/repairRequests.service";
import { searchRepairStatuses } from "~/services/repairStatuses.service";
import RepairRequestForm from "./RepairRequestForm";
import {
    buildCreatePayload,
    createEmptyRepairRequestFormValues,
} from "./helpers";
import type { IRepairRequestFormValues } from "./helpers";

function resolveInitialStatus(statuses: IRepairStatus[]): IRepairStatus | null
{
    if (statuses.length === 0)
    {
        return null;
    }

    return statuses.find((status) => !status.isFinal) ?? statuses[0];
}

export default function ManageRepairRequestPage()
{
    const navigate = useNavigate();
    const currentUser = useSyncExternalStore(subscribeCurrentUser, getCurrentUser, getCurrentUser);

    const [statusId, setStatusId] = React.useState<number | null>(null);
    const [loadingUser, setLoadingUser] = React.useState(currentUser === null);
    const [loadingStatus, setLoadingStatus] = React.useState(true);
    const [submitting, setSubmitting] = React.useState(false);
    const [pageError, setPageError] = React.useState("");

    React.useEffect(() =>
    {
        let cancelled = false;

        if (currentUser !== null)
        {
            setLoadingUser(false);
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
            catch (error)
            {
                if (!cancelled)
                {
                    setPageError((error as Error).message || "Unable to load your user profile.");
                }
            }
            finally
            {
                if (!cancelled)
                {
                    setLoadingUser(false);
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
        let cancelled = false;

        async function loadInitialStatus()
        {
            try
            {
                const response = await searchRepairStatuses({
                    deleted: false,
                    orderBy: "order_sequence asc",
                    pageNumber: 1,
                    pageSize: 100,
                });
                const initialStatus = resolveInitialStatus(response.data);

                if (!initialStatus)
                {
                    throw new Error("No repair request status is available for new requests.");
                }

                if (!cancelled)
                {
                    setStatusId(initialStatus.id);
                }
            }
            catch (error)
            {
                if (!cancelled)
                {
                    setPageError((error as Error).message || "Unable to load the initial repair request status.");
                }
            }
            finally
            {
                if (!cancelled)
                {
                    setLoadingStatus(false);
                }
            }
        }

        void loadInitialStatus();

        return () =>
        {
            cancelled = true;
        };
    }, []);

    async function handleSubmit(values: IRepairRequestFormValues)
    {
        if (!currentUser)
        {
            setPageError("Unable to load your user profile.");
            return;
        }

        if (statusId === null)
        {
            setPageError("Unable to resolve the initial repair request status.");
            return;
        }

        setSubmitting(true);
        setPageError("");

        try
        {
            const createdRepairRequest = await createRepairRequest(buildCreatePayload(values, statusId, currentUser));

            navigate(`/repair-requests/${createdRepairRequest.id}`, { replace: true });
        }
        catch (error)
        {
            setPageError((error as Error).message || "Unable to create the repair request.");
        }
        finally
        {
            setSubmitting(false);
        }
    }

    if (loadingUser || loadingStatus)
    {
        return <Loading message="Preparing repair request form..." />;
    }

    if (!currentUser)
    {
        return (
            <div className="card">
                <div className="alert alert-error">{pageError || "Unable to load your user profile."}</div>
                <Link className={cn(buttonVariants({ variant: "outline" }), "!text-foreground hover:!text-foreground")} to="/repair-requests">
                    Back to Repair Requests
                </Link>
            </div>
        );
    }

    if (currentUser.departmentId === null)
    {
        return (
            <div className="card">
                <div className="alert alert-error">
                    Your user account is not assigned to a department, so a repair request cannot be created.
                </div>
                <Link className={cn(buttonVariants({ variant: "outline" }), "!text-foreground hover:!text-foreground")} to="/repair-requests">
                    Back to Repair Requests
                </Link>
            </div>
        );
    }

    return (
        <>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Create Repair Request</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Submit a repair request for your department and attach the required line items.
                    </p>
                </div>

                <Link className={cn(buttonVariants({ variant: "outline" }), "!text-foreground hover:!text-foreground")} to="/repair-requests">
                    Back to Repair Requests
                </Link>
            </div>

            <RepairRequestForm
                currentUser={currentUser as IUser}
                error={pageError}
                initialValues={createEmptyRepairRequestFormValues()}
                onCancel={() => navigate("/repair-requests")}
                onSubmit={handleSubmit}
                submitting={submitting}
            />
        </>
    );
}
