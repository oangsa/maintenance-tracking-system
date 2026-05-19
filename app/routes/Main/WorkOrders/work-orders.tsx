import EmployeeWorkOrdersListPage from "~/modules/Feature/employee/WorkOrders";

export function meta()
{
    return [
        { title: "Work Orders — Maintenance Tracking System" },
        { name: "description", content: "View your assigned work orders." },
    ];
}

export default function EmployeeWorkOrdersRoute()
{
    return <EmployeeWorkOrdersListPage />;
}