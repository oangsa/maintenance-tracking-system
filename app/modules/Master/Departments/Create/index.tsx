import { useNavigate } from "react-router";
import Create from "~/components/Maintain/Create";
import { createDepartment } from "~/services/departments.service";
import DepartmentForm from "../form";
import { buildCreatePayload, createEmptyDepartmentFormValues } from "../hooks/helpers";

export default function CreateDepartmentPage()
{
    const navigate = useNavigate();

    async function handleSubmit(values: ReturnType<typeof createEmptyDepartmentFormValues>)
    {
        await createDepartment(buildCreatePayload(values));

        navigate("/master/departments", { replace: true });
    }

    async function handleCancel()
    {
        navigate("/master/departments");
    }

    return (
        <Create
            backHref="/master/departments"
            backLabel="Back to Departments"
            description="Add a new department in the Master section."
            Form={DepartmentForm}
            formProps={{ mode: "create" } as const}
            initialValues={createEmptyDepartmentFormValues()}
            onCancel={handleCancel}
            onSubmit={handleSubmit}
            submitErrorMessage="Unable to create the department."
            title="Create Department"
        />
    );
}
