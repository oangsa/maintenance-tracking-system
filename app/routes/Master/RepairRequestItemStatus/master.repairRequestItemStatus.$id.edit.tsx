import EditRepairRequestItemStatusPage from "@/modules/Master/RepairRequestItemStatus/Edit";

export function meta()
{
    return [
        { title: "Edit Repair Request Item Status — Maintenance Tracking System" },
        { name: "description", content: "Edit an existing repair request item status in the Master section." },
    ]
}

export default function EditRepairRequestItemStatusRoute()
{
    return (
        <EditRepairRequestItemStatusPage/>
    )
}
