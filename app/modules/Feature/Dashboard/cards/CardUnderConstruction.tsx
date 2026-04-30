import { FiClock } from "react-icons/fi";

interface ICardUnderConstructionProps
{
    owner: string;
    hint: string;
}

export default function CardUnderConstruction({ owner, hint }: ICardUnderConstructionProps)
{
    return (
        <div className="flex h-full flex-col justify-between gap-4">
            <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                    <FiClock size={12} />
                    <span>Ready for implementation</span>
                </div>
                <p className="text-sm text-muted-foreground">{hint}</p>
            </div>

            <div className="rounded-xl border border-dashed border-border bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
                Owner: {owner}
            </div>
        </div>
    );
}
