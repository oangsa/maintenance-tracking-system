import type { IRepairRequestItem } from "~/api/types";

function formatDateTime(value?: string | null): string
{
    if (!value)
    {
        return "-";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime()))
    {
        return value;
    }

    return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}

function formatTitleCase(value?: string | null): string
{
    if (!value)
    {
        return "-";
    }

    return value
        .split(/[_\s-]+/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(" ");
}

function formatRequesterLabel(name?: string | null, email?: string | null): string
{
    if (name?.trim())
    {
        return name.trim();
    }

    if (email?.trim())
    {
        return email.trim();
    }

    return "-";
}

function formatRepairStatusLabel(item: IRepairRequestItem): string
{
    if (item.repairStatusName?.trim())
    {
        return item.repairStatusName.trim();
    }

    if (item.repairStatusCode?.trim())
    {
        return formatTitleCase(item.repairStatusCode);
    }

    return "-";
}

function formatProductLabel(item: IRepairRequestItem): string
{
    const parts = [item.productCode, item.productName]
        .map((value) => value?.trim() ?? "")
        .filter(Boolean);

    if (parts.length === 0)
    {
        return "-";
    }

    return parts.join(" - ");
}

export {
    formatDateTime,
    formatProductLabel,
    formatRepairStatusLabel,
    formatRequesterLabel,
    formatTitleCase,
};
