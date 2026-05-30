import { useEffect, useState } from "react";
import { getTopRepairedProductsReport } from "~/services/repairRequests.service";
import type { 
    ITopRepairedProductsPerformanceReportItem,
    ISearchConditionOperator 
} from "~/api/types/types";

export interface IUseTopRepairedProductsResult {
    data: ITopRepairedProductsPerformanceReportItem[];
    loading: boolean;
    error: string | null;
}

function getCurrentMonthDateRange() {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const lastDay = String(new Date(year, currentDate.getMonth() + 1, 0).getDate()).padStart(2, '0');
    
    return {
        startDate: `${year}-${month}-01`,
        endDate: `${year}-${month}-${lastDay}`,
    };
}

export function useTopRepairedProducts(): IUseTopRepairedProductsResult {
    const [data, setData] = useState<ITopRepairedProductsPerformanceReportItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        async function fetchData() {
            setLoading(true);
            setError(null);

            try {
                const { startDate, endDate } = getCurrentMonthDateRange();
                const response = await getTopRepairedProductsReport({
                    pageNumber: 1,
                    pageSize: 10,
                    search: [
                        {
                            name: "requested_at",
                            condition: "GREATEROREQUAL" as ISearchConditionOperator,
                            value: `${startDate}T00:00:00.000Z`,
                        },
                        {
                            name: "requested_at",
                            condition: "LESSEROREQUAL" as ISearchConditionOperator,
                            value: `${endDate}T23:59:59.999Z`,
                        },
                    ],
                });

                if (isMounted) {
                    const resultData = (response as any).items || (response as any).data || [];
                    setData(resultData);
                }
            }
            catch (err: any) {
                if (isMounted) {
                    setError(err.message || "Failed to load top repaired products");
                }
            }
            finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        fetchData();

        return () => {
            isMounted = false;
        };
    }, []);

    return {
        data,
        loading,
        error,
    };
}