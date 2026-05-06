import CreatePartPage from "~/modules/Master/Parts/Create";

export function meta()
{
    return [
        { title: "Create Part — Maintenance Tracking System" },
        { name: "description", content: "Create a new part in the Master section." },
    ];
}

export default function MasterPartsCreateRoute()
{
    return <CreatePartPage />;
}