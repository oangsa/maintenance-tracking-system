import { useNavigate } from "react-router";
import Create from "~/components/Maintain/Create";
import { createUser } from "~/services/users.service";
import UserForm from "../form";
import { buildCreatePayload, createEmptyUserFormValues } from "../hooks/helpers";

export default function CreateUserPage()
{
    const navigate = useNavigate();

    async function handleSubmit(values: ReturnType<typeof createEmptyUserFormValues>)
    {
        await createUser(buildCreatePayload(values));

        navigate("/master/users", { replace: true });
    }

    async function handleCancel()
    {
        navigate("/master/users");
    }

    return (
        <Create
            backHref="/master/users"
            backLabel="Back to Users"
            description="Add a new user in the Master section."
            Form={UserForm}
            formProps={{ mode: "create" } as const}
            initialValues={createEmptyUserFormValues()}
            onCancel={handleCancel}
            onSubmit={handleSubmit}
            submitErrorMessage="Unable to create the user."
            title="Create User"
        />
    );
}
