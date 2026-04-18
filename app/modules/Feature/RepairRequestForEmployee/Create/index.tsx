import React, { useSyncExternalStore } from "react";
import { useNavigate } from "react-router";
import Loading from "~/components/Common/Loading";
import Create from "~/components/Maintain/Create";
import ErrorCard from "~/components/Maintain/ErrorCard";
import type { IRepairStatus, IUser } from "~/api/types";
import {
    ensureCurrentUser,
    getCurrentUser,
    subscribeCurrentUser,
} from "~/services/auth.service";
import { createRepairRequest } from "~/services/repairRequests.service";
import { searchRepairStatuses } from "~/services/repairStatuses.service";
import RepairRequestForm from "../form";
import {
    buildCreatePayload,
    createEmptyRepairRequestFormValues,
} from "../hooks/helpers";
import type { IRepairRequestFormValues } from "../hooks/helpers";

function resolveInitialStatus(statuses: IRepairStatus[]): IRepairStatus | null
{
    if (statuses.length === 0)
    {
        return null;
    }

    return statuses.find((status) => !status.isFinal) ?? statuses[0];
}

export default function CreateRepairRequestPage()
{
    const navigate = useNavigate();
    const currentUser = useSyncExternalStore(subscribeCurrentUser, getCurrentUser, getCurrentUser);

    const [statusId, setStatusId] = React.useState<number | null>(null);
    const [loadingUser, setLoadingUser] = React.useState(currentUser === null);
    const [loadingStatus, setLoadingStatus] = React.useState(true);
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

    if (loadingUser || loadingStatus)
    {
        return <Loading message="Preparing repair request form..." />;
    }

    if (!currentUser)
    {
        return (
            <ErrorCard
                backHref="/repair-requests"
                backLabel="Back to Repair Requests"
                message={pageError || "Unable to load your user profile."}
            />
        );
    }

    if (currentUser.departmentId === null)
    {
        return (
            <ErrorCard
                backHref="/repair-requests"
                backLabel="Back to Repair Requests"
                message="Your user account is not assigned to a department, so a repair request cannot be created."
            />
        );
    }

    if (statusId === null)
    {
        return (
            <ErrorCard
                backHref="/repair-requests"
                backLabel="Back to Repair Requests"
                message={pageError || "Unable to resolve the initial repair request status."}
            />
        );
    }

    async function handleSubmit(values: IRepairRequestFormValues)
    {
        const createdRepairRequest = await createRepairRequest(buildCreatePayload(values, statusId, currentUser));

        navigate(`/repair-requests/${createdRepairRequest.id}`, { replace: true });
    }

    async function handleCancel()
    {
        navigate("/repair-requests");
    }

    return (
        <Create
            backHref="/repair-requests"
            backLabel="Back to Repair Requests"
            description="Submit a repair request for your department and attach the required line items."
            Form={RepairRequestForm}
            formProps={{ currentUser: currentUser as IUser }}
            initialValues={createEmptyRepairRequestFormValues()}
            onCancel={handleCancel}
            onSubmit={handleSubmit}
            submitErrorMessage="Unable to create the repair request."
            title="Create Repair Request"
        />
    );
}
