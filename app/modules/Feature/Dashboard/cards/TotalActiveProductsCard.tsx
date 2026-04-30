import type { IDashboardCardComponentProps } from "../types";
import MetricSummaryValue from "./MetricSummaryValue";

export default function TotalActiveProductsCard({}: IDashboardCardComponentProps)
{
    return (
        <MetricSummaryValue
            caption="Replace with API value"
            value="1,234"
        />
    );
}
