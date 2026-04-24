import React from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select";
import {
    FORM_LAYOUT,
    FORM_FIELD_SPAN,
    FORM_TYPE,
} from "~/constants";
import { Textarea } from "~/components/ui/textarea";
import { cn } from "~/lib/utils";
import { formStyleClassNames } from "./styles";

type TFormFieldName<TValues> = Extract<keyof TValues, string>;
type TFormErrors<TValues> = Partial<Record<TFormFieldName<TValues>, string>>;
type TConditionalFieldValue<TValues> = boolean | ((context: IFormRenderContext<TValues>) => boolean);
type TValueOf<TObject> = TObject[keyof TObject];

export type TFormFieldType = TValueOf<typeof FORM_TYPE>;
export type TFormFieldSpan = TValueOf<typeof FORM_FIELD_SPAN>;
export type TFormChoiceLayout = TValueOf<typeof FORM_LAYOUT>;
type TFormFieldGutter = readonly [number, number];
type TTextFormFieldType =
    | typeof FORM_TYPE.INPUT
    | typeof FORM_TYPE.TEXT
    | typeof FORM_TYPE.EMAIL
    | typeof FORM_TYPE.PASSWORD
    | typeof FORM_TYPE.URL
    | typeof FORM_TYPE.DATE
    | typeof FORM_TYPE.NUMBER;

export interface IFormRenderContext<TValues>
{
    values: TValues;
    errors: TFormErrors<TValues>;
    disabled: boolean;
    setValue: <TKey extends TFormFieldName<TValues>>(fieldName: TKey, value: TValues[TKey]) => void;
    clearError: (fieldName: string) => void;
}

export interface IFormFieldBase<TValues>
{
    key: string;
    label?: React.ReactNode;
    type: TFormFieldType;
    span?: TFormFieldSpan;
    description?: React.ReactNode;
    required?: boolean;
    controlId?: string;
    controlClassName?: string;
    containerClassName?: string;
    labelClassName?: string;
    descriptionClassName?: string;
    hidden?: TConditionalFieldValue<TValues>;
}

interface IBoundFormFieldBase<TValues> extends IFormFieldBase<TValues>
{
    name: TFormFieldName<TValues>;
    editable?: TConditionalFieldValue<TValues>;
    disabled?: TConditionalFieldValue<TValues>;
}

export interface IFormOption
{
    label: React.ReactNode;
    value: string;
    description?: React.ReactNode;
    disabled?: boolean;
}

export interface ITextFormField<TValues> extends IBoundFormFieldBase<TValues>
{
    type: TTextFormFieldType;
    placeholder?: string;
    autoComplete?: string;
    readOnly?: boolean;
    min?: number | string;
    max?: number | string;
    step?: number | string;
    maxLength?: number;
    showCount?: boolean;
    onBlur?: (context: IFormRenderContext<TValues>) => void;
    onChange?: (value: string, context: IFormRenderContext<TValues>) => void;
    onInput?: React.FormEventHandler<HTMLInputElement>;
}

export interface ITextareaFormField<TValues> extends IBoundFormFieldBase<TValues>
{
    type: typeof FORM_TYPE.TEXTAREA;
    placeholder?: string;
    rows?: number;
    maxLength?: number;
    showCount?: boolean;
    onChange?: (value: string, context: IFormRenderContext<TValues>) => void;
    onInput?: React.FormEventHandler<HTMLTextAreaElement>;
}

export interface ISelectFormField<TValues> extends IBoundFormFieldBase<TValues>
{
    type: typeof FORM_TYPE.SELECT;
    options: IFormOption[];
    placeholder?: string;
    onChange?: (value: string, context: IFormRenderContext<TValues>) => void;
}

interface IChoiceCollectionFormField<TValues> extends IBoundFormFieldBase<TValues>
{
    options: IFormOption[];
    layout?: TFormChoiceLayout;
}

interface IBooleanFormField<TValues> extends IBoundFormFieldBase<TValues>
{
    checkedLabel?: React.ReactNode;
    onChange?: (checked: boolean, context: IFormRenderContext<TValues>) => void;
    uncheckedLabel?: React.ReactNode;
}

export interface ICheckboxFormField<TValues> extends IBooleanFormField<TValues>
{
    type: typeof FORM_TYPE.CHECKBOX;
}

