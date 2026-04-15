export interface IListSearchParamUpdates
{
    page?: number;
    search?: string;
    extraParams?: Record<string, string | undefined>;
}

export function buildOrderBy(sortBy?: string, sortDir?: "asc" | "desc", fallback = "id asc"): string
{
    if (!sortBy)
    {
        return fallback;
    }

    return `${sortBy} ${sortDir === "desc" ? "desc" : "asc"}`;
}

export function parsePositiveIntegerParam(value: string | null, fallback = 1): number
{
    const parsedValue = Number(value);

    if (!Number.isInteger(parsedValue) || parsedValue < 1)
    {
        return fallback;
    }

    return parsedValue;
}

export function buildListSearchParams(searchParams: URLSearchParams, updates: IListSearchParamUpdates): URLSearchParams
{
    const nextSearchParams = new URLSearchParams(searchParams);

    if (updates.page !== undefined)
    {
        nextSearchParams.set("page", String(Math.max(1, updates.page)));
    }

    if (updates.search !== undefined)
    {
        const normalizedSearch = updates.search.trim();

        if (normalizedSearch)
        {
            nextSearchParams.set("search", normalizedSearch);
        }
        else
        {
            nextSearchParams.delete("search");
        }
    }

    if (updates.extraParams !== undefined)
    {
        for (const [key, value] of Object.entries(updates.extraParams))
        {
            const normalizedValue = value?.trim() ?? "";

            if (normalizedValue)
            {
                nextSearchParams.set(key, normalizedValue);
            }
            else
            {
                nextSearchParams.delete(key);
            }
        }
    }

    return nextSearchParams;
}
