import type { IDashboardCardComponentProps } from "../types";
import CardUnderConstruction from "./CardUnderConstruction";

export default function RepairStatusBreakdownCard({}: IDashboardCardComponentProps)
{
    return (
        <CardUnderConstruction
            hint="Donut chart area for repair status distribution."
            owner="Developer C"
        />
    );
}
