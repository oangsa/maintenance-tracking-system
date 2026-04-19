import React from "react";
import type { IFormSection } from "~/components/Common/Form";
import { DEPARTMENT_FORM_ITEM, FORM_FIELD_SPAN, FORM_SECTION_GUTTER, FORM_TYPE } from "~/constants";
import type { IDepartmentFormValues } from "./helpers";

interface IUseFormItemResult
{
    formItems: IFormSection<IDepartmentFormValues>[];
}

export function useFormItem(): IUseFormItemResult
{
    const formItems = React.useMemo<IFormSection<IDepartmentFormValues>[]>(() => [
        {
            card: true,
            gutter: FORM_SECTION_GUTTER.DEFAULT,
            fields: [
                {
                    key: "code",
                    label: DEPARTMENT_FORM_ITEM.CODE_LABEL,
                    maxLength: 150,
                    name: "code",
                    placeholder: DEPARTMENT_FORM_ITEM.CODE_PLACEHOLDER,
                    required: true,
                    showCount: true,
                    span: FORM_FIELD_SPAN.HALF,
                    type: FORM_TYPE.TEXT,
                },
                {
                    key: "name",
                    label: DEPARTMENT_FORM_ITEM.NAME_LABEL,
                    maxLength: 150,
                    name: "name",
                    placeholder: DEPARTMENT_FORM_ITEM.NAME_PLACEHOLDER,
                    required: true,
                    showCount: true,
                    span: FORM_FIELD_SPAN.HALF,
                    type: FORM_TYPE.TEXT,
                },
            ],
            key: DEPARTMENT_FORM_ITEM.SECTION_KEY,
        },
    ], []);

    return { formItems };
}
