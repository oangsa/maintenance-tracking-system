import ManagerEditWorkOrderPage from "~/modules/Feature/manager/WorkOrders/Edit";

export function meta()
{
    return [
        { title: "Edit Work Order — Maintenance Tracking System" },
        { name: "description", content: "Edit an existing work order." },
    ];
}

export default function ManagerEditWorkOrderRoute()
{
    return <ManagerEditWorkOrderPage />;
}