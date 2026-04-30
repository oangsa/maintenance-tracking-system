import React from "react";
import { Skeleton } from "~/components/ui/skeleton";
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "~/components/ui/card";
import { cn } from "~/lib/utils";

interface IDashboardCardProps
{
    title: React.ReactNode;
    description?: React.ReactNode;
    children?: React.ReactNode;
    actions?: React.ReactNode;
    footer?: React.ReactNode;
    loading?: boolean;
    error?: string;
    className?: string;
    bodyClassName?: string;
}

function LoadingBody()
{
    return (
        <div className="space-y-3">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-10 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
        </div>
    );
}

export default function DashboardCard({
    title,
    description,
    children,
    actions,
    footer,
    loading = false,
    error,
    className,
    bodyClassName,
}: IDashboardCardProps)
{
    return (
        <Card className={cn(
            "h-full min-h-32 rounded-2xl",
            className,
        )}>
            <CardHeader className="px-4 pt-4">
                <CardTitle className="truncate text-sm">{title}</CardTitle>
                {description && (
                    <CardDescription className="text-xs">{description}</CardDescription>
                )}
                {actions && (
                    <CardAction>{actions}</CardAction>
                )}
            </CardHeader>

            <CardContent className={cn("flex-1 px-4 pb-4", bodyClassName)}>
                {loading && <LoadingBody />}
                {!loading && error && (
                    <div className="rounded-xl border border-destructive/25 bg-destructive/5 p-3 text-sm text-destructive">
                        {error}
                    </div>
                )}
                {!loading && !error && children}
            </CardContent>

            {footer && (
                <CardFooter className="mt-3 border-t border-border px-4 pt-3 pb-4">
                    {footer}
                </CardFooter>
            )}
        </Card>
    );
}

export type { IDashboardCardProps };
