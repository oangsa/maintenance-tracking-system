import type { ReactNode } from "react";
import { formStyleClassNames } from "~/components/Common/Form/styles";
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
                        <p className={formStyleClassNames.sectionTitle}>
                            {section.title}
                        </p>

                        <div className={cn("mt-4", formStyleClassNames.formGrid, gridClassName)}>
                            {section.fields.map((field, fieldIndex) => (
                                <div className={formStyleClassNames.detailCard} key={field.key ?? `${String(section.title)}-${String(field.label)}-${fieldIndex}`}>
                                    <div className={formStyleClassNames.detailLabel}>
                                        {field.label}
                                    </div>
                                    <div className={formStyleClassNames.detailValue}>
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
