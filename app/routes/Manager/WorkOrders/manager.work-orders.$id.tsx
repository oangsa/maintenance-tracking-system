import ManagerWorkOrdersDetailPage from "~/modules/Feature/manager/WorkOrders/Detail";

export function meta()
{
    return [
        { title: "Work Order Details — Maintenance Tracking System" },
        { name: "description", content: "View work order details and assignments." },
    ];
}

export default function ManagerWorkOrdersDetailRoute()
{
    return <ManagerWorkOrdersDetailPage />;
}