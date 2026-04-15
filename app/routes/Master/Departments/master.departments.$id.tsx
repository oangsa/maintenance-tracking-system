import DepartmentDetailPage from "~/modules/Master/Departments/Detail";

export function meta()
{
    return [
        { title: "Department Details — Maintenance Tracking System" },
        { name: "description", content: "View department details from the Master section." },
    ];
}

export default function MasterDepartmentDetailRoute()
{
    return <DepartmentDetailPage />;
}