import EditRepairStatusPage from "~/modules/Master/RepairStatuses/Edit";

export function meta()
{
    return [
        { title: "Edit Repair Status — Maintenance Tracking System" },
        { name: "description", content: "Edit an existing repair status in the Master section." },
    ];
}

export default function MasterRepairStatusEditRoute()
{
    return <EditRepairStatusPage />;
}