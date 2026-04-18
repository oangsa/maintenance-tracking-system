import React from "react";
import Loading from "~/components/Common/Loading";
import ErrorCard from "~/components/Maintain/ErrorCard";
import ManagePage from "~/components/Maintain/ManagePage";
import {
    resolveRenderValue,
    type IFormComponentProps,
    type TRenderValue,
} from "~/components/Maintain/types";

type TEditFormPropsResolver<TRecord, TExtraFormProps extends object> = TExtraFormProps | ((record: TRecord) => TExtraFormProps);

interface IEditProps<TRecord, TValues, TExtraFormProps extends object = Record<string, never>>
{
    title: React.ReactNode;
    description?: React.ReactNode;
    backHref: string;
    backLabel: React.ReactNode;
    id?: string;
    actions?: TRenderValue<TRecord>;
    error?: string;
    Form: React.ComponentType<IFormComponentProps<TValues> & TExtraFormProps>;
    formProps?: TEditFormPropsResolver<TRecord, TExtraFormProps>;
    loadData: (id: number) => Promise<TRecord>;
    mapDataToInitialValues: (record: TRecord) => TValues;
    onCancel: () => void;
    onSubmit: (context: { id: number; record: TRecord; values: TValues }) => void | Promise<void>;
    loadingMessage: string;
    invalidIdMessage: string;
    loadErrorMessage: string;
    notFoundMessage: string;
    submitErrorMessage: string;
}

function resolveFormProps<TRecord, TExtraFormProps extends object>(
    formProps: TEditFormPropsResolver<TRecord, TExtraFormProps> | undefined,
    record: TRecord,
): TExtraFormProps
{
    if (typeof formProps === "function")
    {
        return (formProps as (currentRecord: TRecord) => TExtraFormProps)(record);
    }

    return (formProps ?? {}) as TExtraFormProps;
}

export default function Edit<TRecord, TValues, TExtraFormProps extends object = Record<string, never>>({
    title,
    description,
    backHref,
    backLabel,
    id,
    actions,
    error,
    Form,
    formProps,
    loadData,
    mapDataToInitialValues,
    onCancel,
    onSubmit,
    loadingMessage,
    invalidIdMessage,
    loadErrorMessage,
    notFoundMessage,
    submitErrorMessage,
}: IEditProps<TRecord, TValues, TExtraFormProps>)
{
    const loadDataRef = React.useRef(loadData);

    loadDataRef.current = loadData;

    const [record, setRecord] = React.useState<TRecord | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [submitting, setSubmitting] = React.useState(false);
    const [pageError, setPageError] = React.useState("");

    React.useEffect(() =>
    {
        let cancelled = false;
        const parsedId = Number(id);

        setRecord(null);

        if (!Number.isFinite(parsedId))
        {
            setLoading(false);
            setPageError(invalidIdMessage);

            return () =>
            {
                cancelled = true;
            };
        }

        setLoading(true);
        setPageError("");

        async function loadRecord()
        {
            try
            {
                const response = await loadDataRef.current(parsedId);

                if (!cancelled)
                {
                    setRecord(response);
                }
            }
            catch (currentError)
            {
                if (!cancelled)
                {
                    setPageError((currentError as Error).message || loadErrorMessage);
                }
            }
            finally
            {
                if (!cancelled)
                {
                    setLoading(false);
                }
            }
        }

        void loadRecord();

        return () =>
        {
            cancelled = true;
        };
    }, [id, invalidIdMessage, loadErrorMessage]);

    async function handleSubmit(values: TValues)
    {
        const parsedId = Number(id);

        if (!Number.isFinite(parsedId))
        {
            setPageError(invalidIdMessage);
            return;
        }

        if (record === null)
        {
            setPageError(notFoundMessage);
            return;
        }

        setSubmitting(true);
        setPageError("");

        try
        {
            await onSubmit({
                id: parsedId,
                record,
                values,
            });
        }
        catch (currentError)
        {
            setPageError((currentError as Error).message || submitErrorMessage);
        }
        finally
        {
            setSubmitting(false);
        }
    }

    if (loading)
    {
        return <Loading message={loadingMessage} />;
    }

    if (record === null)
    {
        return (
            <ErrorCard
                backHref={backHref}
                backLabel={backLabel}
                message={pageError || error || notFoundMessage}
            />
        );
    }

    return (
        <ManagePage
            actions={resolveRenderValue(actions, record)}
            backHref={backHref}
            backLabel={backLabel}
            description={description}
            error={pageError || error}
            title={title}
        >
            <Form
                {...resolveFormProps(formProps, record)}
                initialValues={mapDataToInitialValues(record)}
                onCancel={onCancel}
                onSubmit={handleSubmit}
                submitting={submitting}
            />
        </ManagePage>
    );
}
