import React from "react";
import type { IFormSection } from "~/components/Common/Form";
import { FORM_FIELD_SPAN, FORM_SECTION_GUTTER, FORM_TYPE } from "~/constants";
import { REPAIR_STATUS_FORM_ITEM, type IRepairStatusFormValues } from "./helpers";

interface IUseFormItemResult {
    formItems: IFormSection<IRepairStatusFormValues>[];
}

interface IUseFormItemProps {
    mode: "create" | "edit";
}

export function useFormItem({ mode }: IUseFormItemProps): IUseFormItemResult {
    const formItems = React.useMemo<IFormSection<IRepairStatusFormValues>[]>(() => [
        {
            card: true,
            gutter: FORM_SECTION_GUTTER.DEFAULT,
            fields: [
                {
                    key: "code",
                    label: REPAIR_STATUS_FORM_ITEM.CODE_LABEL,
                    name: "code",
                    placeholder: REPAIR_STATUS_FORM_ITEM.CODE_PLACEHOLDER,
                    editable: mode === "create",
                    required: true,
                    showCount: true,
                    maxLength: 150,
                    span: FORM_FIELD_SPAN.HALF,
                    type: FORM_TYPE.TEXT,
                },
                {
                    key: "name",
                    label: REPAIR_STATUS_FORM_ITEM.NAME_LABEL,
                    name: "name",
                    placeholder: REPAIR_STATUS_FORM_ITEM.NAME_PLACEHOLDER,
                    required: true,
                    showCount: true,
                    maxLength: 150,
                    span: FORM_FIELD_SPAN.HALF,
                    type: FORM_TYPE.TEXT,
                },
            ],
            key: REPAIR_STATUS_FORM_ITEM.SECTION_KEY,
        },
    ], [mode]);

    return { formItems };
}