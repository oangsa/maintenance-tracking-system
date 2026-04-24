import React from "react";
import type { IFormSection } from "~/components/Common/Form";
import { formStyleClassNames } from "~/components/Common/Form/styles";
import LineItemsEditor, { type ILineItemColumn } from "~/components/Common/LineItemsEditor";
import { FORM_FIELD_SPAN, FORM_SECTION_GUTTER, FORM_TYPE, PRIORITY_OPTIONS, REPAIR_REQUEST_FORM_ITEM } from "~/constants";
import { formatTitleCase } from "~/lib/formatters";
import { createEmptyRepairRequestLineItem, type IRepairRequestFormLineItem, type IRepairRequestFormValues } from "./helpers";

interface IUseFormItemProps<TPickerRow extends Record<string, unknown>>
{
    mode: "create" | "edit";
    departmentLabel: string;
    itemIssues: string[];
    items: IRepairRequestFormLineItem[];
    itemsError?: string;
    lineItemColumns: ILineItemColumn<IRepairRequestFormLineItem, TPickerRow>[];
    onItemsChange: (items: IRepairRequestFormLineItem[]) => void;
    requesterLabel: string;
}

interface IUseFormItemResult
{
    formItems: IFormSection<IRepairRequestFormValues>[];
}

export function useFormItem<TPickerRow extends Record<string, unknown>>({
    mode,
    departmentLabel,
    itemIssues,
    items,
    itemsError,
    lineItemColumns,
    onItemsChange,
    requesterLabel,
}: IUseFormItemProps<TPickerRow>): IUseFormItemResult
{
    const repairRequestPriorityOptions = React.useMemo(() => PRIORITY_OPTIONS.map((priorityOption) => ({
        label: formatTitleCase(priorityOption),
        value: priorityOption,
    })), []);

    const formItems = React.useMemo<IFormSection<IRepairRequestFormValues>[]>(() => [
        {
            card: true,
            gutter: FORM_SECTION_GUTTER.DEFAULT,
            fields: [
                {
                    containerClassName: formStyleClassNames.detailCard,
                    key: "requester",
                    span: FORM_FIELD_SPAN.THIRD,
                    render: () => (
                        <>
                            <p className={formStyleClassNames.detailLabel}>
                                {REPAIR_REQUEST_FORM_ITEM.REQUESTER_LABEL}
                            </p>
                            <p className={formStyleClassNames.detailValue}>
                                {requesterLabel}
                            </p>
                        </>
                    ),
                    type: FORM_TYPE.CUSTOM,
                },
                {
                    containerClassName: formStyleClassNames.detailCard,
                    key: "department",
                    span: FORM_FIELD_SPAN.THIRD,
                    render: () => (
                        <>
                            <p className={formStyleClassNames.detailLabel}>
                                {REPAIR_REQUEST_FORM_ITEM.DEPARTMENT_LABEL}
                            </p>
                            <p className={formStyleClassNames.detailValue}>
                                {departmentLabel}
                            </p>
                        </>
                    ),
                    type: FORM_TYPE.CUSTOM,
                },
                {
                    containerClassName: formStyleClassNames.detailCard,
                    key: "priority",
                    label: REPAIR_REQUEST_FORM_ITEM.PRIORITY_LABEL,
                    labelClassName: formStyleClassNames.detailLabel,
                    name: "priority",
                    options: repairRequestPriorityOptions,
                    required: true,
                    editable: mode === "create",
                    span: FORM_FIELD_SPAN.THIRD,
                    type: FORM_TYPE.SELECT,
                },
            ],
            key: REPAIR_REQUEST_FORM_ITEM.REQUEST_INFORMATION_SECTION_KEY,
            title: REPAIR_REQUEST_FORM_ITEM.REQUEST_INFORMATION_TITLE,
        },
        {
            gridClassName: formStyleClassNames.lineItemGrid,
            fields: [
                {
                    containerClassName: formStyleClassNames.lineItemSection,
                    key: "line-items",
                    span: FORM_FIELD_SPAN.FULL,
                    render: (context) => (
                        <>
                            <LineItemsEditor<IRepairRequestFormLineItem, TPickerRow>
                                addButtonLabel={REPAIR_REQUEST_FORM_ITEM.ADD_PRODUCT}
                                columns={lineItemColumns}
                                createEmptyItem={createEmptyRepairRequestLineItem}
                                disabled={context.disabled}
                                emptyMessage={REPAIR_REQUEST_FORM_ITEM.EMPTY_ITEMS}
                                itemLabel={REPAIR_REQUEST_FORM_ITEM.PRODUCT_ITEM_LABEL}
                                onChange={onItemsChange}
                                title={REPAIR_REQUEST_FORM_ITEM.ITEMS_TITLE}
                                value={items}
                            />

                            {itemsError && <div className="form-error">{itemsError}</div>}
                            {itemIssues.length > 0 && (
                                <div className={formStyleClassNames.lineItemErrors}>
                                    {itemIssues.map((issue) => (
                                        <p key={issue}>{issue}</p>
                                    ))}
                                </div>
                            )}
                        </>
                    ),
                    type: FORM_TYPE.CUSTOM,
                },
            ],
            key: REPAIR_REQUEST_FORM_ITEM.SUMMARY_SECTION_KEY,
        },
    ], [departmentLabel, itemIssues, items, itemsError, lineItemColumns, mode, onItemsChange, repairRequestPriorityOptions, requesterLabel]);

    return { formItems };
}
