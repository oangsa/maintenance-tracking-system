import RepairRequestItemStatusPage from "@/modules/Master/RepairRequestItemStatus";


export function meta()
{
    return [
        { title: "Repair Request Item Statuses — Maintenance Tracking System" },
        { name: "description", content: "Browse and manage repair request item statuses from the Master section." },
    ];
}

export default function MasterRepairRequestItemStatusRoute()
{
    return <RepairRequestItemStatusPage />;
}
