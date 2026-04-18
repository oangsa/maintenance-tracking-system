import React from "react";
import Loading from "~/components/Common/Loading";
import ManagePage from "~/components/Maintain/ManagePage";
import type { IFormComponentProps } from "~/components/Maintain/types";

interface ICreateProps<TValues, TExtraFormProps extends object = Record<string, never>>
{
    title: React.ReactNode;
    description?: React.ReactNode;
    backHref: string;
    backLabel: React.ReactNode;
    actions?: React.ReactNode;
    Form: React.ComponentType<IFormComponentProps<TValues> & TExtraFormProps>;
    formProps?: TExtraFormProps;
    initialValues: TValues;
    loading?: boolean;
    loadingMessage?: string;
    error?: string;
    fallback?: React.ReactNode;
    onCancel: () => void;
    onSubmit: (values: TValues) => void | Promise<void>;
    submitErrorMessage: string;
}

export default function Create<TValues, TExtraFormProps extends object = Record<string, never>>({
    title,
    description,
    backHref,
    backLabel,
    actions,
    Form,
    formProps,
    initialValues,
    loading = false,
    loadingMessage = "Loading form...",
    error,
    fallback,
    onCancel,
    onSubmit,
    submitErrorMessage,
}: ICreateProps<TValues, TExtraFormProps>)
{
    const [submitting, setSubmitting] = React.useState(false);
    const [submitError, setSubmitError] = React.useState("");

    async function handleSubmit(values: TValues)
    {
        setSubmitting(true);
        setSubmitError("");

        try
        {
            await onSubmit(values);
        }
        catch (currentError)
        {
            setSubmitError((currentError as Error).message || submitErrorMessage);
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

    if (fallback)
    {
        return <>{fallback}</>;
    }

    const resolvedFormProps = (formProps ?? {}) as TExtraFormProps;

    return (
        <ManagePage
            actions={actions}
            backHref={backHref}
            backLabel={backLabel}
            description={description}
            error={submitError || error}
            title={title}
        >
            <Form
                {...resolvedFormProps}
                initialValues={initialValues}
                onCancel={onCancel}
                onSubmit={handleSubmit}
                submitting={submitting}
            />
        </ManagePage>
    );
}
