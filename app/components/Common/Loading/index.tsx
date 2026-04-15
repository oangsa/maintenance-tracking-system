import { Skeleton } from "~/components/ui/skeleton";

interface ILoadingProps
{
    message?: string;
    size?: "small" | "medium" | "large";
}

interface ITableLoadingProps
{
    colSpan?: number;
}

export default function Loading({ message = "Loading...", size = "medium" }: ILoadingProps)
{
    const sizeMap: Record<string, number> = { small: 24, medium: 40, large: 64 };
    const spinnerSize = sizeMap[size] ?? 40;

    return (
        <div className="flex flex-col items-center justify-center gap-2 p-4">
            <svg
                className="animate-spin text-primary"
                width={spinnerSize}
                height={spinnerSize}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <circle cx="12" cy="12" r="10" opacity="0.25" />
                <path d="M12 2a10 10 0 0 1 10 10" opacity="0.75" />
            </svg>
            {message && <span className="text-sm text-muted-foreground">{message}</span>}
        </div>
    );
}

export function TableLoading({ colSpan = 1 }: ITableLoadingProps)
{
    return (
        <tr>
            <td colSpan={colSpan} className="p-6">
                <div className="flex flex-col items-center gap-2 py-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                    <Skeleton className="h-4 w-3/5" />
                </div>
            </td>
        </tr>
    );
}
