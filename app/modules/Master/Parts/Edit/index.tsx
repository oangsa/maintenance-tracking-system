import { useNavigate, useParams } from "react-router";
import Edit from "~/components/Maintain/Edit";
import { getPartById, updatePart } from "~/services/parts.service";
import PartForm from "../form";
import { buildUpdatePayload, mapPartToFormValues } from "../hooks/helpers";

export default function EditPartPage()
{
    const navigate = useNavigate();
    const params = useParams();

    async function handleSubmit({ id, values }: { id: number; values: ReturnType<typeof mapPartToFormValues> })
    {
        await updatePart(id, buildUpdatePayload(values));

        navigate("/master/parts", { replace: true });
    }

    async function handleCancel()
    {
        navigate("/master/parts");
    }

    return (
        <Edit
            backHref="/master/parts"
            backLabel="Back to Parts"
            description="Update the selected part in the Master section."
            Form={PartForm}
            formProps={{ mode: "edit" } as const}
            id={params.id}
            invalidIdMessage="The requested part id is invalid."
            loadData={getPartById}
            loadErrorMessage="Unable to load the selected part."
            loadingMessage="Loading part..."
            mapDataToInitialValues={mapPartToFormValues}
            notFoundMessage="Part not found."
            onCancel={handleCancel}
            onSubmit={handleSubmit}
            submitErrorMessage="Unable to update the part."
            title="Edit Part"
        />
    );
}