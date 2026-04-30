import type { IDashboardCardComponentProps } from "../types";
import MetricSummaryValue from "./MetricSummaryValue";

export default function UrgentRequestsCard({}: IDashboardCardComponentProps)
{
    return (
        <MetricSummaryValue
            caption="Replace with API value"
            value="6"
        />
    );
}
