import React from "react";
import type { ISearchCondition } from "~/api/types/types";
import type { IDataTableFilterField, IDataTableFilterOption } from "~/components/Common/DataTable";
import { DATA_TABLE_FILTER_TYPE, SEARCH_OPERATOR } from "~/constants";
import { searchDepartments } from "~/services/departments.service";

interface IProductTypeFilterValues
{
    department: string;
}

interface IUseFieldFilterProps
{
    searchParams: URLSearchParams;
}

export default function useFieldFilter({ searchParams }: IUseFieldFilterProps)
{
    const [departmentOptions, setDepartmentOptions] = React.useState<IDataTableFilterOption[]>([]);

    React.useEffect(() =>
    {
        let cancelled = false;

        async function loadOptions()
        {
            try
            {
                const response = await searchDepartments({
                    deleted: false,
                    orderBy: "name asc",
                    pageNumber: 1,
                    pageSize: 100,
                });

                if (cancelled) return;

                setDepartmentOptions(response.data.map((d) => ({
                    label: `${d.code} - ${d.name}`,
                    value: String(d.id),
                })));
            }
            catch
            {
                if (!cancelled) setDepartmentOptions([]);
            }
        }

        void loadOptions();
        return () => { cancelled = true; };
    }, []);

    const fieldFilters = React.useMemo<IDataTableFilterField[]>(() => [
        {
            key: "department",
            label: "Department",
            options: departmentOptions,
            type: DATA_TABLE_FILTER_TYPE.SELECT,
        },
    ], [departmentOptions]);

    const currentFilters = React.useMemo(() => ({
        department: searchParams.get("department") ?? "",
    }), [searchParams]);

    const buildFilterParams = React.useCallback((filters: IProductTypeFilterValues) => ({
        department: filters.department,
    }), []);

    const buildFilterSearch = React.useCallback((filters?: Record<string, string>): ISearchCondition[] | undefined =>
    {
        const searchFilters: ISearchCondition[] = [];
        if (filters?.department?.trim())
        {
            searchFilters.push({
                condition: SEARCH_OPERATOR.EQUAL,
                name: "department_id",
                value: filters.department.trim(),
            });
        }
        return searchFilters.length > 0 ? searchFilters : undefined;
    }, []);

    const normalizeFilters = React.useCallback((filters: Record<string, string>): IProductTypeFilterValues => ({
        department: filters.department ?? "",
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