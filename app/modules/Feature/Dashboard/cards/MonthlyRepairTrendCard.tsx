import type { IDashboardCardComponentProps } from "../types";
import CardUnderConstruction from "./CardUnderConstruction";

export default function MonthlyRepairTrendCard({}: IDashboardCardComponentProps)
{
    return (
        <CardUnderConstruction
            hint="Line and bar trend visualization area for monthly repair volume."
            owner="Developer B"
        />
    );
}
