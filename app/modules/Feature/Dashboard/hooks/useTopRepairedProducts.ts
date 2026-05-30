import { useEffect, useMemo, useState } from "react";
import { MONTHS_OPTIONS } from "@/constants/common.constants";
import type { ISearchConditionOperator } from "~/api/types/types";
import { getTopRepairedProductsReport } from "~/services/repairRequests.service";

export interface ITopRepairedProductsItem
{
    productName: string;
    value: number;
}

export interface ITopRepairedProductsYearOption
{
    label: string;
    value: string;
}

export interface ITopRepairedProductsFilters
{
    startDate: string;
    endDate: string;
}

export interface IUseTopRepairedProductsResult
{
    data: ITopRepairedProductsItem[];
    filters: ITopRepairedProductsFilters;
    monthOptions: typeof MONTHS_OPTIONS;
    selectedMonth: string;
    selectedYear: string;
    yearOptions: ITopRepairedProductsYearOption[];
    loading: boolean;
    error: string | null;
    onMonthChange: (value: string | null) => void;
    onYearChange: (value: string | null) => void;
}

function toTwoDigits(value: number): string
{
    return String(value).padStart(2, "0");
}

function buildDateRange(monthValue: string, yearValue: string): ITopRepairedProductsFilters
{
    const month = Number(monthValue);
    const year = Number(yearValue);
    const lastDayOfMonth = new Date(year, month, 0).getDate();

    return {
        startDate: `${year}-${toTwoDigits(month)}-01`,
        endDate: `${year}-${toTwoDigits(month)}-${toTwoDigits(lastDayOfMonth)}`,
    };
}

function buildYearOptions(baseYear: number, numberOfYears: number): ITopRepairedProductsYearOption[]
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

function getErrorMessage(error: unknown): string
{
    if (error instanceof Error && error.message)
    {
        return error.message;
    }

    return "Failed to load top repaired products";
}

export function useTopRepairedProducts(): IUseTopRepairedProductsResult
{
    const currentDate = new Date();
    const defaultMonth = String(currentDate.getMonth() + 1);
    const defaultYear = String(currentDate.getFullYear());
    const [selectedMonth, setSelectedMonth] = useState<string>(defaultMonth);
    const [selectedYear, setSelectedYear] = useState<string>(defaultYear);
    const [data, setData] = useState<ITopRepairedProductsItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const filters = useMemo<ITopRepairedProductsFilters>(() =>
    {
        return buildDateRange(selectedMonth, selectedYear);
    }, [selectedMonth, selectedYear]);

    const yearOptions = useMemo<ITopRepairedProductsYearOption[]>(() =>
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
                const response = await getTopRepairedProductsReport({
                    pageNumber: 1,
                    pageSize: 10,
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
                    setData(response.data.map((item) =>
                    {
                        return {
                            productName: item.productName || "-",
                            value: item.value,
                        };
                    }));
                }
            }
            catch (err: unknown)
            {
                if (isMounted)
                {
                    setData([]);
                    setError(getErrorMessage(err));
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
