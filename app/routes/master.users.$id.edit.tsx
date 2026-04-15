import EditUserPage from "~/modules/Master/Users/Edit";

export function meta()
{
    return [
        { title: "Edit User — Maintenance Tracking System" },
        { name: "description", content: "Edit an existing user in the Master section." },
    ];
}

export default function MasterUserEditRoute()
{
    return <EditUserPage />;
}
