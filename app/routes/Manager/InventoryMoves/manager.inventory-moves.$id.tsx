import ManagerInventoryMovesDetailPage from "~/modules/Feature/manager/InventoryMoves/Detail";

export function meta()
{
    return [
        { title: "Inventory Move Details — Maintenance Tracking System" },
        { name: "description", content: "View inventory move transaction details." },
    ];
}

export default function ManagerInventoryMovesDetailRoute()
{
    return <ManagerInventoryMovesDetailPage />;
}