import PartsListPage from "~/modules/Master/Parts";

export function meta()
{
    return [
        { title: "Parts — Maintenance Tracking System" },
        { name: "description", content: "Browse and manage parts from the Master section." },
    ];
}

export default function MasterPartsRoute()
{
    return <PartsListPage />;
}