export interface ICheckboxGroupFormField<TValues> extends IChoiceCollectionFormField<TValues>
{
    type: typeof FORM_TYPE.CHECKBOX_GROUP;
    onChange?: (value: string[], context: IFormRenderContext<TValues>) => void;
}

export interface IRadioFormField<TValues> extends IChoiceCollectionFormField<TValues>
{
    type: typeof FORM_TYPE.RADIO;
    onChange?: (value: string, context: IFormRenderContext<TValues>) => void;
}

export interface ISwitchFormField<TValues> extends IBooleanFormField<TValues>
{
    type: typeof FORM_TYPE.SWITCH;
}

export interface IAttachFileFormField<TValues> extends IBoundFormFieldBase<TValues>
{
    accept?: string;
    multiple?: boolean;
    onChange?: (files: File[], context: IFormRenderContext<TValues>) => void;
    renderSelection?: (files: File[], context: IFormRenderContext<TValues>) => React.ReactNode;
    type: typeof FORM_TYPE.ATTACH_FILE;
}

export interface ILookupFormField<TValues> extends IBoundFormFieldBase<TValues>
{
    type: typeof FORM_TYPE.LOOKUP;
    lookupKey: string;
    renderControl: (context: IFormRenderContext<TValues>) => React.ReactNode;
}

export interface ICustomFormField<TValues> extends IFormFieldBase<TValues>
{
    type: typeof FORM_TYPE.CUSTOM;
    render: (context: IFormRenderContext<TValues>) => React.ReactNode;
}

export type IFormField<TValues> =
    | IAttachFileFormField<TValues>
    | ICheckboxFormField<TValues>
    | ICheckboxGroupFormField<TValues>
    | ICustomFormField<TValues>
    | ILookupFormField<TValues>
    | IRadioFormField<TValues>
    | ISelectFormField<TValues>
    | ISwitchFormField<TValues>
    | ITextFormField<TValues>
    | ITextareaFormField<TValues>;
export type IFormSelectOption = IFormOption;

export interface IFormSection<TValues>
{
    key: string;
    title?: React.ReactNode;
    description?: React.ReactNode;
    card?: boolean;
    hidden?: TConditionalFieldValue<TValues>;
    divider?: boolean;
    gutter?: TFormFieldGutter;
    className?: string;
    gridClassName?: string;
    fields: IFormField<TValues>[];
}

interface ICommonFormProps<TValues>
{
    sections: IFormSection<TValues>[];
    values: TValues;
    errors?: TFormErrors<TValues>;
    disabled?: boolean;
    className?: string;
    actions?: React.ReactNode;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
    setValue: <TKey extends TFormFieldName<TValues>>(fieldName: TKey, value: TValues[TKey]) => void;
    clearError?: (fieldName: string) => void;
}

interface IFormActionsProps
{
    onCancel: () => void;
    submitLabel: React.ReactNode;
    cancelLabel?: React.ReactNode;
    submittingLabel?: React.ReactNode;
    submitting?: boolean;
    cancelDisabled?: boolean;
    submitDisabled?: boolean;
    className?: string;
}

function ResolveConditionalValue<TValues>(
    value: TConditionalFieldValue<TValues> | undefined,
    context: IFormRenderContext<TValues>,
): boolean
{
    if (typeof value === "function")
    {
        return value(context);
    }

    return value ?? false;
}

function ResolveFieldId<TValues>(field: IFormFieldBase<TValues>): string
{
    return field.controlId ?? field.key;
}

function ResolveFieldSpanClassName(span?: TFormFieldSpan): string
{
    switch (span)
    {
        case FORM_FIELD_SPAN.QUARTER:
            return formStyleClassNames.fieldSpan6;
        case FORM_FIELD_SPAN.THIRD:
            return formStyleClassNames.fieldSpan8;
        case FORM_FIELD_SPAN.HALF:
            return formStyleClassNames.fieldSpan12;
        case FORM_FIELD_SPAN.FULL:
        default:
            return formStyleClassNames.fieldSpan24;
    }
}

function ResolveChoiceGroupClassName(layout?: TFormChoiceLayout): string
{
    if (layout === FORM_LAYOUT.HORIZONTAL)
    {
        return formStyleClassNames.choiceGroupHorizontal;
    }

    return formStyleClassNames.choiceGroupVertical;
}

