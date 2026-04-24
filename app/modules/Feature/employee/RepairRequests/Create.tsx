import React from "react";
import { useNavigate } from "react-router";
import Loading from "~/components/Common/Loading";
import Create from "~/components/Maintain/Create";
import ErrorCard from "~/components/Maintain/ErrorCard";
import type { IRepairStatus } from "~/api/types/types";
import { buildLookupPayload } from "~/constants";
import { useUserContext } from "~/providers/UserProvider";
import { createRepairRequest } from "~/services/repairRequests.service";
import { searchRepairStatuses } from "~/services/repairStatuses.service";
import RepairRequestForm from "./form";
import {
    buildCreatePayload,
    createEmptyRepairRequestFormValues,
} from "./hooks/helpers";
import type { IRepairRequestFormValues } from "./hooks/helpers";

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
    const { currentUser, isLoadingUser, userError } = useUserContext();

    const [statusId, setStatusId] = React.useState<number | null>(null);
    const [loadingStatus, setLoadingStatus] = React.useState(true);
    const [pageError, setPageError] = React.useState("");

    React.useEffect(() =>
    {
        let cancelled = false;

        async function loadInitialStatus()
        {
            try
            {
                const response = await searchRepairStatuses({
                    ...buildLookupPayload("repairStatus", {
                        limit: 100,
                        page: 1,
                        search: "",
                    }),
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

    if ((isLoadingUser && currentUser === null) || loadingStatus)
    {
        return <Loading message="Preparing repair request form..." />;
    }

    if (!currentUser)
    {
        return (
            <ErrorCard
                backHref="/repair-requests"
                backLabel="Back to Repair Requests"
                message={userError || "Unable to load your user profile."}
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

    return (
        <Create
            backHref="/repair-requests"
            backLabel="Back to Repair Requests"
            description="Submit a repair request for your department and attach the required line items."
            Form={RepairRequestForm}
            formProps={{ mode: "create", currentUser } as const}
            initialValues={createEmptyRepairRequestFormValues()}
            onCancel={() => navigate("/repair-requests")}
            onSubmit={async (values: IRepairRequestFormValues) =>
            {
                const createdRepairRequest = await createRepairRequest(buildCreatePayload(values, statusId, currentUser));

                navigate(`/repair-requests/${createdRepairRequest.id}`, { replace: true });
            }}
            submitErrorMessage="Unable to create the repair request."
            title="Create Repair Request"
        />
    );
}
