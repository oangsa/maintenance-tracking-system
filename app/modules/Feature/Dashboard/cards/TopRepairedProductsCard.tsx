import { Badge } from "~/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "~/components/ui/table";
import type { IDashboardCardComponentProps } from "../types";
import {
    type IUseTopRepairedProductsResult,
} from "../hooks/useTopRepairedProducts";

interface ITopRepairedProductsCardProps extends IDashboardCardComponentProps
{
    topRepairedProductsState?: IUseTopRepairedProductsResult;
    hideFilters?: boolean;
}

interface ITopRepairedProductsFiltersProps
{
    topRepairedProductsState: IUseTopRepairedProductsResult;
}

export function TopRepairedProductsFilters({ topRepairedProductsState }: ITopRepairedProductsFiltersProps)
{
    const {
        filters,
        monthOptions,
        selectedMonth,
        selectedYear,
        yearOptions,
        onMonthChange,
        onYearChange,
    } = topRepairedProductsState;

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

export default function TopRepairedProductsCard({
    topRepairedProductsState,
    hideFilters = false,
}: ITopRepairedProductsCardProps)
{
    if (topRepairedProductsState === undefined)
    {
        return (
            <div className="flex h-[18rem] w-full items-center justify-center rounded-md border border-destructive/50 bg-destructive/10 text-sm text-destructive">
                Top repaired products state is unavailable.
            </div>
        );
    }

    const resolvedState = topRepairedProductsState;
    const {
        data: topRepairedProductsData,
        loading,
        error,
    } = resolvedState;

    return (
        <div className="space-y-3">
            {!hideFilters && (
                <TopRepairedProductsFilters topRepairedProductsState={resolvedState} />
            )}

            {error ? (
                <div className="flex h-[18rem] w-full items-center justify-center rounded-md border border-destructive/50 bg-destructive/10 text-sm text-destructive">
                    {error}
                </div>
            ) : loading ? (
                <div className="flex h-[18rem] w-full items-center justify-center text-sm text-muted-foreground">
                    Loading...
                </div>
            ) : topRepairedProductsData.length === 0 ? (
                <div className="flex h-[18rem] w-full items-center justify-center text-sm text-muted-foreground">
                    No data available for the selected period.
                </div>
            ) : (
                <div className="h-[18rem] w-full overflow-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">#</TableHead>
                                <TableHead>Product</TableHead>
                                <TableHead className="text-right">Repairs</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {topRepairedProductsData.map((item) => (
                                <TableRow key={item.rowKey}>
                                    <TableCell className="font-medium text-muted-foreground">
                                        {item.rank}
                                    </TableCell>
                                    <TableCell className="font-medium">{item.productName}</TableCell>
                                    <TableCell className="text-right">
                                        <Badge variant="secondary">{item.repairCount}</Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}
