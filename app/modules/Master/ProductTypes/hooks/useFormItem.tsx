import React from "react";
import type { IFormSection } from "~/components/Common/Form";
import LookupField from "~/components/Common/LookupField";
import { DepartmentLookupDefinition, type IDepartmentLookupRow } from "~/components/Common/LookupField/lookups/department.lookup";
import { DEPARTMENT_FORM_ITEM, FORM_FIELD_SPAN, FORM_SECTION_GUTTER, FORM_TYPE } from "~/constants";
import { formatDepartmentLabel } from "~/lib/formatters";
import type { IProductTypeFormValues } from "./helpers";

interface IUseFormItemProps
{
    mode: "create" | "edit";
}

interface IUseFormItemResult
{
    formItems: IFormSection<IProductTypeFormValues>[];
}

export function useFormItem({ mode }: IUseFormItemProps): IUseFormItemResult
{
    const formItems = React.useMemo<IFormSection<IProductTypeFormValues>[]>(() => [
        {
            key: "product-type-fields",
            card: true,
            gutter: FORM_SECTION_GUTTER.DEFAULT,
            fields: [
                {
                    key: "code",
                    label: "Code",
                    maxLength: 150,
                    name: "code",
                    placeholder: "Enter code",
                    required: true,
                    showCount: true,
                    span: FORM_FIELD_SPAN.HALF,
                    type: FORM_TYPE.TEXT,
                    editable: mode === "create",
                },
                {
                    key: "name",
                    label: "Name",
                    maxLength: 150,
                    name: "name",
                    placeholder: "Enter name",
                    required: true,
                    showCount: true,
                    span: FORM_FIELD_SPAN.HALF,
                    type: FORM_TYPE.TEXT,
                },
                {
                    controlId: "departmentLookupDisplay",
                    description: "Search and select a department from the lookup table.",
                    key: "departmentId",
                    label: "Department",
                    lookupKey: "department",
                    name: "departmentId",
                    required: true,
                    span: FORM_FIELD_SPAN.FULL,
                    type: FORM_TYPE.LOOKUP,
                    renderControl: (context) =>
                    {
                        return (
                            <LookupField<IDepartmentLookupRow>
                                clearButtonLabel="Clear"
                                controlId="departmentLookupDisplay"
                                definition={DepartmentLookupDefinition}
                                disabled={context.disabled}
                                displayValue={formatDepartmentLabel(context.values.departmentCode, context.values.departmentName)}
                                hasError={Boolean(context.errors.departmentId)}
                                initialSearch={String(context.values.departmentCode || context.values.departmentName || "")}
                                lookupButtonLabel="Lookup Department"
                                onClear={() =>
                                {
                                    context.setValue("departmentId", "");
                                    context.setValue("departmentCode", "");
                                    context.setValue("departmentName", "");
                                    context.clearError("departmentId");
                                }}
                                onSelect={(department) =>
                                {
                                    context.setValue("departmentId", String(department.id));
                                    context.setValue("departmentCode", String(department.code ?? ""));
                                    context.setValue("departmentName", String(department.name ?? ""));
                                    context.clearError("departmentId");
                                }}
                                placeholder="Select department"
                                value={context.values.departmentId}
                            />
                        );
                    },
                },
            ],
        },
    ], [mode]);

    return { formItems };
}
