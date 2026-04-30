import type { IDashboardCardComponentProps } from "../types";
import MetricSummaryValue from "./MetricSummaryValue";
import { useEffect, useState } from "react";
import { searchRepairRequests } from "@/services/repairRequests.service";
import type { ISearchRequest } from "@/api/types/types";

export default function UrgentRequestsCard({}: IDashboardCardComponentProps)
{
    const [urgentRequests, setUrgentRequests] = useState<number | null>(null);

    useEffect(() => {
            const fetchUrgentRequests = async () => {
                const searchParams: ISearchRequest = {
                    pageSize: 9999,
                    pageNumber: 1,
                    search: [
                        {
                            name: "priority",
                            condition: "EQUAL",
                            value: "urgent",
                        }
                    ]
                };

                const response = await searchRepairRequests(searchParams);
                setUrgentRequests(response.pagination.totalCount);
            };

            fetchUrgentRequests();
    }, []);
    return (
        <MetricSummaryValue
            caption="Urgent Requests"
            value={urgentRequests?.toString() ?? "Loading..."}
        />
    );
}
