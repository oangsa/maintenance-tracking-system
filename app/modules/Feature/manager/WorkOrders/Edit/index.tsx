import { useNavigate, useParams } from "react-router";
import Edit from "~/components/Maintain/Edit";
import { getWorkOrderById, updateWorkOrder } from "~/services/workOrders.service";
import WorkOrderForm from "../form";
import { buildUpdatePayload, mapWorkOrderToFormValues } from "../hooks/helpers";

export default function ManagerWorkOrdersEditPage()
{
    const navigate = useNavigate();
    const params = useParams();

    async function handleSubmit({ id, values }: { id: number; values: ReturnType<typeof mapWorkOrderToFormValues> })
    {
        await updateWorkOrder(id, buildUpdatePayload(values));
        navigate("/manager/work-orders", { replace: true });
    }

    async function handleCancel()
    {
        navigate("/manager/work-orders");
    }

    return (
        <Edit
            backHref="/manager/work-orders"
            backLabel="Back to Work Orders"
            description="Update the details of this work order."
            Form={WorkOrderForm}
            formProps={{ mode: "edit" } as const}
            id={params.id}
            invalidIdMessage="The requested work order id is invalid."
            loadData={getWorkOrderById}
            loadErrorMessage="Unable to load the selected work order."
            loadingMessage="Loading work order..."
            mapDataToInitialValues={mapWorkOrderToFormValues}
            notFoundMessage="Work order not found."
            onCancel={handleCancel}
            onSubmit={handleSubmit as any}
            submitErrorMessage="Unable to update the work order."
            title="Edit Work Order"
        />
    );
}