import { useEffect, useMemo, useState } from "react";
import type { ChartConfig } from "@/components/ui/chart";
import { MONTHS_OPTIONS } from "@/constants/common.constants";
import { getMonthlyRepairTrendByProductTypeReport } from "~/services/repairRequests.service";
import type { ISearchConditionOperator } from "~/api/types/types";

export interface IMonthlyRepairTrendItem
{
    productTypeName: string;
    value: number;
}

export interface IMonthlyRepairTrendYearOption
{
    label: string;
    value: string;
}

export interface IMonthlyRepairTrendFilters
{
    startDate: string;
    endDate: string;
}

export interface IUseMonthlyRepairTrendResult
{
    data: IMonthlyRepairTrendItem[];
    config: ChartConfig;
    filters: IMonthlyRepairTrendFilters;
    monthOptions: typeof MONTHS_OPTIONS;
    selectedMonth: string;
    selectedYear: string;
    yearOptions: IMonthlyRepairTrendYearOption[];
    loading: boolean;
    error: string | null;
    onMonthChange: (value: string | null) => void;
    onYearChange: (value: string | null) => void;
}

function toTwoDigits(value: number): string
{
    return String(value).padStart(2, "0");
}

function buildDateRange(monthValue: string, yearValue: string): IMonthlyRepairTrendFilters
{
    const month = Number(monthValue);
    const year = Number(yearValue);
    const lastDayOfMonth = new Date(year, month, 0).getDate();

    return {
        startDate: `${year}-${toTwoDigits(month)}-01`,
        endDate: `${year}-${toTwoDigits(month)}-${toTwoDigits(lastDayOfMonth)}`,
    };
}

function buildYearOptions(baseYear: number, numberOfYears: number): IMonthlyRepairTrendYearOption[]
{
    return Array.from({ length: numberOfYears }, (_, index) =>
    {
        const year = String(baseYear - index);

        return {
            label: year,
            value: year,
        };
    });
}

export function useMonthlyRepairTrend(): IUseMonthlyRepairTrendResult
{
    const currentDate = new Date();
    const defaultMonth = String(currentDate.getMonth() + 1);
    const defaultYear = String(currentDate.getFullYear());
    const [selectedMonth, setSelectedMonth] = useState<string>(defaultMonth);
    const [selectedYear, setSelectedYear] = useState<string>(defaultYear);
    const [data, setData] = useState<IMonthlyRepairTrendItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const filters = useMemo<IMonthlyRepairTrendFilters>(() =>
    {
        return buildDateRange(selectedMonth, selectedYear);
    }, [selectedMonth, selectedYear]);

    const yearOptions = useMemo<IMonthlyRepairTrendYearOption[]>(() =>
    {
        return buildYearOptions(Number(defaultYear), 8);
    }, [defaultYear]);

    useEffect(() =>
    {
        let isMounted = true;

        async function fetchData()
        {
            if (!filters.startDate || !filters.endDate)
            {
                return;
            }

            setLoading(true);
            setError(null);

            try
            {
                const response = await getMonthlyRepairTrendByProductTypeReport({
                    pageNumber: 1,
                    pageSize: 100,
                    search: [
                        {
                            name: "requested_at",
                            condition: "GREATEROREQUAL" as ISearchConditionOperator,
                            value: `${filters.startDate}T00:00:00.000Z`,
                        },
                        {
                            name: "requested_at",
                            condition: "LESSEROREQUAL" as ISearchConditionOperator,
                            value: `${filters.endDate}T23:59:59.999Z`,
                        },
                    ],
                });

                if (isMounted)
                {
                    setData(response.data);
                }
            }
            catch (err: any)
            {
                if (isMounted)
                {
                    setError(err.message || "Failed to load monthly trend");
                }
            }
            finally
            {
                if (isMounted)
                {
                    setLoading(false);
                }
            }
        }

        fetchData();

        return () =>
        {
            isMounted = false;
        };
    }, [filters.startDate, filters.endDate]);

    const config = useMemo<ChartConfig>(() =>
    {
        return {
            value: {
                label: "Repairs",
                color: "var(--chart-2)",
            },
            trend: {
                label: "Trend",
                color: "var(--chart-4)",
            },
        };
    }, []);

    function onMonthChange(value: string | null)
    {
        if (value === null)
        {
            return;
        }

        setSelectedMonth(value);
    }

    function onYearChange(value: string | null)
    {
        if (value === null)
        {
            return;
        }

        setSelectedYear(value);
    }

    return {
        data,
        config,
        filters,
        monthOptions: MONTHS_OPTIONS,
        selectedMonth,
        selectedYear,
        yearOptions,
        loading,
        error,
        onMonthChange,
        onYearChange,
    };
}
