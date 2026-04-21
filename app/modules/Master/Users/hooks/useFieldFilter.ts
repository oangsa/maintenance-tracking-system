import React from "react";
import type { ISearchCondition } from "~/api/types/types";
import type { IDataTableFilterField, IDataTableFilterOption } from "~/components/Common/DataTable";
import {
    DATA_TABLE_FILTER_TYPE,
    ROLE_OPTIONS,
    SEARCH_OPERATOR,
    USER_FIELD_FILTER,
} from "~/constants";
import { searchDepartments } from "~/services/departments.service";
import {
    formatDepartmentLabel,
    formatRoleLabel,
} from "./helpers";

interface IUserFilterValues
{
    department: string;
    role: string;
}

interface IUseFieldFilterProps
{
    searchParams: URLSearchParams;
}

function getUserFilterValues(searchParams: URLSearchParams): IUserFilterValues
{
    return {
        department: searchParams.get(USER_FIELD_FILTER.PARAM_KEY.DEPARTMENT) ?? "",
        role: searchParams.get(USER_FIELD_FILTER.PARAM_KEY.ROLE) ?? "",
    };
}

function buildFilterParams(filters: IUserFilterValues): Record<string, string | undefined>
{
    return {
        [USER_FIELD_FILTER.PARAM_KEY.DEPARTMENT]: filters.department,
        [USER_FIELD_FILTER.PARAM_KEY.ROLE]: filters.role,
    };
}

function buildFilterSearch(filters?: Record<string, string>): ISearchCondition[] | undefined
{
    const searchFilters: ISearchCondition[] = [];

    if (filters?.role?.trim())
    {
        searchFilters.push({
            condition: SEARCH_OPERATOR.EQUAL,
            name: USER_FIELD_FILTER.SEARCH_FIELD.ROLE,
            value: filters.role.trim(),
        });
    }

    if (filters?.department?.trim())
    {
        searchFilters.push({
            condition: SEARCH_OPERATOR.EQUAL,
            name: USER_FIELD_FILTER.SEARCH_FIELD.DEPARTMENT_ID,
            value: filters.department.trim(),
        });
    }

    return searchFilters.length > 0 ? searchFilters : undefined;
}

function normalizeFilters(filters: Record<string, string>): IUserFilterValues
{
    return {
        department: filters.department ?? "",
        role: filters.role ?? "",
    };
}

export default function useFieldFilter({ searchParams }: IUseFieldFilterProps)
{
    const [departmentOptions, setDepartmentOptions] = React.useState<IDataTableFilterOption[]>([]);

    React.useEffect(() =>
    {
        let cancelled = false;

        async function loadDepartmentOptions()
        {
            try
            {
                const response = await searchDepartments({
                    deleted: false,
                    orderBy: USER_FIELD_FILTER.DEPARTMENT_OPTION_QUERY.ORDER_BY,
                    pageNumber: USER_FIELD_FILTER.DEPARTMENT_OPTION_QUERY.PAGE_NUMBER,
                    pageSize: USER_FIELD_FILTER.DEPARTMENT_OPTION_QUERY.PAGE_SIZE,
                });

                if (cancelled)
                {
                    return;
                }

                setDepartmentOptions(response.data.map((department) => ({
                    label: formatDepartmentLabel(department.code, department.name) || department.name,
                    value: String(department.id),
                })));
            }
            catch
            {
                if (!cancelled)
                {
                    setDepartmentOptions([]);
                }
            }
        }

        void loadDepartmentOptions();

        return () =>
        {
            cancelled = true;
        };
    }, []);

    const fieldFilters = React.useMemo<IDataTableFilterField[]>(() => [
        {
            key: USER_FIELD_FILTER.FIELD_KEY.ROLE,
            label: USER_FIELD_FILTER.LABEL.ROLE,
            options: ROLE_OPTIONS.map((role) => ({
                label: formatRoleLabel(role),
                value: role,
            })),
            type: DATA_TABLE_FILTER_TYPE.SELECT,
        },
        {
            key: USER_FIELD_FILTER.FIELD_KEY.DEPARTMENT,
            label: USER_FIELD_FILTER.LABEL.DEPARTMENT,
            options: departmentOptions,
            type: DATA_TABLE_FILTER_TYPE.SELECT,
        },
    ], [departmentOptions]);

    const currentFilters = React.useMemo(() => getUserFilterValues(searchParams), [searchParams]);
    const currentFiltersRecord = React.useMemo<Record<string, string>>(() => ({ ...currentFilters }), [currentFilters]);

    return {
        buildFilterParams,
        buildFilterSearch,
        currentFilters,
        currentFiltersRecord,
        fieldFilters,
        normalizeFilters,
        searchTerm: USER_FIELD_FILTER.SEARCH_TERM,
    };
}

export type { IUserFilterValues };
