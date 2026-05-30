import { useNavigate, useParams } from "react-router";
import Edit from "~/components/Maintain/Edit";
import { getWorkTaskById, updateWorkTask } from "~/services/workTasks.service";
import WorkTaskForm from "../form";
import { buildUpdatePayload, mapWorkTaskToFormValues } from "../hooks/helpers";
import type { IWorkTask } from "~/api/types/workTask.types";

export default function EditWorkTaskPage()
{
    const navigate = useNavigate();
    const params = useParams();

    async function handleSubmit({ id, record, values }: { id: number; record: IWorkTask; values: ReturnType<typeof mapWorkTaskToFormValues> })
    {
        await updateWorkTask(id.toString(), buildUpdatePayload(values));

        navigate(`/manager/work-orders/${record.workOrderId}`, { replace: true });
    }

    async function handleCancel()
    {
        navigate(-1);
    }

    return (
        <Edit
            backHref="/manager/work-orders"
            backLabel="Back to Work Orders"
            description="Update the details of this work task."
            Form={WorkTaskForm}
            formProps={{ mode: "edit" } as const}
            id={params.id}
            invalidIdMessage="The requested work task id is invalid."
            loadData={(id: number) => getWorkTaskById(String(id))}
            loadErrorMessage="Unable to load the selected work task."
            loadingMessage="Loading work task..."
            mapDataToInitialValues={mapWorkTaskToFormValues}
            notFoundMessage="Work task not found."
            onCancel={handleCancel}
            onSubmit={handleSubmit}
            submitErrorMessage="Unable to update the work task."
            title="Edit Work Task"
        />
    );
}