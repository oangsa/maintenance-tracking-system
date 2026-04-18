import type { ReactNode } from "react";
import { Link } from "react-router";
import { buttonVariants } from "~/components/ui/button";
import { cn } from "~/lib/utils";

interface IErrorCardProps
{
    message: ReactNode;
    backHref: string;
    backLabel: ReactNode;
}

export default function ErrorCard({
    message,
    backHref,
    backLabel,
}: IErrorCardProps)
{
    return (
        <div className="card">
            <div className="alert alert-error">{message}</div>
            <Link className={cn(buttonVariants({ variant: "outline" }), "!text-foreground hover:!text-foreground")} to={backHref}>
                {backLabel}
            </Link>
        </div>
    );
}
