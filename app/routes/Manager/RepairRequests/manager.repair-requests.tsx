import RepairRequestManagerListPage from "~/modules/Feature/RepairRequestForManager";

export function meta()
{
    return [
        { title: "Manager Repair Requests — Maintenance Tracking System" },
        { name: "description", content: "Browse repair requests from the Manager section." },
    ];
}

export default function ManagerRepairRequestsRoute()
{
    return <RepairRequestManagerListPage />;
}
