import { useState, useEffect, useMemo } from "react";
import type { ChartConfig } from "@/components/ui/chart";
import { getRepairRequestGroupByDepartmentReport } from "~/services/repairRequests.service";
import type { IRepairRequestGroupByDepartmentReport } from "~/api/types/types";

export interface IRepairsByDepartmentItem
{
    departmentName: string;
    value: number;
}


export function useRepairsByDepartment(): { data: IRepairsByDepartmentItem[], config: ChartConfig }
{
    const [data, setData] = useState<IRepairsByDepartmentItem[]>([]);

    useEffect(() =>
    {
        let isMounted = true;
        async function fetchData()
        {
            try
            {
                const response = await getRepairRequestGroupByDepartmentReport({
                    pageNumber: 1,
                    pageSize: 100,
                    orderBy: "departmentName asc",
                    deleted: false,
                    search: [
                        {
                            name: "requested_at",
                            condition: "GREATEROREQUAL",
                            value: "2000-01-01T00:00:00+07:00"
                        },
                        {
                            name: "requested_at",
                            condition: "LESSEROREQUAL",
                            value: "2099-12-31T23:59:59+07:00"
                        }
                    ]
                });

                if (isMounted && response?.data)
                {
                    const mappedData = response.data.map((item: IRepairRequestGroupByDepartmentReport) => ({
                        departmentName: item.departmentName || "-",
                        value: item.value || 0
                    }));
                    
                    setData(mappedData);
                }
            }
            catch (error)
            {
                console.error("Failed to fetch repairs by department report:", error);
                if (isMounted) 
                {
                    setData([]); 
                }
            }
        }

        fetchData();
        return () =>
        {
            isMounted = false;
        };
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
