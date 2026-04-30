import { useEffect, useMemo, useState } from "react";
import { getRepairRequestCountGroupByStatus } from "@/services/repairRequests.service";
import type { ChartConfig } from "@/components/ui/chart";
import type { ISearchRequest } from "@/api/types/types";

export interface IRepairStatusBreakdownItem
{
    statusName: string;
    value: number;
    fill: string;
}

export function useRepairStatusBreakDown(): { data: IRepairStatusBreakdownItem[], config: ChartConfig }
{
    const [data, setData] = useState<IRepairStatusBreakdownItem[]>([]);

    useEffect(() =>
    {
        let isMounted = true;

        async function loadData()
        {
            const searchParams: ISearchRequest = {
                pageSize: 9999,
                pageNumber: 1,
            };

            const response = await getRepairRequestCountGroupByStatus(searchParams);
            const transformedData: IRepairStatusBreakdownItem[] = response.data.map((item, index) => ({
                statusName: item.statusName,
                value: item.value,
                fill: `var(--chart-${(index % 4) + 1})`,
            }));

            if (!isMounted)
            {
                return;
            }

            setData(transformedData);
        }

        void loadData()

        return () =>
        {
            isMounted = false;
        };
    }, []);

    const config = useMemo<ChartConfig>(() =>
    {
        return data.reduce<ChartConfig>((currentConfig, item) =>
        {
            currentConfig[item.statusName] = {
                label: item.statusName,
                color: item.fill,
            };

            return currentConfig;
        }, {});
    }, [data]);

    return { data, config };
}
