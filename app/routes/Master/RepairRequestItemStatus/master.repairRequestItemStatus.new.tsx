import CreateRepairRequestItemStatusPage from "@/modules/Master/RepairRequestItemStatus/Create";

export function meta()
{
    return [
        { title: "Create Repair Request Item Status — Maintenance Tracking System" },
        { name: "description", content: "Create a new repair request item status in the Master section." },
    ]
}

export default function NewRepairRequestItemStatusPage()
{
    return (
        <CreateRepairRequestItemStatusPage/>
    )
}
