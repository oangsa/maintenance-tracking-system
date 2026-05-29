import ManagerInventoryMovesListPage from "~/modules/Feature/manager/InventoryMoves";

export function meta()
{
    return [
        { title: "Manage Inventory Moves — Maintenance Tracking System" },
        { name: "description", content: "Browse and manage inventory move transactions." },
    ];
}

export default function ManagerInventoryMovesRoute()
{
    return <ManagerInventoryMovesListPage />;
}