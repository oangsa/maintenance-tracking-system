import React from "react";
import type { IFormSection } from "~/components/Common/Form";
import { FORM_FIELD_SPAN, FORM_LAYOUT, FORM_SECTION_GUTTER, FORM_TYPE, ROLE_OPTIONS, USER_FORM_ITEM } from "~/constants";
import LookupField from "~/components/Common/LookupField";
import { DepartmentLookupDefinition, type IDepartmentLookupRow } from "~/lookups/department.lookup";
import {
    formatDepartmentLabel,
    formatRoleLabel,
} from "./helpers";
import type { IUserFormValues } from "./helpers";

interface IUseFormItemProps
{
    mode: "create" | "edit";
    onClearDepartment: () => void;
    onSelectDepartment: (department: IDepartmentLookupRow) => void;
}

interface IUseFormItemResult
{
    formItems: IFormSection<IUserFormValues>[];
}

export function useFormItem({ mode, onClearDepartment, onSelectDepartment }: IUseFormItemProps): IUseFormItemResult
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
                        return (
                            <LookupField<IDepartmentLookupRow>
                                clearButtonLabel={USER_FORM_ITEM.CLEAR_DEPARTMENT}
                                controlId="departmentLookupDisplay"
                                definition={DepartmentLookupDefinition}
                                disabled={context.disabled}
                                displayValue={formatDepartmentLabel(context.values.departmentCode, context.values.departmentName)}
                                hasError={Boolean(context.errors.departmentId)}
                                initialSearch={String(context.values.departmentCode || context.values.departmentName || "")}
                                lookupButtonLabel={USER_FORM_ITEM.LOOKUP_DEPARTMENT}
                                onClear={onClearDepartment}
                                onSelect={onSelectDepartment}
                                placeholder={USER_FORM_ITEM.DEPARTMENT_PLACEHOLDER}
                                value={context.values.departmentId}
                            />
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
    ], [mode, onClearDepartment, onSelectDepartment, userFormRoleOptions]);

    return { formItems };
}
