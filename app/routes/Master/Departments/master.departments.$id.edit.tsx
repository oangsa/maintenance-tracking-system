import EditDepartmentPage from "~/modules/Master/Departments/Edit";

export function meta()
{
    return [
        { title: "Edit Department — Maintenance Tracking System" },
        { name: "description", content: "Edit an existing department in the Master section." },
    ];
}

export default function MasterDepartmentEditRoute()
{
    return <EditDepartmentPage />;
}