interface IFormatJoinedLabelOptions
{
    fallback?: string;
    separator?: string;
}

function formatJoinedLabel(values: Array<string | null | undefined>, options: IFormatJoinedLabelOptions = {}): string
{
    const {
        fallback = "-",
        separator = " - ",
    } = options;

    const parts = values
        .map((value) => value?.trim() ?? "")
        .filter(Boolean);

    if (parts.length === 0)
    {
        return fallback;
    }

    return parts.join(separator);
}

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

function formatDepartmentLabel(code?: string | null, name?: string | null, fallback = "-"): string
{
    return formatJoinedLabel([code, name], { fallback });
}

export {
    formatDateTime,
    formatDepartmentLabel,
    formatJoinedLabel,
    formatRequesterLabel,
    formatTitleCase,
};
