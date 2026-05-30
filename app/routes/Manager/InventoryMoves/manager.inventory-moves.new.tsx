import ManagerInventoryMovesCreatePage from "~/modules/Feature/manager/InventoryMoves/Create";

export function meta()
{
    return [
        { title: "New Inventory Move — Maintenance Tracking System" },
        { name: "description", content: "Create a new inventory move transaction." },
    ];
}

export default function ManagerInventoryMovesNewRoute()
{
    return <ManagerInventoryMovesCreatePage />;
}