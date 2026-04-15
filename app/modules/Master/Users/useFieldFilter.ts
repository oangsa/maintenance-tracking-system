import React from "react";
import type { ISearchCondition } from "~/api/types";
import type { IDataTableFilterField, IDataTableFilterOption } from "~/components/Common/DataTable";
import { searchDepartments } from "~/services/departments.service";
import { formatDepartmentLabel, formatRoleLabel, roleOptions } from "./helpers";

interface IUserFilterValues
{
    department: string;
    role: string;
}

interface IUseFieldFilterProps
{
    searchParams: URLSearchParams;
}

const USER_FILTER_PARAM_KEYS = {
    department: "filterDepartment",
    role: "filterRole",
} as const;

const USER_SEARCH_TERM = "name,email";

function getUserFilterValues(searchParams: URLSearchParams): IUserFilterValues
{
    return {
        department: searchParams.get(USER_FILTER_PARAM_KEYS.department) ?? "",
        role: searchParams.get(USER_FILTER_PARAM_KEYS.role) ?? "",
    };
}

function buildFilterParams(filters: IUserFilterValues): Record<string, string | undefined>
{
    return {
        [USER_FILTER_PARAM_KEYS.department]: filters.department,
        [USER_FILTER_PARAM_KEYS.role]: filters.role,
    };
}

function buildFilterSearch(filters?: Record<string, string>): ISearchCondition[] | undefined
{
    const searchFilters: ISearchCondition[] = [];

    if (filters?.role?.trim())
    {
        searchFilters.push({ name: "role", condition: "EQUAL", value: filters.role.trim() });
    }

    if (filters?.department?.trim())
    {
        searchFilters.push({ name: "department_id", condition: "EQUAL", value: filters.department.trim() });
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
                    orderBy: "name asc",
                    pageNumber: 1,
                    pageSize: 100,
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
            key: "role",
            label: "Role",
            options: roleOptions.map((role) => ({
                label: formatRoleLabel(role),
                value: role,
            })),
            type: "select",
        },
        {
            key: "department",
            label: "Department",
            options: departmentOptions,
            type: "select",
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
        searchTerm: USER_SEARCH_TERM,
    };
}

export type { IUserFilterValues };
