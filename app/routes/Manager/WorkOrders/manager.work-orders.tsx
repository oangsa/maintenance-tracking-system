import ManagerWorkOrdersListPage from "~/modules/Feature/manager/WorkOrders";

export function meta()
{
    return [
        { title: "Manage Work Orders — Maintenance Tracking System" },
        { name: "description", content: "Browse and manage work orders for your department." },
    ];
}

export default function ManagerWorkOrdersRoute()
{
    return <ManagerWorkOrdersListPage />;
}