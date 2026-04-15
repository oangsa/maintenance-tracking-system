import DepartmentsListPage from "~/modules/Master/Departments";

export function meta()
{
    return [
        { title: "Departments — Maintenance Tracking System" },
        { name: "description", content: "Browse and manage departments from the Master section." },
    ];
}

export default function MasterDepartmentsRoute()
{
    return <DepartmentsListPage />;
}