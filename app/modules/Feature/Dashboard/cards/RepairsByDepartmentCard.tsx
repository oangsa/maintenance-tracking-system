import type { IDashboardCardComponentProps } from "../types";
import CardUnderConstruction from "./CardUnderConstruction";

export default function RepairsByDepartmentCard({}: IDashboardCardComponentProps)
{
    return (
        <CardUnderConstruction
            hint="Horizontal bar chart area for repairs grouped by department."
            owner="Developer A"
        />
    );
}
