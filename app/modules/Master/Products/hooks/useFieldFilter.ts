import React from "react";
import type { ISearchCondition } from "~/api/types/types";
import type { IDataTableFilterField, IDataTableFilterOption } from "~/components/Common/DataTable";
import { DATA_TABLE_FILTER_TYPE, SEARCH_OPERATOR } from "~/constants";
import { searchProductTypes } from "~/services/productTypes.service";

interface IProductFilterValues
{
    productType: string;
}

interface IUseFieldFilterProps
{
    searchParams: URLSearchParams;
}

export default function useFieldFilter({ searchParams }: IUseFieldFilterProps)
{
    const [productTypeOptions, setProductTypeOptions] = React.useState<IDataTableFilterOption[]>([]);

    React.useEffect(() =>
    {
        let cancelled = false;

        async function loadOptions()
        {
            try
            {
                const response = await searchProductTypes({
                    deleted: false,
                    orderBy: "name asc",
                    pageNumber: 1,
                    pageSize: 100,
                });

                if (cancelled) return;

                setProductTypeOptions(response.data.map((pt) => ({
                    label: `${pt.code} - ${pt.name}`,
                    value: String(pt.id),
                })));
            }
            catch
            {
                if (!cancelled) setProductTypeOptions([]);
            }
        }

        void loadOptions();
        return () => { cancelled = true; };
    }, []);

    const fieldFilters = React.useMemo<IDataTableFilterField[]>(() => [
        {
            key: "productType",
            label: "Product Type",
            options: productTypeOptions,
            type: DATA_TABLE_FILTER_TYPE.SELECT,
        },
    ], [productTypeOptions]);

    const currentFilters = React.useMemo(() => ({
        productType: searchParams.get("productType") ?? "",
    }), [searchParams]);

    const buildFilterParams = React.useCallback((filters: IProductFilterValues) => ({
        productType: filters.productType,
    }), []);

    const buildFilterSearch = React.useCallback((filters?: Record<string, string>): ISearchCondition[] | undefined =>
    {
        const searchFilters: ISearchCondition[] = [];
        if (filters?.productType?.trim())
        {
            searchFilters.push({
                condition: SEARCH_OPERATOR.EQUAL,
                name: "product_type_id",
                value: filters.productType.trim(),
            });
        }
        return searchFilters.length > 0 ? searchFilters : undefined;
    }, []);

    const normalizeFilters = React.useCallback((filters: Record<string, string>): IProductFilterValues => ({
        productType: filters.productType ?? "",
    }), []);

    return {
        buildFilterParams,
        buildFilterSearch,
        currentFilters,
        currentFiltersRecord: { ...currentFilters },
        fieldFilters,
        normalizeFilters,
        searchTerm: "code,name",
    };
}