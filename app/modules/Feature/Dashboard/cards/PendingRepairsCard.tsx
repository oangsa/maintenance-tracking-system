import type { IDashboardCardComponentProps } from "../types";
import MetricSummaryValue from "./MetricSummaryValue";
import { useEffect, useState } from "react";
import { searchRepairRequests } from "@/services/repairRequests.service";
import type { ISearchRequest } from "@/api/types/types";

export default function PendingRepairsCard({}: IDashboardCardComponentProps)
{
    const [pendingRepairs, setPendingRepairs] = useState<number | null>(null);

    useEffect(() => {
        const fetchPendingRepairs = async () => {
            const searchParams: ISearchRequest = {
                pageSize: 9999,
                pageNumber: 1,
                search: [
                    {
                        name: "current_status_code",
                        condition: "NOTEQUAL",
                        value: "COMPLETED",
                    },
                    {
                        name: "current_status_code",
                        condition: "NOTEQUAL",
                        value: "CANCELLED",
                    },
                    {
                        name: "current_status_code",
                        condition: "NOTEQUAL",
                        value: "READY",
                    },
                    {
                        name: "current_status_code",
                        condition: "NOTEQUAL",
                        value: "REJECTED",
                    },
                ]
            };

            const response = await searchRepairRequests(searchParams);
            setPendingRepairs(response.pagination.totalCount);
        };

        fetchPendingRepairs();
    }, []);

    return (
        <MetricSummaryValue
            caption="Ongoing Repair Requests"
            value={pendingRepairs?.toString() ?? "Loading..."}
        />
    );
}
