import type { ReactNode } from "react";
import { Link } from "react-router";
import { buttonVariants } from "~/components/ui/button";
import { cn } from "~/lib/utils";

interface IPageHeaderProps
{
    title: ReactNode;
    description?: ReactNode;
    backHref: string;
    backLabel: ReactNode;
    actions?: ReactNode;
}

export default function PageHeader({
    title,
    description,
    backHref,
    backLabel,
    actions,
}: IPageHeaderProps)
{
    return (
        <div className="page-header">
            <div>
                <h1 className="page-title">{title}</h1>

                {description && (
                    <p className="mt-2 text-sm text-muted-foreground">
                        {description}
                    </p>
                )}
            </div>

            <div className="flex gap-2">
                <Link className={cn(buttonVariants({ variant: "outline" }), "!text-foreground hover:!text-foreground")} to={backHref}>
                    {backLabel}
                </Link>
                {actions}
            </div>
        </div>
    );
}
