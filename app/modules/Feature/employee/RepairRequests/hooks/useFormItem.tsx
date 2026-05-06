import React from "react";
import type { IFormSection } from "~/components/Common/Form";
import { formStyleClassNames } from "~/components/Common/Form/styles";
import { FORM_FIELD_SPAN, FORM_SECTION_GUTTER, FORM_TYPE, PRIORITY_OPTIONS, REPAIR_REQUEST_FORM_ITEM } from "~/constants";
import { formatTitleCase } from "~/lib/formatters";
import type { IRepairRequestFormValues } from "./helpers";

interface IUseFormItemProps
{
    mode: "create" | "edit";
    departmentLabel: string;
    lineItemsEditor: React.ReactNode;
    requesterLabel: string;
}

interface IUseFormItemResult
{
    formItems: IFormSection<IRepairRequestFormValues>[];
}

export function useFormItem({ mode, departmentLabel, lineItemsEditor, requesterLabel }: IUseFormItemProps): IUseFormItemResult
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
                    render: () => lineItemsEditor,
                    type: FORM_TYPE.CUSTOM,
                },
            ],
            key: REPAIR_REQUEST_FORM_ITEM.SUMMARY_SECTION_KEY,
        },
    ], [departmentLabel, lineItemsEditor, mode, repairRequestPriorityOptions, requesterLabel]);

    return { formItems };
}
