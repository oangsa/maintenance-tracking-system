import { useNavigate, useParams } from "react-router";
import Edit from "~/components/Maintain/Edit";
import { getRepairStatusById, updateRepairStatus } from "~/services/repairStatuses.service";
import RepairStatusForm from "../form";
import { buildUpdatePayload, mapRepairStatusToFormValues } from "../hooks/helpers";

export default function EditRepairStatusPage()
{
    const navigate = useNavigate();
    const params = useParams();

    async function handleSubmit({ id, values }: { id: number; values: ReturnType<typeof mapRepairStatusToFormValues> })
    {
        await updateRepairStatus(id, buildUpdatePayload(values));

        navigate("/master/repair-statuses", { replace: true });
    }

    async function handleCancel()
    {
        navigate("/master/repair-statuses");
    }

    return (
        <Edit
            backHref="/master/repair-statuses"
            backLabel="Back to Repair Statuses"
            description="Update the selected repair status in the Master section."
            Form={RepairStatusForm}
            formProps={{ mode: "edit" } as const}
            id={params.id}
            invalidIdMessage="The requested repair status id is invalid."
            loadData={getRepairStatusById}
            loadErrorMessage="Unable to load the selected repair status."
            loadingMessage="Loading repair status..."
            mapDataToInitialValues={mapRepairStatusToFormValues}
            notFoundMessage="Repair status not found."
            onCancel={handleCancel}
            onSubmit={handleSubmit}
            submitErrorMessage="Unable to update the repair status."
            title="Edit Repair Status"
        />
    );
}