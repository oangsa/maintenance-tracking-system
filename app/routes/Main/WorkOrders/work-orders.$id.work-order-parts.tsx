import EmployeeWorkOrderPartsPage from "~/modules/Feature/employee/WorkOrders/WorkOrderParts";

export function meta()
{
    return [
        { title: "Work Order Parts — Maintenance Tracking System" },
        { name: "description", content: "Manage parts for an assigned work order." },
    ];
}

export default function EmployeeWorkOrderPartsRoute()
{
    return <EmployeeWorkOrderPartsPage />;
}
