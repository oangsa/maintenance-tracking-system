import { useNavigate, useSearchParams } from "react-router";
import Create from "~/components/Maintain/Create";
import { createWorkOrder } from "~/services/workOrders.service";
import WorkOrderForm from "../form";
import { buildCreatePayload, createEmptyWorkOrderFormValues } from "../hooks/helpers";
import type { IWorkOrderFormValues } from "~/schemas/workOrderFormSchema";

function resolveSafeReturnPath(rawReturnTo: string | null): string
{
    if (!rawReturnTo)
    {
        return "/manager/work-orders";
    }

    const normalizedPath = rawReturnTo.trim();

    if (!normalizedPath.startsWith("/") || normalizedPath.startsWith("//"))
    {
        return "/manager/work-orders";
    }

    return normalizedPath;
}

export default function ManagerWorkOrdersCreatePage()
{
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const returnTo = resolveSafeReturnPath(searchParams.get("returnTo"));

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

        navigate(returnTo, { replace: true });
    }

    async function handleCancel()
    {
        navigate(returnTo);
    }

    const defaultValues = createEmptyWorkOrderFormValues() as IWorkOrderFormValues;
    const itemIdFromUrl = searchParams.get("repairRequestItemId");
    const descFromUrl = searchParams.get("desc");
    const statusCodeFromUrl = searchParams.get("statusCode");
    const statusIdFromUrl = searchParams.get("statusId");
    const statusNameFromUrl = searchParams.get("statusName");
    if (itemIdFromUrl) {
        defaultValues.repairRequestItemId = itemIdFromUrl;
        defaultValues.repairRequestItemProductName = descFromUrl || `Item #${itemIdFromUrl}`;
        defaultValues.statusId = statusIdFromUrl || "";
        defaultValues.statusCode = statusCodeFromUrl || "";
        defaultValues.statusName = statusNameFromUrl || "";
    }

    return (
        <Create
            backHref={returnTo}
            backLabel={returnTo.startsWith("/manager/repair-requests/") ? "Back to Repair Request" : "Back to Work Orders"}
            description="Create a new work order for a repair request item."
            Form={WorkOrderForm}
            formProps={{
                lockRepairRequestItem: Boolean(itemIdFromUrl?.trim()),
                mode: "create",
            } as const}
            initialValues={defaultValues}
            onCancel={handleCancel}
            onSubmit={handleSubmit}
            submitErrorMessage="Unable to create the work order."
            title="Create Work Order"
        />
    );
}
