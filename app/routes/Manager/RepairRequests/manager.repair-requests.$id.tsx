import RepairRequestManagerDetailPage from "~/modules/Feature/manager/RepairRequests/Detail";

export function meta()
{
    return [
        { title: "Repair Request Details — Maintenance Tracking System" },
        { name: "description", content: "View repair request details from the Manager section." },
    ];
}

export default function ManagerRepairRequestDetailRoute()
{
    return <RepairRequestManagerDetailPage />;
}
