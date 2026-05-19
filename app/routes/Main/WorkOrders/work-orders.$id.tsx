import EmployeeWorkOrdersDetailPage from "~/modules/Feature/employee/WorkOrders/Detail";

export function meta()
{
    return [
        { title: "Work Order Details — Maintenance Tracking System" },
        { name: "description", content: "View work order details." },
    ];
}

export default function EmployeeWorkOrdersDetailRoute()
{
    return <EmployeeWorkOrdersDetailPage />;
}