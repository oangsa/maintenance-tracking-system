import type { ReactNode } from "react";
import DetailSections, { type IDetailSection } from "~/components/Common/DetailSections";
import PageHeader from "~/components/Maintain/PageHeader";

interface IDetailPageProps
{
    title: ReactNode;
    description?: ReactNode;
    backHref: string;
    backLabel: ReactNode;
    actions?: ReactNode;
    error?: string;
    sections: IDetailSection[];
    children?: ReactNode;
}

export default function DetailPage({
    title,
    description,
    backHref,
    backLabel,
    actions,
    error,
    sections,
    children,
}: IDetailPageProps)
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

            <DetailSections sections={sections} />

            {children && <div className="mt-6">{children}</div>}
        </>
    );
}
