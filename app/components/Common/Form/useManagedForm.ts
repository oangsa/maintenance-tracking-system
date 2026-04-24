import React from "react";
import {
    useForm,
    type DefaultValues,
    type FieldErrors,
    type FieldValues,
    type Path,
    type Resolver,
    type UseFormSetValue,
} from "react-hook-form";

type TManagedFormPatch<TValues> = Partial<TValues>;

interface ISetFieldValueOptions
{
    shouldDirty?: boolean;
    shouldTouch?: boolean;
    shouldValidate?: boolean;
}

interface IUseManagedFormOptions<TValues extends FieldValues, TErrors>
{
    initialValues: TValues;
    mapErrors: (errors: FieldErrors<TValues>) => TErrors;
    onSubmit: (values: TValues) => void | Promise<void>;
    resolver: unknown;
}

interface IUseManagedFormResult<TValues extends FieldValues, TErrors>
{
    values: TValues;
    errors: TErrors;
    handleFormSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
    clearFieldError: (fieldName: string) => void;
    setFieldValue: <TKey extends keyof TValues>(fieldName: TKey, value: TValues[TKey], options?: ISetFieldValueOptions) => void;
    setFieldValues: (patch: TManagedFormPatch<TValues>, options?: ISetFieldValueOptions) => void;
    formFieldErrors: FieldErrors<TValues>;
}

function toPath<TValues extends FieldValues>(fieldName: string): Path<TValues>
{
    return fieldName as Path<TValues>;
}

function applySetValue<TValues extends FieldValues, TKey extends keyof TValues>(
    setValue: UseFormSetValue<TValues>,
    fieldName: TKey,
    value: TValues[TKey],
    options?: ISetFieldValueOptions,
): void
{
    setValue(toPath<TValues>(String(fieldName)), value as never, {
        shouldDirty: options?.shouldDirty ?? true,
        shouldTouch: options?.shouldTouch ?? true,
        shouldValidate: options?.shouldValidate ?? true,
    });
}

export function useManagedForm<TValues extends FieldValues, TErrors>({
    initialValues,
    mapErrors,
    onSubmit,
    resolver,
}: IUseManagedFormOptions<TValues, TErrors>): IUseManagedFormResult<TValues, TErrors>
{
    const {
        watch,
        reset,
        setValue,
        clearErrors,
        handleSubmit,
        formState,
    } = useForm<TValues>({
        defaultValues: initialValues as DefaultValues<TValues>,
        resolver: resolver as Resolver<TValues>,
    });

    const values = watch();

    React.useEffect(() =>
    {
        reset(initialValues);
    }, [initialValues, reset]);

    const errors = React.useMemo(() => mapErrors(formState.errors), [formState.errors, mapErrors]);

    const clearFieldError = React.useCallback((fieldName: string) =>
    {
        clearErrors(toPath<TValues>(fieldName));
    }, [clearErrors]);

    const setFieldValue = React.useCallback(<TKey extends keyof TValues>(
        fieldName: TKey,
        value: TValues[TKey],
        options?: ISetFieldValueOptions,
    ) =>
    {
        applySetValue(setValue, fieldName, value, options);
        clearErrors(toPath<TValues>(String(fieldName)));
    }, [clearErrors, setValue]);

    const setFieldValues = React.useCallback((patch: TManagedFormPatch<TValues>, options?: ISetFieldValueOptions) =>
    {
        for (const [fieldName, value] of Object.entries(patch))
        {
            applySetValue(setValue, fieldName as keyof TValues, value as TValues[keyof TValues], options);
            clearErrors(toPath<TValues>(fieldName));
        }
    }, [clearErrors, setValue]);

    const submitCallback = React.useMemo(() => handleSubmit(async (submittedValues) =>
    {
        await onSubmit(submittedValues as TValues);
    }), [handleSubmit, onSubmit]);

    const handleFormSubmit = React.useCallback((event: React.FormEvent<HTMLFormElement>) =>
    {
        void submitCallback(event);
    }, [submitCallback]);

    return {
        clearFieldError,
        errors,
        formFieldErrors: formState.errors,
        handleFormSubmit,
        setFieldValue,
        setFieldValues,
        values,
    };
}
