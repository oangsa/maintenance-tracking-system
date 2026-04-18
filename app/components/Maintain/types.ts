import type { ReactNode } from "react";

export interface IFormComponentProps<TValues>
{
    initialValues: TValues;
    loading?: boolean;
    submitting?: boolean;
    onCancel: () => void;
    onSubmit: (values: TValues) => void | Promise<void>;
}

export type TRenderValue<TRecord> = ReactNode | ((record: TRecord) => ReactNode);

export function resolveRenderValue<TRecord>(
    value: TRenderValue<TRecord> | undefined,
    record: TRecord,
): ReactNode | undefined
{
    if (typeof value === "function")
    {
        return (value as (currentRecord: TRecord) => ReactNode)(record);
    }

    return value;
}
