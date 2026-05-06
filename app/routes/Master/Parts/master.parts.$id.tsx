import PartDetailPage from "~/modules/Master/Parts/Detail";

export function meta()
{
    return [
        { title: "Part Details — Maintenance Tracking System" },
        { name: "description", content: "View part details from the Master section." },
    ];
}

export default function MasterPartDetailRoute()
{
    return <PartDetailPage />;
}