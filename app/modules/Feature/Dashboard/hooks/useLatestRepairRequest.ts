import { useEffect, useMemo, useState } from "react";
import { searchRepairRequests } from "@/services/repairRequests.service";
import type { ISearchRequest } from "@/api/types/types";
import { useUserContext } from "@/providers/UserProvider";

export interface ILatestRepairRequestItem
{
    id: number;
    requestNo: string;
    requesterName: string;
    statusName: string;
    priority: string;
}

export interface IUseLatestRepairRequestResult
{
    data: ILatestRepairRequestItem[];
}

export function useLatestRepairRequest(): IUseLatestRepairRequestResult
{
    const { currentUser, isLoadingUser } = useUserContext();
    const [data, setData] = useState<ILatestRepairRequestItem[]>([]);

    const searchParams = useMemo<ISearchRequest | null>(() =>
    {
        if (isLoadingUser || currentUser === null || currentUser.departmentId === null)
        {
            return null;
        }

        return {
            pageSize: 5,
            pageNumber: 1,
            orderBy: "requested_at desc",
            search: [
                {
                    name: "repair_request_items_department_id",
                    condition: "EQUAL",
                    value: String(currentUser.departmentId),
                },
            ],
        };
    }, [currentUser, isLoadingUser]);

    useEffect(() =>
    {
        let isMounted = true;

        async function loadData()
        {
            if (searchParams === null)
            {
                if (isMounted)
                {
                    setData([]);
                }

                return;
            }

            try
            {
                const response = await searchRepairRequests(searchParams);
                const transformedData: ILatestRepairRequestItem[] = response.data.map((item) => ({
                    id: item.id,
                    requestNo: item.requestNo,
                    requesterName: item.requesterName ?? item.requesterEmail,
                    statusName: item.currentStatusName,
                    priority: item.priority,
                }));

                if (!isMounted)
                {
                    return;
                }

                setData(transformedData);
            }
            catch
            {
                if (isMounted)
                {
                    setData([]);
                }
            }
        }

        void loadData();

        return () =>
        {
            isMounted = false;
        };
    }, [searchParams]);

    return { data };
}
