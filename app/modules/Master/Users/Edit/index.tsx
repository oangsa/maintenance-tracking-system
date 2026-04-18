import { useNavigate, useParams } from "react-router";
import Edit from "~/components/Maintain/Edit";
import { getUserById, updateUser } from "~/services/users.service";
import UserForm from "../form";
import { buildUpdatePayload, mapUserToFormValues } from "../hooks/helpers";

export default function EditUserPage()
{
    const navigate = useNavigate();
    const params = useParams();

    async function handleSubmit({ id, values }: { id: number; values: ReturnType<typeof mapUserToFormValues> })
    {
        await updateUser(id, buildUpdatePayload(values));

        navigate("/master/users", { replace: true });
    }

    async function handleCancel()
    {
        navigate("/master/users");
    }

    return (
        <Edit
            backHref="/master/users"
            backLabel="Back to Users"
            description="Update the selected user in the Master section."
            Form={UserForm}
            formProps={{ mode: "edit" } as const}
            id={params.id}
            invalidIdMessage="The requested user id is invalid."
            loadData={getUserById}
            loadErrorMessage="Unable to load the selected user."
            loadingMessage="Loading user..."
            mapDataToInitialValues={mapUserToFormValues}
            notFoundMessage="User not found."
            onCancel={handleCancel}
            onSubmit={handleSubmit}
            submitErrorMessage="Unable to update the user."
            title="Edit User"
        />
    );
}
