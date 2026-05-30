import { EditWorkTaskPage } from "~/modules/Feature/WorkTasks";

export function meta()
{
    return [
        { title: "Edit Work Task — Maintenance Tracking System" },
        { name: "description", content: "Edit an existing work task." },
    ];
}

export default function ManagerWorkTasksEditRoute() 
{
    return <EditWorkTaskPage />;
}
