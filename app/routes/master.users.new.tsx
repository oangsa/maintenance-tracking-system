import CreateUserPage from "~/modules/Master/Users/Create";

export function meta()
{
    return [
        { title: "Create User — Maintenance Tracking System" },
        { name: "description", content: "Create a new user in the Master section." },
    ];
}

export default function MasterUsersCreateRoute()
{
    return <CreateUserPage />;
}
