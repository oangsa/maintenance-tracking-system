import { CreateWorkTaskPage } from "~/modules/Feature/WorkTasks";

export function meta()
{
    return [
        { title: "Create Work Task — Maintenance Tracking System" },
        { name: "description", content: "Create a new work task for a work order." },
    ];
}

export default function ManagerWorkTasksNewRoute() 
{
    return <CreateWorkTaskPage />;
}