import { useNavigate, useParams } from "react-router";
import Edit from "~/components/Maintain/Edit";
import { getDepartmentById, updateDepartment } from "~/services/departments.service";
import DepartmentForm from "../form";
import {
    buildUpdatePayload,
    mapDepartmentToFormValues,
} from "../hooks/helpers";

export default function EditDepartmentPage()
{
    const navigate = useNavigate();
    const params = useParams();

    async function handleSubmit({ id, values }: { id: number; values: ReturnType<typeof mapDepartmentToFormValues> })
    {
        await updateDepartment(id, buildUpdatePayload(values));

        navigate("/master/departments", { replace: true });
    }

    async function handleCancel()
    {
        navigate("/master/departments");
    }

    return (
        <Edit
            backHref="/master/departments"
            backLabel="Back to Departments"
            description="Update the selected department in the Master section."
            Form={DepartmentForm}
            formProps={{ mode: "edit" } as const}
            id={params.id}
            invalidIdMessage="The requested department id is invalid."
            loadData={getDepartmentById}
            loadErrorMessage="Unable to load the selected department."
            loadingMessage="Loading department..."
            mapDataToInitialValues={mapDepartmentToFormValues}
            notFoundMessage="Department not found."
            onCancel={handleCancel}
            onSubmit={handleSubmit}
            submitErrorMessage="Unable to update the department."
            title="Edit Department"
        />
    );
}
