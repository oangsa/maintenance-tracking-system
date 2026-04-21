import { createRepairRequestItemStatus } from "@/services/repairRequestItemStatus.service";
import { useNavigate } from "react-router";
import { createEmptyRepairRequestItemStatusFormValues } from "../hooks/helpers";
import Create from "@/components/Maintain/Create";
import RepairRequestForm from "../form";

export default function CreateRepairRequestItemStatusPage()
{
    const navigate = useNavigate();

    const handleSubmit = async (values: ReturnType<typeof createEmptyRepairRequestItemStatusFormValues>) => {
        await createRepairRequestItemStatus(values);
        console.log("Repair request item status created successfully.");

        navigate("/master/repair-request-item-status", { replace: true });
    }

    const handleCancel = async () => {
        navigate("/master/repair-request-item-status");
    }

    return (
        <Create
            backHref="/master/repair-request-item-status"
            backLabel="Back to Repair Request Item Statuses"
            description="Add a new repair request item status in the Master section."
            onCancel={handleCancel}
            onSubmit={handleSubmit}
            submitErrorMessage="Unable to create the repair request item status."
            title="Create Repair Request Item Status"
            Form={RepairRequestForm}
            initialValues={createEmptyRepairRequestItemStatusFormValues()}
            formProps={{ mode: "create" } as const}
        />
    );
}
