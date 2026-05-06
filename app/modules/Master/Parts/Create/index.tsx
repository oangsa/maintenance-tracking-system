import { useNavigate } from "react-router";
import Create from "~/components/Maintain/Create";
import { createPart } from "~/services/parts.service";
import PartForm from "../form";
import { buildCreatePayload, createEmptyPartFormValues } from "../hooks/helpers";

export default function CreatePartPage()
{
    const navigate = useNavigate();

    async function handleSubmit(values: ReturnType<typeof createEmptyPartFormValues>)
    {
        await createPart(buildCreatePayload(values));
        
        navigate("/master/parts", { replace: true });
    }

    async function handleCancel()
    {
        navigate("/master/parts");
    }

    return (
        <Create
            backHref="/master/parts"
            backLabel="Back to Parts"
            description="Add a new part in the Master section."
            Form={PartForm}
            formProps={{ mode: "create" } as const}
            initialValues={createEmptyPartFormValues()}
            onCancel={handleCancel}
            onSubmit={handleSubmit}
            submitErrorMessage="Unable to create the part."
            title="Create Part"
        />
    );
}