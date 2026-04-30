import { useMemo } from "react";
import type { ChartConfig } from "@/components/ui/chart";

export interface IRepairsByDepartmentItem
{
    departmentName: string;
    value: number;
}

const mockRepairsByDepartmentData: IRepairsByDepartmentItem[] = [
    {
        departmentName: "IT Support",
        value: 15,
    },
    {
        departmentName: "Facilities",
        value: 9,
    },
    {
        departmentName: "Engineering",
        value: 6,
    },
];

export function useRepairsByDepartment(): { data: IRepairsByDepartmentItem[], config: ChartConfig }
{
    const data = useMemo<IRepairsByDepartmentItem[]>(() =>
    {
        return mockRepairsByDepartmentData;
    }, []);

    const config = useMemo<ChartConfig>(() =>
    {
        return {
            value: {
                label: "Repairs",
                color: "var(--chart-1)",
            },
        };
    }, []);

    return { data, config };
}
