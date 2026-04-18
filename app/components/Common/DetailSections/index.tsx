import type { ReactNode } from "react";
import { cn } from "~/lib/utils";

export interface IDetailSectionField
{
    key?: string;
    label: ReactNode;
    value: ReactNode;
}

export interface IDetailSection
{
    key?: string;
    title: ReactNode;
    fields: IDetailSectionField[];
}

interface IDetailSectionsProps
{
    sections: IDetailSection[];
    className?: string;
    gridClassName?: string;
}

export default function DetailSections({
    sections,
    className,
    gridClassName,
}: IDetailSectionsProps)
{
    return (
        <div className={cn("card", className)}>
            {sections.map((section, sectionIndex) => (
                <div key={section.key ?? String(section.title)}>
                    {sectionIndex > 0 && <div className="my-6 h-px bg-[var(--border)]" />}

                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                            {section.title}
                        </p>

                        <div className={cn("mt-4 grid gap-5 md:grid-cols-2", gridClassName)}>
                            {section.fields.map((field, fieldIndex) => (
                                <div className="rounded-md border border-[var(--border)] bg-[var(--bg-surface)] p-4" key={field.key ?? `${String(section.title)}-${String(field.label)}-${fieldIndex}`}>
                                    <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                                        {field.label}
                                    </div>
                                    <div className="mt-2 text-sm font-medium text-[var(--text-main)]">
                                        {field.value}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
