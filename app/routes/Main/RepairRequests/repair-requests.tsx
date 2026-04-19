import RepairRequestEmployeeListPage from "~/modules/Feature/employee/RepairRequests";

export function meta()
{
    return [
        { title: "Repair Requests — Maintenance Tracking System" },
        { name: "description", content: "Browse your repair requests." },
    ];
}

export default function RepairRequestsRoute()
{
    return <RepairRequestEmployeeListPage />;
}
