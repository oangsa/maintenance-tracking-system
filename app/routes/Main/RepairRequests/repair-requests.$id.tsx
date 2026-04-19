import RepairRequestDetailPage from "~/modules/Feature/employee/RepairRequests/Detail";

export function meta()
{
    return [
        { title: "Repair Request Details — Maintenance Tracking System" },
        { name: "description", content: "View repair request details from the Main section." },
    ];
}

export default function RepairRequestDetailRoute()
{
    return <RepairRequestDetailPage />;
}
