interface IMetricSummaryValueProps
{
    value: string;
    caption: string;
}

export default function MetricSummaryValue({ value, caption }: IMetricSummaryValueProps)
{
    return (
        <div className="flex h-full flex-col justify-end gap-1">
            <p className="text-3xl font-bold tracking-tight text-card-foreground">{value}</p>
            <p className="text-xs text-muted-foreground">{caption}</p>
        </div>
    );
}
