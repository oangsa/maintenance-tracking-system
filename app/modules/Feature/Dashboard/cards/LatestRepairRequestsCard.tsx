import type { IDashboardCardComponentProps } from "../types";
import CardUnderConstruction from "./CardUnderConstruction";

export default function LatestRepairRequestsCard({}: IDashboardCardComponentProps)
{
    return (
        <CardUnderConstruction
            hint="Latest repair request list area with status and requester summary."
            owner="Developer D"
        />
    );
}
