import React from "react";
import type { IFormSection } from "~/components/Common/Form";
import { formStyleClassNames } from "~/components/Common/Form/styles";
import { FORM_FIELD_SPAN, FORM_LAYOUT, FORM_SECTION_GUTTER, FORM_TYPE, ROLE_OPTIONS, USER_FORM_ITEM } from "~/constants";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
    formatDepartmentLabel,
    formatRoleLabel,
} from "./helpers";
import type { IUserFormValues } from "./helpers";

interface IUseFormItemProps
{
    mode: "create" | "edit";
    onClearDepartment: () => void;
    onOpenDepartmentLookup: () => void;
}

interface IUseFormItemResult
{
    formItems: IFormSection<IUserFormValues>[];
}

export function useFormItem({ mode, onClearDepartment, onOpenDepartmentLookup }: IUseFormItemProps): IUseFormItemResult
{
    const userFormRoleOptions = React.useMemo(() => ROLE_OPTIONS.map((roleOption) => ({
        label: formatRoleLabel(roleOption),
        value: roleOption,
    })), []);

    const formItems = React.useMemo<IFormSection<IUserFormValues>[]>(() => [
        {
            gutter: FORM_SECTION_GUTTER.DEFAULT,
            card: true,
            fields: [
                {
                    key: "name",
                    label: USER_FORM_ITEM.NAME_LABEL,
                    maxLength: 150,
                    name: "name",
                    placeholder: USER_FORM_ITEM.NAME_PLACEHOLDER,
                    showCount: true,
                    span: FORM_FIELD_SPAN.HALF,
                    type: FORM_TYPE.TEXT,
                    required: true,
                },
                {
                    key: "email",
                    label: USER_FORM_ITEM.EMAIL_LABEL,
                    name: "email",
                    placeholder: USER_FORM_ITEM.EMAIL_PLACEHOLDER,
                    required: true,
                    span: FORM_FIELD_SPAN.HALF,
                    type: FORM_TYPE.EMAIL,
                },
                {
                    description: mode === "create"
                        ? USER_FORM_ITEM.PASSWORD_CREATE_DESCRIPTION
                        : USER_FORM_ITEM.PASSWORD_EDIT_DESCRIPTION,
                    key: "password",
                    label: USER_FORM_ITEM.PASSWORD_LABEL,
                    name: "password",
                    placeholder: mode === "create"
                        ? USER_FORM_ITEM.PASSWORD_CREATE_PLACEHOLDER
                        : USER_FORM_ITEM.PASSWORD_EDIT_PLACEHOLDER,
                    required: mode === "create",
                    span: FORM_FIELD_SPAN.HALF,
                    type: FORM_TYPE.PASSWORD,
                },
                {
                    key: "role",
                    layout: FORM_LAYOUT.HORIZONTAL,
                    label: USER_FORM_ITEM.ROLE_LABEL,
                    name: "role",
                    options: userFormRoleOptions,
                    required: true,
                    span: FORM_FIELD_SPAN.HALF,
                    type: FORM_TYPE.RADIO,
                },
                {
                    controlId: "departmentLookupDisplay",
                    description: USER_FORM_ITEM.DEPARTMENT_HELPER_TEXT,
                    key: "department",
                    label: USER_FORM_ITEM.DEPARTMENT_LABEL,
                    lookupKey: "department",
                    name: "departmentId",
                    renderControl: (context) =>
                    {
                        const departmentError = context.errors.departmentId;
                        const departmentDisplayValue = formatDepartmentLabel(
                            context.values.departmentCode,
                            context.values.departmentName,
                        );

                        return (
                            <div className={formStyleClassNames.inlineFieldLayout}>
                                <div className={formStyleClassNames.inlineFieldInput}>
                                    <Input
                                        aria-invalid={Boolean(departmentError)}
                                        disabled={context.disabled}
                                        id="departmentLookupDisplay"
                                        placeholder={USER_FORM_ITEM.DEPARTMENT_PLACEHOLDER}
                                        readOnly={true}
                                        type="text"
                                        value={departmentDisplayValue}
                                    />
                                </div>

                                <div className={formStyleClassNames.inlineFieldActions}>
                                    <Button
                                        disabled={context.disabled}
                                        onClick={onOpenDepartmentLookup}
                                        type="button"
                                        variant="outline"
                                    >
                                        {USER_FORM_ITEM.LOOKUP_DEPARTMENT}
                                    </Button>
                                    <Button
                                        disabled={context.disabled || !context.values.departmentId}
                                        onClick={onClearDepartment}
                                        type="button"
                                        variant="outline"
                                    >
                                        {USER_FORM_ITEM.CLEAR_DEPARTMENT}
                                    </Button>
                                </div>
                            </div>
                        );
                    },
                    span: FORM_FIELD_SPAN.FULL,
                    type: FORM_TYPE.LOOKUP,
                },
                {
                    key: "avatarUrl",
                    label: USER_FORM_ITEM.AVATAR_LABEL,
                    name: "avatarUrl",
                    placeholder: USER_FORM_ITEM.AVATAR_PLACEHOLDER,
                    span: FORM_FIELD_SPAN.HALF,
                    type: FORM_TYPE.URL,
                },
            ],
            key: USER_FORM_ITEM.SECTION_KEY,
        },
    ], [mode, onClearDepartment, onOpenDepartmentLookup, userFormRoleOptions]);

    return { formItems };
}
