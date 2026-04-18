import CreateRepairRequestPage from "~/modules/Feature/RepairRequestForEmployee/Create";

export function meta()
{
    return [
        { title: "Create Repair Request — Maintenance Tracking System" },
        { name: "description", content: "Create a repair request from the Main section." },
    ];
}

export default function CreateRepairRequestRoute()
{
    return <CreateRepairRequestPage />;
}
