import CreateRepairStatusPage from "~/modules/Master/RepairStatuses/Create";

export function meta()
{
    return [
        { title: "Create Repair Status — Maintenance Tracking System" },
        { name: "description", content: "Create a new repair status in the Master section." },
    ];
}

export default function MasterRepairStatusesCreateRoute()
{
    return <CreateRepairStatusPage />;
}