function ResolveSectionGridStyle(gutter?: TFormFieldGutter): React.CSSProperties | undefined
{
    if (!gutter)
    {
        return undefined;
    }

    return {
        columnGap: `${gutter[0]}px`,
        rowGap: `${gutter[1]}px`,
    };
}

function ResolveInputType(field: ITextFormField<unknown>): React.HTMLInputTypeAttribute
{
    if (field.type === FORM_TYPE.INPUT)
    {
        return "text";
    }

    return field.type;
}

function NormalizeControlValue(value: unknown): string | number
{
    if (typeof value === "number")
    {
        return value;
    }

    return String(value ?? "");
}

function NormalizeBooleanValue(value: unknown): boolean
{
    return value === true;
}

function NormalizeStringArrayValue(value: unknown): string[]
{
    if (!Array.isArray(value))
    {
        return [];
    }

    return value.filter((entry): entry is string => typeof entry === "string");
}

function NormalizeFilesValue(value: unknown): File[]
{
    if (!Array.isArray(value) || typeof File === "undefined")
    {
        return [];
    }

    return value.filter((entry): entry is File => entry instanceof File);
}

function RenderFieldLabel<TValues>(field: IFormFieldBase<TValues>): React.ReactNode
{
    if (!field.label)
    {
        return null;
    }

    return (
        <Label className={field.labelClassName} htmlFor={ResolveFieldId(field)}>
            {field.label}
            {field.required && <span className="required-marker">*</span>}
        </Label>
    );
}

function RenderBoundFieldError(errorMessage: string | undefined): React.ReactNode
{
    if (!errorMessage)
    {
        return null;
    }

    return <span className="form-error">{errorMessage}</span>;
}

function RenderFieldDescription<TValues>(field: IFormFieldBase<TValues>): React.ReactNode
{
    if (!field.description)
    {
        return null;
    }

    return (
        <span className={cn(formStyleClassNames.fieldDescription, field.descriptionClassName)}>
            {field.description}
        </span>
    );
}

function RenderFieldCount(value: unknown, maxLength?: number, showCount?: boolean): React.ReactNode
{
    if (!showCount || typeof maxLength !== "number")
    {
        return null;
    }

    return (
        <span className={formStyleClassNames.fieldCount}>
            {String(value ?? "").length} / {maxLength}
        </span>
    );
}

