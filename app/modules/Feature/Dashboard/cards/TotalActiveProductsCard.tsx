import type { IDashboardCardComponentProps } from "../types";
import MetricSummaryValue from "./MetricSummaryValue";
import { useEffect, useState } from "react";
import { searchProducts } from "@/services/products.service";
import type { ISearchRequest } from "@/api/types/types";

export default function TotalActiveProductsCard({}: IDashboardCardComponentProps)
{
    const [totalActiveProducts, setTotalActiveProducts] = useState<number | null>(null);

    useEffect(() => {
        const fetchTotalActiveProducts = async () => {
            const searchParams: ISearchRequest = {
                pageSize: 9999,
                pageNumber: 1,
            };

            const response = await searchProducts(searchParams);
            setTotalActiveProducts(response.pagination.totalCount);
        };

        fetchTotalActiveProducts();
    }, []);

    return (
        <MetricSummaryValue
            caption="Total Active Products"
            value={totalActiveProducts?.toString() ?? "Loading..."}
        />
    );
}
