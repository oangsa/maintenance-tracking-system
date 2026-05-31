import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Badge } from "~/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "~/components/ui/chart";
import { Input } from "~/components/ui/input";
import type { IDashboardCardComponentProps } from "../types";
import {
    useRepairsByDepartment,
    type IUseRepairsByDepartmentResult,
} from "../hooks/useRepairsByDepartment";

interface IRepairsByDepartmentCardProps extends IDashboardCardComponentProps
{
    repairsByDepartmentState?: IUseRepairsByDepartmentResult;
    hideFilters?: boolean;
}

interface IRepairsByDepartmentFiltersProps
{
    repairsByDepartmentState: IUseRepairsByDepartmentResult;
}

export function RepairsByDepartmentFilters({ repairsByDepartmentState }: IRepairsByDepartmentFiltersProps)
{
    const {
        filters,
        onStartDateChange,
        onEndDateChange,
    } = repairsByDepartmentState;

    return (
        <div className="flex flex-wrap items-center justify-end gap-2">
            <Input
                className="w-[10.5rem]"
                onChange={(event) => onStartDateChange(event.target.value)}
                type="date"
                value={filters.startDate}
            />
            <Input
                className="w-[10.5rem]"
                onChange={(event) => onEndDateChange(event.target.value)}
                type="date"
                value={filters.endDate}
            />
            <Badge className="font-mono text-[11px]" variant="outline">
                {filters.startDate} to {filters.endDate}
            </Badge>
        </div>
    );
}

export default function RepairsByDepartmentCard({
    repairsByDepartmentState,
    hideFilters = false,
}: IRepairsByDepartmentCardProps)
{
    const resolvedState = repairsByDepartmentState ?? useRepairsByDepartment();
    const {
        data: repairsByDepartmentData,
        config: repairsByDepartmentChartConfig,
        loading,
        error,
    } = resolvedState;

    return (
        <div className="h-full w-full space-y-3">
            {!hideFilters && (
                <RepairsByDepartmentFilters repairsByDepartmentState={resolvedState} />
            )}

            {error ? (
                <div className="flex h-full min-h-[36rem] w-full items-center justify-center rounded-md border border-destructive/50 bg-destructive/10 px-4 text-sm text-destructive">
                    {error}
                </div>
            ) : loading ? (
                <div className="flex h-full min-h-[36rem] w-full items-center justify-center text-sm text-muted-foreground">
                    Loading...
                </div>
            ) : repairsByDepartmentData.length === 0 ? (
                <div className="flex h-full min-h-[36rem] w-full items-center justify-center text-sm text-muted-foreground">
                    No data available for the selected period.
                </div>
            ) : (
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
            )}
        </div>
    );
}
