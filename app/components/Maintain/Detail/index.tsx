import React from "react";
import Loading from "~/components/Common/Loading";
import type { IDetailSection } from "~/components/Common/DetailSections";
import DetailPage from "~/components/Maintain/DetailPage";
import ErrorCard from "~/components/Maintain/ErrorCard";
import {
    resolveRenderValue,
    type TRenderValue,
} from "~/components/Maintain/types";

interface IDetailProps<TRecord>
{
    title: React.ReactNode;
    description?: React.ReactNode;
    backHref: string;
    backLabel: React.ReactNode;
    id?: string;
    actions?: TRenderValue<TRecord>;
    content?: TRenderValue<TRecord>;
    error?: string;
    loadData: (id: number) => Promise<TRecord>;
    buildSections: (record: TRecord) => IDetailSection[];
    loadingMessage: string;
    invalidIdMessage: string;
    loadErrorMessage: string;
    notFoundMessage: string;
}

export default function Detail<TRecord>({
    title,
    description,
    backHref,
    backLabel,
    id,
    actions,
    content,
    error,
    loadData,
    buildSections,
    loadingMessage,
    invalidIdMessage,
    loadErrorMessage,
    notFoundMessage,
}: IDetailProps<TRecord>)
{
    const loadDataRef = React.useRef(loadData);

    loadDataRef.current = loadData;

    const [record, setRecord] = React.useState<TRecord | null>(null);
    const [loading, setLoading] = React.useState(true);
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
        <DetailPage
            actions={resolveRenderValue(actions, record)}
            backHref={backHref}
            backLabel={backLabel}
            description={description}
            error={pageError || error}
            sections={buildSections(record)}
            title={title}
        >
            {resolveRenderValue(content, record)}
        </DetailPage>
    );
}
