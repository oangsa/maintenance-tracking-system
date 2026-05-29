import { useNavigate } from "react-router";
import Create from "~/components/Maintain/Create";
import { createRepairStatus } from "~/services/repairStatuses.service";
import RepairStatusForm from "../form";
import { buildCreatePayload, createEmptyRepairStatusFormValues } from "../hooks/helpers";

export default function CreateRepairStatusPage()
{
    const navigate = useNavigate();

    async function handleSubmit(values: ReturnType<typeof createEmptyRepairStatusFormValues>)
    {
        await createRepairStatus(buildCreatePayload(values));

        navigate("/master/repair-statuses", { replace: true });
    }

    async function handleCancel()
    {
        navigate("/master/repair-statuses");
    }

    return (
        <Create
            backHref="/master/repair-statuses"
            backLabel="Back to Repair Statuses"
            description="Add a new repair status in the Master section."
            Form={RepairStatusForm}
            formProps={{ mode: "create" } as const}
            initialValues={createEmptyRepairStatusFormValues()}
            onCancel={handleCancel}
            onSubmit={handleSubmit}
            submitErrorMessage="Unable to create the repair status."
            title="Create Repair Status"
        />
    );
}