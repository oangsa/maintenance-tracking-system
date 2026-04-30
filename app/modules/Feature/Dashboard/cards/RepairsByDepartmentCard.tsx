import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "~/components/ui/chart";
import type { IDashboardCardComponentProps } from "../types";
import { useRepairsByDepartment } from "../hooks/useRepairsByDepartment";

export default function RepairsByDepartmentCard({}: IDashboardCardComponentProps)
{
    const { data: repairsByDepartmentData, config: repairsByDepartmentChartConfig } = useRepairsByDepartment();

    return (
        <div className="h-full">
            <ChartContainer
                className="h-full min-h-[36rem] w-full aspect-auto"
                config={repairsByDepartmentChartConfig}
            >
                <BarChart
                    accessibilityLayer
                    data={repairsByDepartmentData}
                    layout="vertical"
                    margin={{ top: 4, right: 12, bottom: 4, left: 12 }}
                >
                    <CartesianGrid horizontal={false} />
                    <XAxis allowDecimals={false} type="number" />
                    <YAxis
                        axisLine={false}
                        dataKey="departmentName"
                        tickLine={false}
                        type="category"
                        width={110}
                    />
                    <ChartTooltip
                        content={<ChartTooltipContent hideLabel={true} />}
                        cursor={false}
                    />
                    <Bar
                        dataKey="value"
                        fill="var(--color-value)"
                        radius={6}
                    />
                </BarChart>
            </ChartContainer>
        </div>
    );
}
