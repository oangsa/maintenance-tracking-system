import { useNavigate, useSearchParams } from "react-router";
import Create from "~/components/Maintain/Create";
import { createWorkTask } from "~/services/workTasks.service";
import WorkTaskForm from "../form";
import { buildCreatePayload, createEmptyWorkTaskFormValues } from "../hooks/helpers";
import type { IWorkTaskFormValues } from "../hooks/helpers";

export default function CreateWorkTaskPage() 
{
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const workOrderId = searchParams.get("workOrderId");

    const backUrl = workOrderId ? `/manager/work-orders/${workOrderId}` : "/manager/work-orders";

    async function handleSubmit(values: IWorkTaskFormValues)
    {
        if (!workOrderId) return;

        await createWorkTask(buildCreatePayload(Number(workOrderId), values));
        navigate(backUrl, { replace: true });
    }

    async function handleCancel()
    {
        navigate(backUrl);
    }

    return (
        <Create
            backHref={backUrl}
            backLabel="Back to Work Order"
            description="Add a new work task for this work order."
            Form={WorkTaskForm}
            formProps={{ mode: "create" } as const}
            initialValues={createEmptyWorkTaskFormValues()}
            onCancel={handleCancel}
            onSubmit={handleSubmit}
            submitErrorMessage="Unable to create the work task."
            title="Create Work Task"
        />
    );
}