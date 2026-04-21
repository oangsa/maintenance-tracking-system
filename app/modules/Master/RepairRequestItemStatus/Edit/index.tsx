import Edit from "@/components/Maintain/Edit";
import { useNavigate, useParams } from "react-router";
import { mapRepairRequestItemStatusToFormValues } from "../hooks/helpers";
import { getRepairRequestItemStatusById, updateRepairRequestItemStatus } from "@/services/repairRequestItemStatus.service";
import RepairRequestItemStatusForm from "../form";


export default function EditRepairRequestItemStatusPage()
{
    const navigate = useNavigate();
    const params = useParams();

    const handleSubmit = async ({ id, values }: { id: number; values: ReturnType<typeof mapRepairRequestItemStatusToFormValues> }) =>
    {
        await updateRepairRequestItemStatus(id, values);

        navigate("/master/repair-request-item-status", { replace: true });
    }

    const handleCancel = async () =>
    {
        navigate("/master/repair-request-item-status");
    }


    return (
        <Edit
            backHref="/master/repair-request-item-status"
            backLabel="Back to Repair Request Item Statuses"
            description="Update the selected status in the Master section."
            Form={RepairRequestItemStatusForm}
            formProps={{ mode: "edit" } as const}
            id={params.id}
            invalidIdMessage="The requested repair request item status id is invalid."
            loadData={getRepairRequestItemStatusById}
            loadErrorMessage="Unable to load the selected department."
            loadingMessage="Loading department..."
            mapDataToInitialValues={mapRepairRequestItemStatusToFormValues}
            notFoundMessage="Repair Request Item Status not found."
            onCancel={handleCancel}
            onSubmit={handleSubmit}
            submitErrorMessage="Unable to update the status."
            title="Edit Repair Request Item Status"
        />
    )
}
