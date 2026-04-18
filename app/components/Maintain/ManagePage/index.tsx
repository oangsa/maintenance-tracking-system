import type { ReactNode } from "react";
import PageHeader from "~/components/Maintain/PageHeader";

interface IManagePageProps
{
    title: ReactNode;
    description?: ReactNode;
    backHref: string;
    backLabel: ReactNode;
    actions?: ReactNode;
    error?: string;
    children: ReactNode;
}

export default function ManagePage({
    title,
    description,
    backHref,
    backLabel,
    actions,
    error,
    children,
}: IManagePageProps)
{
    return (
        <>
            <PageHeader
                actions={actions}
                backHref={backHref}
                backLabel={backLabel}
                description={description}
                title={title}
            />

            {error && <div className="alert alert-error">{error}</div>}

            {children}
        </>
    );
}