function RenderField<TValues>(field: IFormField<TValues>, context: IFormRenderContext<TValues>): React.ReactNode
{
    if (ResolveConditionalValue(field.hidden, context))
    {
        return null;
    }

    if (field.type === FORM_TYPE.CUSTOM)
    {
        return (
            <div className={cn(ResolveFieldSpanClassName(field.span), field.containerClassName)} key={field.key}>
                {field.render(context)}
            </div>
        );
    }

    const resolvedEditable = field.editable === undefined
        ? true
        : ResolveConditionalValue(field.editable, context);
    const resolvedDisabled = context.disabled
        || !resolvedEditable
        || ResolveConditionalValue(field.disabled, context);
    const errorMessage = context.errors[field.name];
    const wrapperClassName = cn(
        ResolveFieldSpanClassName(field.span),
        formStyleClassNames.fieldContainer,
        field.containerClassName,
    );

    if (field.type === FORM_TYPE.LOOKUP)
    {
        return (
            <div className={wrapperClassName} key={field.key}>
                {RenderFieldLabel(field)}
                <div className={field.controlClassName}>
                    {field.renderControl(context)}
                </div>
                {RenderFieldDescription(field)}
                {RenderBoundFieldError(errorMessage)}
            </div>
        );
    }

    if (field.type === FORM_TYPE.CHECKBOX)
    {
        const checked = NormalizeBooleanValue(context.values[field.name]);
        const stateLabel = checked ? field.checkedLabel : field.uncheckedLabel;

        return (
            <div className={wrapperClassName} key={field.key}>
                <Label className={cn(formStyleClassNames.choiceItem, field.labelClassName)} htmlFor={ResolveFieldId(field)}>
                    <Input
                        aria-invalid={Boolean(errorMessage)}
                        checked={checked}
                        className={cn(formStyleClassNames.choiceControl, field.controlClassName)}
                        disabled={resolvedDisabled}
                        id={ResolveFieldId(field)}
                        name={field.name}
                        onChange={(event) =>
                        {
                            const nextChecked = event.target.checked;

                            if (field.onChange)
                            {
                                field.onChange(nextChecked, context);
                                return;
                            }

                            context.setValue(field.name, nextChecked as TValues[typeof field.name]);
                        }}
                        type="checkbox"
                    />
                    <span className={formStyleClassNames.choiceTextBlock}>
                        <span className={formStyleClassNames.choiceLabelText}>
                            {field.label}
                            {field.required && <span className="required-marker">*</span>}
                        </span>
                        {stateLabel && <span className={formStyleClassNames.choiceDescription}>{stateLabel}</span>}
                    </span>
                </Label>
                {RenderFieldDescription(field)}
                {RenderBoundFieldError(errorMessage)}
            </div>
        );
    }

    if (field.type === FORM_TYPE.SWITCH)
    {
        const checked = NormalizeBooleanValue(context.values[field.name]);
        const stateLabel = checked ? field.checkedLabel : field.uncheckedLabel;

        return (
            <div className={wrapperClassName} key={field.key}>
                <Button
                    aria-checked={checked}
                    aria-invalid={Boolean(errorMessage)}
                    className={cn(formStyleClassNames.switchButton, field.controlClassName)}
                    disabled={resolvedDisabled}
                    id={ResolveFieldId(field)}
                    onClick={() =>
                    {
                        const nextChecked = !checked;

                        if (field.onChange)
                        {
                            field.onChange(nextChecked, context);
                            return;
                        }

                        context.setValue(field.name, nextChecked as TValues[typeof field.name]);
                    }}
                    role="switch"
                    type="button"
                    variant="outline"
                >
                    <span className={cn(formStyleClassNames.switchTrack, checked && formStyleClassNames.switchTrackChecked)}>
                        <span className={cn(formStyleClassNames.switchThumb, checked && formStyleClassNames.switchThumbChecked)} />
                    </span>
                    <span className={formStyleClassNames.switchContent}>
                        {field.label && (
                            <span className={formStyleClassNames.switchText}>
                                {field.label}
                                {field.required && <span className="required-marker">*</span>}
                            </span>
                        )}
                        {stateLabel && <span className={formStyleClassNames.switchStateText}>{stateLabel}</span>}
                    </span>
                </Button>
                {RenderFieldDescription(field)}
                {RenderBoundFieldError(errorMessage)}
            </div>
        );
    }

    if (field.type === FORM_TYPE.CHECKBOX_GROUP)
    {
        const selectedValues = NormalizeStringArrayValue(context.values[field.name]);

        return (
            <div className={wrapperClassName} key={field.key}>
                {RenderFieldLabel(field)}
                <div className={ResolveChoiceGroupClassName(field.layout)} role="group">
                    {field.options.map((option) =>
                    {
                        const optionId = `${ResolveFieldId(field)}-${option.value}`;
                        const isChecked = selectedValues.includes(option.value);

                        return (
                            <Label className={formStyleClassNames.choiceItem} htmlFor={optionId} key={option.value}>
                                <Input
                                    aria-invalid={Boolean(errorMessage)}
                                    checked={isChecked}
                                    className={cn(formStyleClassNames.choiceControl, field.controlClassName)}
                                    disabled={resolvedDisabled || option.disabled}
                                    id={optionId}
                                    name={field.name}
                                    onChange={() =>
                                    {
                                        const nextValues = isChecked
                                            ? selectedValues.filter((value) => value !== option.value)
                                            : [...selectedValues, option.value];

                                        if (field.onChange)
                                        {
                                            field.onChange(nextValues, context);
                                            return;
                                        }

                                        context.setValue(field.name, nextValues as TValues[typeof field.name]);
                                    }}
                                    type="checkbox"
                                />
                                <span className={formStyleClassNames.choiceTextBlock}>
                                    <span className={formStyleClassNames.choiceLabelText}>{option.label}</span>
                                    {option.description && <span className={formStyleClassNames.choiceDescription}>{option.description}</span>}
                                </span>
                            </Label>
                        );
                    })}
                </div>
                {RenderFieldDescription(field)}
                {RenderBoundFieldError(errorMessage)}
            </div>
        );
    }

    if (field.type === FORM_TYPE.RADIO)
    {
        const selectedValue = String(context.values[field.name] ?? "");

        return (
            <div className={wrapperClassName} key={field.key}>
                {RenderFieldLabel(field)}
                <div className={ResolveChoiceGroupClassName(field.layout)} role="radiogroup">
                    {field.options.map((option) =>
                    {
                        const optionId = `${ResolveFieldId(field)}-${option.value}`;
                        const isChecked = selectedValue === option.value;

                        return (
                            <Label className={formStyleClassNames.choiceItem} htmlFor={optionId} key={option.value}>
                                <Input
                                    aria-invalid={Boolean(errorMessage)}
                                    checked={isChecked}
                                    className={cn(formStyleClassNames.choiceControl, formStyleClassNames.radioControl, field.controlClassName)}
                                    disabled={resolvedDisabled || option.disabled}
                                    id={optionId}
                                    name={field.name}
                                    onChange={() =>
                                    {
                                        if (field.onChange)
                                        {
                                            field.onChange(option.value, context);
                                            return;
                                        }

                                        context.setValue(field.name, option.value as TValues[typeof field.name]);
                                    }}
                                    type="radio"
                                />
                                <span className={formStyleClassNames.choiceTextBlock}>
                                    <span className={formStyleClassNames.choiceLabelText}>{option.label}</span>
                                    {option.description && <span className={formStyleClassNames.choiceDescription}>{option.description}</span>}
                                </span>
                            </Label>
                        );
                    })}
                </div>
                {RenderFieldDescription(field)}
                {RenderBoundFieldError(errorMessage)}
            </div>
        );
    }

    if (field.type === FORM_TYPE.ATTACH_FILE)
    {
        const selectedFiles = NormalizeFilesValue(context.values[field.name]);

        return (
            <div className={wrapperClassName} key={field.key}>
                {RenderFieldLabel(field)}
                <Input
                    accept={field.accept}
                    aria-invalid={Boolean(errorMessage)}
                    className={cn(formStyleClassNames.fileInput, field.controlClassName)}
                    disabled={resolvedDisabled}
                    id={ResolveFieldId(field)}
                    multiple={field.multiple}
                    name={field.name}
                    onChange={(event) =>
                    {
                        const nextFiles = Array.from(event.target.files ?? []);

                        if (field.onChange)
                        {
                            field.onChange(nextFiles, context);
                            return;
                        }

                        context.setValue(field.name, nextFiles as TValues[typeof field.name]);
                    }}
                    type="file"
                />
                {selectedFiles.length > 0 && (
                    <span className={formStyleClassNames.fileSummary}>
                        {field.renderSelection
                            ? field.renderSelection(selectedFiles, context)
                            : selectedFiles.map((file) => file.name).join(", ")}
                    </span>
                )}
                {RenderFieldDescription(field)}
                {RenderBoundFieldError(errorMessage)}
            </div>
        );
    }

    if (
        field.type === FORM_TYPE.INPUT
        || field.type === FORM_TYPE.TEXT
        || field.type === FORM_TYPE.EMAIL
        || field.type === FORM_TYPE.PASSWORD
        || field.type === FORM_TYPE.URL
        || field.type === FORM_TYPE.DATE
        || field.type === FORM_TYPE.NUMBER
    )
    {
        const resolvedInputType = ResolveInputType(field as ITextFormField<unknown>);

        return (
            <div className={wrapperClassName} key={field.key}>
                {RenderFieldLabel(field)}
                <Input
                    aria-invalid={Boolean(errorMessage)}
                    autoComplete={field.autoComplete}
                    className={field.controlClassName}
                    disabled={resolvedDisabled}
                    id={ResolveFieldId(field)}
                    max={field.max}
                    maxLength={resolvedInputType === "number" ? undefined : field.maxLength}
                    min={field.min}
                    name={field.name}
                    onBlur={() => field.onBlur?.(context)}
                    onChange={(event) =>
                    {
                        if (field.onChange)
                        {
                            field.onChange(event.target.value, context);
                            return;
                        }

                        context.setValue(field.name, event.target.value as TValues[typeof field.name]);
                    }}
                    onInput={field.onInput}
                    placeholder={field.placeholder}
                    readOnly={field.readOnly}
                    step={field.step}
                    type={resolvedInputType}
                    value={NormalizeControlValue(context.values[field.name])}
                />
                {RenderFieldDescription(field)}
                {RenderFieldCount(context.values[field.name], field.maxLength, field.showCount)}
                {RenderBoundFieldError(errorMessage)}
            </div>
        );
    }

    if (field.type === FORM_TYPE.TEXTAREA)
    {
        return (
            <div className={wrapperClassName} key={field.key}>
                {RenderFieldLabel(field)}
                <Textarea
                    aria-invalid={Boolean(errorMessage)}
                    className={field.controlClassName}
                    disabled={resolvedDisabled}
                    id={ResolveFieldId(field)}
                    maxLength={field.maxLength}
                    name={field.name}
                    onChange={(event) =>
                    {
                        if (field.onChange)
                        {
                            field.onChange(event.target.value, context);
                            return;
                        }

                        context.setValue(field.name, event.target.value as TValues[typeof field.name]);
                    }}
                    onInput={field.onInput}
                    placeholder={field.placeholder}
                    rows={field.rows}
                    value={NormalizeControlValue(context.values[field.name])}
                />
                {RenderFieldDescription(field)}
                {RenderFieldCount(context.values[field.name], field.maxLength, field.showCount)}
                {RenderBoundFieldError(errorMessage)}
            </div>
        );
    }

    if (field.type === FORM_TYPE.SELECT)
    {
        return (
            <div className={wrapperClassName} key={field.key}>
                {RenderFieldLabel(field)}
                <Select
                    onValueChange={(value) =>
                    {
                        if (field.onChange)
                        {
                            if (value === null)
                            {
                                return;
                            }

                            field.onChange(value, context);
                            return;
                        }

                        if (value === null)
                        {
                            return;
                        }

                        context.setValue(field.name, value as TValues[typeof field.name]);
                    }}
                    value={String(context.values[field.name] ?? "")}
                >
                    <SelectTrigger
                        aria-invalid={Boolean(errorMessage)}
                        className={cn(formStyleClassNames.selectTrigger, field.controlClassName)}
                        disabled={resolvedDisabled}
                        id={ResolveFieldId(field)}
                    >
                        <SelectValue placeholder={field.placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                        {field.options.map((option: IFormOption) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {RenderFieldDescription(field)}
                {RenderBoundFieldError(errorMessage)}
            </div>
        );
    }

    return null;
}

export function FormActions({
    onCancel,
    submitLabel,
    cancelLabel = "Cancel",
    submittingLabel,
    submitting = false,
    cancelDisabled = false,
    submitDisabled = false,
    className,
}: IFormActionsProps)
{
    return (
        <div className={cn(formStyleClassNames.actions, className)}>
            <Button
                disabled={cancelDisabled}
                onClick={onCancel}
                type="button"
                variant="outline"
            >
                {cancelLabel}
            </Button>
            <Button disabled={submitDisabled} type="submit">
                {submitting && submittingLabel ? submittingLabel : submitLabel}
            </Button>
        </div>
    );
}

export default function CommonForm<TValues>({
    sections,
    values,
    errors,
    disabled = false,
    className,
    actions,
    onSubmit,
    setValue,
    clearError,
}: ICommonFormProps<TValues>)
{
    const context = React.useMemo<IFormRenderContext<TValues>>(() => ({
        clearError: clearError ?? (() => undefined),
        disabled,
        errors: errors ?? {},
        setValue,
        values,
    }), [clearError, disabled, errors, setValue, values]);

    return (
        <form className={cn(formStyleClassNames.form, className)} onSubmit={onSubmit}>
            {sections.map((section) =>
            {
                if (ResolveConditionalValue(section.hidden, context))
                {
                    return null;
                }

                const content = (
                    <>
                        {(section.title || section.description) && (
                            <div className={formStyleClassNames.sectionHeading}>
                                {section.title && (
                                    <p className={formStyleClassNames.sectionTitle}>
                                        {section.title}
                                    </p>
                                )}
                                {section.description && (
                                    <p className={formStyleClassNames.sectionDescription}>
                                        {section.description}
                                    </p>
                                )}
                            </div>
                        )}

                        <div
                            className={cn(formStyleClassNames.sectionGrid, section.gridClassName)}
                            style={ResolveSectionGridStyle(section.gutter)}
                        >
                            {section.fields.map((field) => RenderField(field, context))}
                        </div>
                    </>
                );

                return (
                    <React.Fragment key={section.key}>
                        {section.card
                            ? (
                                <div className={cn("card", section.className)}>
                                    {content}
                                </div>
                            )
                            : (
                                <div className={section.className}>
                                    {content}
                                </div>
                            )}

                        {section.divider && <div className={formStyleClassNames.sectionDivider} />}
                    </React.Fragment>
                );
            })}

            {actions}
        </form>
    );
}
