import RepairStatusesListPage from "~/modules/Master/RepairStatuses";

export function meta()
{
    return [
        { title: "Repair Statuses — Maintenance Tracking System" },
        { name: "description", content: "Browse and manage repair statuses from the Master section." },
    ];
}

export default function MasterRepairStatusesRoute()
{
    return <RepairStatusesListPage />;
}