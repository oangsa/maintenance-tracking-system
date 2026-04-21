import RepairRequestItemStatusDetailPage from "@/modules/Master/RepairRequestItemStatus/Detail";

export function meta()
{
    return [
        { title: "Repair Request Item Status Details — Maintenance Tracking System" },
        { name: "description", content: "View detailed information about a specific repair request item status in the Master section." },
    ];
}

export default function MasterRepairRequestItemStatusDetailRoute()
{
    return <RepairRequestItemStatusDetailPage />;
}
