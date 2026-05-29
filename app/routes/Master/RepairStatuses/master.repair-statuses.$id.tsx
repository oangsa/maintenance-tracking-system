import RepairStatusDetailPage from "~/modules/Master/RepairStatuses/Detail";

export function meta()
{
    return [
        { title: "Repair Status Details — Maintenance Tracking System" },
        { name: "description", content: "View repair status details from the Master section." },
    ];
}

export default function MasterRepairStatusDetailRoute()
{
    return <RepairStatusDetailPage />;
}