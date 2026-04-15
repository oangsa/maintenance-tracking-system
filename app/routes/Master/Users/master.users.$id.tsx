import UserDetailPage from "~/modules/Master/Users/Detail";

export function meta()
{
    return [
        { title: "User Details — Maintenance Tracking System" },
        { name: "description", content: "View user details from the Master section." },
    ];
}

export default function MasterUserDetailRoute()
{
    return <UserDetailPage />;
}
