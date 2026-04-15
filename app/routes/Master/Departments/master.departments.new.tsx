import CreateDepartmentPage from "~/modules/Master/Departments/Create";

export function meta()
{
    return [
        { title: "Create Department — Maintenance Tracking System" },
        { name: "description", content: "Create a new department in the Master section." },
    ];
}

export default function MasterDepartmentsCreateRoute()
{
    return <CreateDepartmentPage />;
}