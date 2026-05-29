import { useNavigate, useSearchParams } from "react-router";
import Create from "~/components/Maintain/Create";
import { createWorkOrder } from "~/services/workOrders.service";
import WorkOrderForm from "../form";
import { buildCreatePayload, createEmptyWorkOrderFormValues } from "../hooks/helpers";
import type { IWorkOrderFormValues } from "~/schemas/workOrderFormSchema";

export default function ManagerWorkOrdersCreatePage()
{
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    async function handleSubmit(values: IWorkOrderFormValues)
    {
        const safeValues = {
            ...values,
            repairRequestItemProductName: values.repairRequestItemProductName ?? "",
            scheduledStart: values.scheduledStart ?? "",
            scheduledEnd: values.scheduledEnd ?? "",
            statusCode: values.statusCode ?? "",
            statusName: values.statusName ?? "",
        } as Parameters<typeof buildCreatePayload>[0];

        await createWorkOrder(buildCreatePayload(safeValues));

        navigate("/manager/work-orders", { replace: true });
    }

    async function handleCancel()
    {
        navigate("/manager/work-orders");
    }

    const defaultValues = createEmptyWorkOrderFormValues() as IWorkOrderFormValues;
    const itemIdFromUrl = searchParams.get("repairRequestItemId");
    const descFromUrl = searchParams.get("desc");
    if (itemIdFromUrl) {
        defaultValues.repairRequestItemId = itemIdFromUrl;
        defaultValues.repairRequestItemProductName = descFromUrl || `Item #${itemIdFromUrl}`;
    }

    return (
        <Create
            backHref="/manager/work-orders"
            backLabel="Back to Work Orders"
            description="Create a new work order for a repair request item."
            Form={WorkOrderForm}
            formProps={{ mode: "create" } as const}
            initialValues={defaultValues}
            onCancel={handleCancel}
            onSubmit={handleSubmit}
            submitErrorMessage="Unable to create the work order."
            title="Create Work Order"
        />
    );
}