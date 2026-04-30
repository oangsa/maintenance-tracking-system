import { useMemo, useState } from "react";
import type { ChartConfig } from "@/components/ui/chart";
import { MONTHS_OPTIONS } from "@/constants/common.constants";

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
    onMonthChange: (value: string | null) => void;
    onYearChange: (value: string | null) => void;
}

const mockMonthlyRepairTrendByMonthYear: Record<string, IMonthlyRepairTrendItem[]> = {
    "2026-01": [
        { productTypeName: "Laptop", value: 12 },
        { productTypeName: "Desktop", value: 8 },
        { productTypeName: "Printer", value: 5 },
    ],
    "2026-02": [
        { productTypeName: "Laptop", value: 10 },
        { productTypeName: "Desktop", value: 9 },
        { productTypeName: "Printer", value: 4 },
    ],
    "2026-03": [
        { productTypeName: "Laptop", value: 14 },
        { productTypeName: "Desktop", value: 6 },
        { productTypeName: "Printer", value: 7 },
    ],
    "2026-04": [
        { productTypeName: "Laptop", value: 11 },
        { productTypeName: "Desktop", value: 7 },
        { productTypeName: "Printer", value: 6 },
    ],
};

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
    const filters = useMemo<IMonthlyRepairTrendFilters>(() =>
    {
        return buildDateRange(selectedMonth, selectedYear);
    }, [selectedMonth, selectedYear]);

    const yearOptions = useMemo<IMonthlyRepairTrendYearOption[]>(() =>
    {
        return buildYearOptions(Number(defaultYear), 8);
    }, [defaultYear]);

    const data = useMemo<IMonthlyRepairTrendItem[]>(() =>
    {
        const monthYearKey = `${selectedYear}-${toTwoDigits(Number(selectedMonth))}`;
        const monthlyData = mockMonthlyRepairTrendByMonthYear[monthYearKey] ?? [
            { productTypeName: "Laptop", value: 0 },
            { productTypeName: "Desktop", value: 0 },
            { productTypeName: "Printer", value: 0 },
        ];

        return monthlyData;
    }, [selectedMonth, selectedYear]);

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
        onMonthChange,
        onYearChange,
    };
}
