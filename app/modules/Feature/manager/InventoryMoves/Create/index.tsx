import { useNavigate } from "react-router";
import Create from "~/components/Maintain/Create";
import { createInventoryMove } from "~/services/inventoryMoves.service";
import InventoryMoveForm from "../form";
import { buildCreatePayload, createEmptyInventoryMoveFormValues } from "../hooks/helpers";
import type { IInventoryMoveFormValues } from "~/schemas/inventoryMoveFormSchema";

export default function ManagerInventoryMovesCreatePage()
{
    const navigate = useNavigate();

    async function handleSubmit(values: IInventoryMoveFormValues)
    {
        const payload = buildCreatePayload(values);
        
        await createInventoryMove(payload);

        navigate("/manager/inventory-moves", { replace: true });
    }

    async function handleCancel()
    {
        navigate("/manager/inventory-moves");
    }

    return (
        <Create
            backHref="/manager/inventory-moves"
            backLabel="Back to Inventory Moves"
            description="Create a new inventory move transaction."
            Form={InventoryMoveForm}
            formProps={{ mode: "create" } as const}
            initialValues={createEmptyInventoryMoveFormValues() as IInventoryMoveFormValues}
            onCancel={handleCancel}
            onSubmit={handleSubmit}
            submitErrorMessage="Unable to create the inventory move transaction."
            title="Create Inventory Move"
        />
    );
}