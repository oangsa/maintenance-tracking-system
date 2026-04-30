import { Pie, PieChart } from "recharts";
import { Badge } from "~/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "~/components/ui/chart";
import type { IDashboardCardComponentProps } from "../types";
import { useRepairStatusBreakDown } from "../hooks/useRepairStatusBreakDown";

export default function RepairStatusBreakdownCard({}: IDashboardCardComponentProps)
{
    const { data: repairStatusBreakdownData, config: repairStatusBreakdownConfig } = useRepairStatusBreakDown();

    return (
        <div className="space-y-4">
            <ChartContainer
                className="mx-auto h-[16rem] w-full aspect-auto"
                config={repairStatusBreakdownConfig}
            >
                <PieChart accessibilityLayer>
                    <ChartTooltip content={<ChartTooltipContent nameKey="statusName" />} />
                    <Pie
                        data={repairStatusBreakdownData}
                        dataKey="value"
                        innerRadius={56}
                        nameKey="statusName"
                        outerRadius={84}
                        strokeWidth={2}
                    />
                </PieChart>
            </ChartContainer>

            <div className="flex flex-wrap gap-2">
                {repairStatusBreakdownData.map((item) => (
                    <Badge className="gap-1.5" key={item.statusName} variant="outline">
                        <span
                            className="size-2 rounded-full"
                            style={{ backgroundColor: item.fill }}
                        />
                        <span>{item.statusName}</span>
                        <span>{item.value}</span>
                    </Badge>
                ))}
            </div>
        </div>
    );
}
