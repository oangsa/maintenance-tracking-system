import EditPartPage from "~/modules/Master/Parts/Edit";

export function meta()
{
    return [
        { title: "Edit Part — Maintenance Tracking System" },
        { name: "description", content: "Edit an existing part in the Master section." },
    ];
}

export default function MasterPartEditRoute()
{
    return <EditPartPage />;
}