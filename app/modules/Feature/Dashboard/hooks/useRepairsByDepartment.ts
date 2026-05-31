import { useState, useEffect, useMemo } from "react";
import type { ChartConfig } from "@/components/ui/chart";
import { getRepairRequestGroupByDepartmentReport } from "~/services/repairRequests.service";
import type { IRepairRequestGroupByDepartmentReport, ISearchConditionOperator } from "~/api/types/types";

export interface IRepairsByDepartmentItem
{
    departmentName: string;
    value: number;
}

export interface IUseRepairsByDepartmentResult
{
    data: IRepairsByDepartmentItem[];
    config: ChartConfig;
    filters: IRepairsByDepartmentFilters;
    loading: boolean;
    error: string | null;
    onStartDateChange: (value: string | null) => void;
    onEndDateChange: (value: string | null) => void;
}

export interface IRepairsByDepartmentFilters
{
    startDate: string;
    endDate: string;
}

const REPORT_PAGE_SIZE = 9999;
const REPORT_MAX_PAGES = 20;
const REPORT_ORDER_BY = "departmentName asc";

function toTwoDigits(value: number): string
{
    return String(value).padStart(2, "0");
}

function getCurrentMonthDateRange(): IRepairsByDepartmentFilters
{
    const currentDate = new Date();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();
    const lastDayOfMonth = new Date(year, month, 0).getDate();

    return {
        startDate: `${year}-${toTwoDigits(month)}-01`,
        endDate: `${year}-${toTwoDigits(month)}-${toTwoDigits(lastDayOfMonth)}`,
    };
}

function getErrorMessage(error: unknown): string
{
    if (error instanceof Error && error.message)
    {
        return error.message;
    }

    return "Failed to load repairs by department report";
}

export function useRepairsByDepartment(): IUseRepairsByDepartmentResult
{
    const [data, setData] = useState<IRepairsByDepartmentItem[]>([]);
    const defaultDateRange = useMemo<IRepairsByDepartmentFilters>(() => getCurrentMonthDateRange(), []);
    const [startDate, setStartDate] = useState<string>(defaultDateRange.startDate);
    const [endDate, setEndDate] = useState<string>(defaultDateRange.endDate);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const filters = useMemo<IRepairsByDepartmentFilters>(() =>
    {
        return {
            startDate,
            endDate,
        };
    }, [startDate, endDate]);

    useEffect(() =>
    {
        let isMounted = true;

        async function fetchData()
        {
            setLoading(true);
            setError(null);

            try
            {
                if (!filters.startDate || !filters.endDate)
                {
                    throw new Error("Please select both start and end dates.");
                }

                if (filters.startDate > filters.endDate)
                {
                    throw new Error("Start date cannot be after end date.");
                }

                const mappedData: IRepairsByDepartmentItem[] = [];
                let currentPage = 1;
                let hasNext = true;

                while (hasNext && currentPage <= REPORT_MAX_PAGES)
                {
                    const response = await getRepairRequestGroupByDepartmentReport({
                        pageNumber: currentPage,
                        pageSize: REPORT_PAGE_SIZE,
                        orderBy: REPORT_ORDER_BY,
                        deleted: false,
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

                    mappedData.push(...response.data.map((item: IRepairRequestGroupByDepartmentReport) =>
                    {
                        return {
                            departmentName: item.departmentName || "-",
                            value: item.value || 0,
                        };
                    }));
                    hasNext = response.pagination.hasNext;
                    currentPage += 1;
                }

                if (hasNext)
                {
                    throw new Error("Repairs by department report exceeded the page fetch limit.");
                }

                if (isMounted)
                {
                    setData(mappedData);
                }
            }
            catch (error)
            {
                if (isMounted)
                {
                    setData([]);
                    setError(getErrorMessage(error));
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
    }, [filters.endDate, filters.startDate]);

    const config = useMemo<ChartConfig>(() =>
    {
        return {
            value: {
                label: "Repairs",
                color: "var(--chart-1)",
            },
        };
    }, []);

    function onStartDateChange(value: string | null)
    {
        if (value === null)
        {
            return;
        }

        setStartDate(value);
    }

    function onEndDateChange(value: string | null)
    {
        if (value === null)
        {
            return;
        }

        setEndDate(value);
    }

    return {
        data,
        config,
        filters,
        loading,
        error,
        onStartDateChange,
        onEndDateChange,
    };
}
