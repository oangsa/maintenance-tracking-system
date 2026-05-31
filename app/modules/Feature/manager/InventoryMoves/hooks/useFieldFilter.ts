import React from "react";
import type { ISearchCondition } from "~/api/types/types";
import type { IDataTableFilterField } from "~/components/Common/DataTable";
import { DATA_TABLE_FILTER_TYPE, SEARCH_OPERATOR } from "~/constants";
import { formatJoinedLabel } from "~/lib/formatters";
import { searchParts } from "~/services/parts.service";

const INVENTORY_MOVE_FIELD_FILTER = {
    FIELD_KEY: {
        MOVE_DATE_FROM: "moveDateFrom",
        MOVE_DATE_TO: "moveDateTo",
        PART_ID: "partId",
    },
    LABEL: {
        MOVE_DATE_FROM: "Move Date From",
        MOVE_DATE_TO: "Move Date To",
        PART_ID: "Part",
    },
    PARAM_KEY: {
        MOVE_DATE_FROM: "filterMoveDateFrom",
        MOVE_DATE_TO: "filterMoveDateTo",
        PART_ID: "filterPartId",
    },
    SEARCH_FIELD: {
        MOVE_DATE: "move_date",
        PART_ID: "inventory_move_items_part_id",
    },
    SEARCH_TERM: "move_no",
} as const;

interface IInventoryMoveFilterValues
{
    moveDateFrom: string;
    moveDateTo: string;
    partId: string;
}

interface IUseFieldFilterProps
{
    searchParams: URLSearchParams;
}

interface IPartFilterOption
{
    label: string;
    value: string;
}

function normalizeDateInput(value: string | undefined): string
{
    const normalizedValue = String(value ?? "").trim();

    if (!/^\d{4}-\d{2}-\d{2}$/.test(normalizedValue))
    {
        return "";
    }

    return normalizedValue;
}

function toStartOfDayUtc(value: string): string
{
    return `${value}T00:00:00.000Z`;
}

function toEndOfDayUtc(value: string): string
{
    return `${value}T23:59:59.999Z`;
}

function getFilterValues(searchParams: URLSearchParams): IInventoryMoveFilterValues
{
    return {
        moveDateFrom: searchParams.get(INVENTORY_MOVE_FIELD_FILTER.PARAM_KEY.MOVE_DATE_FROM) ?? "",
        moveDateTo: searchParams.get(INVENTORY_MOVE_FIELD_FILTER.PARAM_KEY.MOVE_DATE_TO) ?? "",
        partId: searchParams.get(INVENTORY_MOVE_FIELD_FILTER.PARAM_KEY.PART_ID) ?? "",
    };
}

function buildFilterParams(filters: IInventoryMoveFilterValues): Record<string, string | undefined>
{
    return {
        [INVENTORY_MOVE_FIELD_FILTER.PARAM_KEY.MOVE_DATE_FROM]: filters.moveDateFrom,
        [INVENTORY_MOVE_FIELD_FILTER.PARAM_KEY.MOVE_DATE_TO]: filters.moveDateTo,
        [INVENTORY_MOVE_FIELD_FILTER.PARAM_KEY.PART_ID]: filters.partId,
    };
}

function buildFilterSearch(filters: Record<string, string> | undefined): ISearchCondition[]
{
    const searchFilters: ISearchCondition[] = [];

    const moveDateFrom = normalizeDateInput(filters?.moveDateFrom);
    const moveDateTo = normalizeDateInput(filters?.moveDateTo);
    const partId = String(filters?.partId ?? "").trim();

    if (moveDateFrom)
    {
        searchFilters.push({
            condition: SEARCH_OPERATOR.GREATEROREQUAL,
            name: INVENTORY_MOVE_FIELD_FILTER.SEARCH_FIELD.MOVE_DATE,
            value: toStartOfDayUtc(moveDateFrom),
        });
    }

    if (moveDateTo)
    {
        searchFilters.push({
            condition: SEARCH_OPERATOR.LESSEROREQUAL,
            name: INVENTORY_MOVE_FIELD_FILTER.SEARCH_FIELD.MOVE_DATE,
            value: toEndOfDayUtc(moveDateTo),
        });
    }

    if (partId)
    {
        searchFilters.push({
            condition: SEARCH_OPERATOR.EQUAL,
            name: INVENTORY_MOVE_FIELD_FILTER.SEARCH_FIELD.PART_ID,
            value: partId,
        });
    }

    return searchFilters;
}

function normalizeFilters(filters: Record<string, string>): IInventoryMoveFilterValues
{
    return {
        moveDateFrom: filters.moveDateFrom ?? "",
        moveDateTo: filters.moveDateTo ?? "",
        partId: filters.partId ?? "",
    };
}

async function getPartFilterValues(): Promise<IPartFilterOption[]>
{
    const response = await searchParts({
        deleted: false,
        orderBy: "code asc",
        pageNumber: 1,
        pageSize: 9999,
    });

    return response.data.map((part) => ({
        label: formatJoinedLabel([part.code, part.name], { fallback: part.name || "-" }),
        value: String(part.id),
    }));
}

export default function useFieldFilter({ searchParams }: IUseFieldFilterProps)
{
    const [partOptions, setPartOptions] = React.useState<IPartFilterOption[]>([]);

    React.useEffect(() =>
    {
        let cancelled = false;

        async function loadPartOptions()
        {
            try
            {
                const options = await getPartFilterValues();

                if (!cancelled)
                {
                    setPartOptions(options);
                }
            }
            catch
            {
                if (!cancelled)
                {
                    setPartOptions([]);
                }
            }
        }

        void loadPartOptions();

        return () =>
        {
            cancelled = true;
        };
    }, []);

    const fieldFilters = React.useMemo<IDataTableFilterField[]>(() => [
        {
            key: INVENTORY_MOVE_FIELD_FILTER.FIELD_KEY.MOVE_DATE_FROM,
            label: INVENTORY_MOVE_FIELD_FILTER.LABEL.MOVE_DATE_FROM,
            type: DATA_TABLE_FILTER_TYPE.DATE,
        },
        {
            key: INVENTORY_MOVE_FIELD_FILTER.FIELD_KEY.MOVE_DATE_TO,
            label: INVENTORY_MOVE_FIELD_FILTER.LABEL.MOVE_DATE_TO,
            type: DATA_TABLE_FILTER_TYPE.DATE,
        },
        {
            key: INVENTORY_MOVE_FIELD_FILTER.FIELD_KEY.PART_ID,
            label: INVENTORY_MOVE_FIELD_FILTER.LABEL.PART_ID,
            options: partOptions,
            type: DATA_TABLE_FILTER_TYPE.SELECT,
        },
    ], [partOptions]);

    const currentFilters = React.useMemo(() => getFilterValues(searchParams), [searchParams]);
    const currentFiltersRecord = React.useMemo<Record<string, string>>(() => ({ ...currentFilters }), [currentFilters]);

    return {
        buildFilterParams,
        buildFilterSearch,
        currentFilters,
        currentFiltersRecord,
        fieldFilters,
        normalizeFilters,
        searchTerm: INVENTORY_MOVE_FIELD_FILTER.SEARCH_TERM,
    };
}

export type { IInventoryMoveFilterValues };
