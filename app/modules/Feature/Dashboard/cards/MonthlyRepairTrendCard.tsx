import { Bar, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from "recharts";
import { Badge } from "~/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "~/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import type { IDashboardCardComponentProps } from "../types";
import { useMonthlyRepairTrend, type IUseMonthlyRepairTrendResult } from "../hooks/useMonthlyRepairTrend";

interface IMonthlyRepairTrendCardProps extends IDashboardCardComponentProps
{
    trendState?: IUseMonthlyRepairTrendResult;
    hideFilters?: boolean;
}

interface IMonthlyRepairTrendFiltersProps
{
    trendState: IUseMonthlyRepairTrendResult;
}

export function MonthlyRepairTrendFilters({ trendState }: IMonthlyRepairTrendFiltersProps)
{
    const {
        filters,
        monthOptions,
        selectedMonth,
        selectedYear,
        yearOptions,
        onMonthChange,
        onYearChange,
    } = trendState;

    return (
        <div className="flex flex-wrap items-center justify-end gap-2">
            <Select value={selectedMonth} onValueChange={onMonthChange}>
                <SelectTrigger className="w-[9rem]">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {monthOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select value={selectedYear} onValueChange={onYearChange}>
                <SelectTrigger className="w-[7rem]">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {yearOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Badge className="font-mono text-[11px]" variant="outline">
                {filters.startDate} to {filters.endDate}
            </Badge>
        </div>
    );
}

export default function MonthlyRepairTrendCard({
    trendState,
    hideFilters = false,
}: IMonthlyRepairTrendCardProps)
{
    const resolvedTrendState = trendState ?? useMonthlyRepairTrend();
    const {
        data: monthlyRepairTrendData,
        config: monthlyRepairTrendChartConfig,
        loading,
        error,
    } = resolvedTrendState;

    return (
        <div className="space-y-3">
            {!hideFilters && (
                <MonthlyRepairTrendFilters trendState={resolvedTrendState} />
            )}

            {error ? (
                <div className="flex h-[18rem] w-full items-center justify-center rounded-md border border-destructive/50 bg-destructive/10 text-sm text-destructive">
                    {error}
                </div>
            ) : loading ? (
                <div className="flex h-[18rem] w-full items-center justify-center text-sm text-muted-foreground">
                    Loading...
                </div>
            ) : monthlyRepairTrendData.length === 0 ? (
                <div className="flex h-[18rem] w-full items-center justify-center text-sm text-muted-foreground">
                    No data available for the selected period.
                </div>
            ) : (
                <ChartContainer
                    className="h-[18rem] w-full"
                    config={monthlyRepairTrendChartConfig}
                >
                    <ComposedChart
                        accessibilityLayer
                        data={monthlyRepairTrendData}
                        margin={{ top: 4, right: 12, bottom: 4, left: 4 }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            axisLine={false}
                            dataKey="productTypeName"
                            tickLine={false}
                        />
                        <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar
                            dataKey="value"
                            fill="var(--color-value)"
                            radius={[8, 8, 0, 0]}
                        />
                        <Line
                            dataKey="value"
                            dot={{
                                fill: "var(--color-trend)",
                                r: 4,
                            }}
                            stroke="var(--color-trend)"
                            strokeWidth={2}
                            type="monotone"
                        />
                    </ComposedChart>
                </ChartContainer>
            )}
        </div>
    );
}
