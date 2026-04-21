import React from "react";
import { type IRepairRequestItemStatusFormValues } from "./helpers";
import { FORM_SECTION_GUTTER, FORM_TYPE, REPAIR_REQUEST_ITEM_STATUS_FORM_ITEM } from "~/constants/formItem.constants";
import type { IFormSection } from "@/components/Common/Form";

interface IUseFormItemResult
{
    formItems: IFormSection<IRepairRequestItemStatusFormValues>[];
}

export function useFormItem(): IUseFormItemResult
{
    const formItems = React.useMemo<IFormSection<IRepairRequestItemStatusFormValues>[]>(() => [
        {
            key: REPAIR_REQUEST_ITEM_STATUS_FORM_ITEM.SECTION_KEY,
            card: true,
            gutter: FORM_SECTION_GUTTER.DEFAULT,
            fields: [
                {
                    key: "code",
                    name: "code",
                    label: REPAIR_REQUEST_ITEM_STATUS_FORM_ITEM.CODE_LABEL,
                    placeholder: REPAIR_REQUEST_ITEM_STATUS_FORM_ITEM.CODE_PLACEHOLDER,
                    required: true,
                    maxLength: 150,
                    showCount: true,
                    type: FORM_TYPE.TEXT,
                    span: 12,
                },
                {
                    key: "name",
                    name: "name",
                    label: REPAIR_REQUEST_ITEM_STATUS_FORM_ITEM.NAME_LABEL,
                    placeholder: REPAIR_REQUEST_ITEM_STATUS_FORM_ITEM.NAME_PLACEHOLDER,
                    required: true,
                    maxLength: 150,
                    showCount: true,
                    type: FORM_TYPE.TEXT,
                    span: 12,
                },
                {
                    key: "isFinal",
                    name: "isFinal",
                    label: REPAIR_REQUEST_ITEM_STATUS_FORM_ITEM.IS_FINAL_LABEL,
                    type: FORM_TYPE.SELECT,
                    span: 12,
                    options: [
                        { label: "True", value: "true" },
                        { label: "False", value: "false" },
                    ],
                },
                {
                    key: "orderSequence",
                    name: "orderSequence",
                    label: REPAIR_REQUEST_ITEM_STATUS_FORM_ITEM.ORDER_SEQUENCE_LABEL,
                    type: FORM_TYPE.NUMBER,
                    span: 12,
                    required: true,
                    min: 0,
                }
            ]
        }
    ], []);

    return { formItems };
}
