import type { IDashboardCardComponentProps } from "../types";
import CardUnderConstruction from "./CardUnderConstruction";

export default function TopRepairedProductsCard({}: IDashboardCardComponentProps)
{
    return (
        <CardUnderConstruction
            hint="Top repaired product list area grouped by product code and name."
            owner="Developer D"
        />
    );
}
