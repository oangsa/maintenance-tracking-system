import UsersListPage from "~/modules/Master/Users";

export function meta()
{
    return [
        { title: "Users — Maintenance Tracking System" },
        { name: "description", content: "Browse and manage users from the Master section." },
    ];
}

export default function MasterUsersRoute()
{
    return <UsersListPage />;
}
