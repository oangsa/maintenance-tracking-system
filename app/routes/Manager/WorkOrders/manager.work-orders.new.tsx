import ManagerCreateWorkOrderPage from "~/modules/Feature/manager/WorkOrders/Create";

export function meta()
{
    return [
        { title: "Create Work Order — Maintenance Tracking System" },
        { name: "description", content: "Create a new work order for a repair request item." },
    ];
}

export default function ManagerCreateWorkOrderRoute()
{
    return <ManagerCreateWorkOrderPage />;
}