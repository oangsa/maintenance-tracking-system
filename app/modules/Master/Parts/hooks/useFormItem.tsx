import React from "react";
import type { IFormSection } from "~/components/Common/Form";
import LookupField from "~/components/Common/LookupField";
import { ProductTypeLookupDefinition, type IProductTypeLookupRow } from "~/components/Common/LookupField/lookups/productType.lookup";
import { PART_FORM_ITEM, PRODUCT_TYPE_FORM_ITEM, FORM_FIELD_SPAN, FORM_SECTION_GUTTER, FORM_TYPE } from "~/constants";
import { formatJoinedLabel } from "~/lib/formatters";
import type { IPartFormValues } from "./helpers";

interface IUseFormItemResult
{
    formItems: IFormSection<IPartFormValues>[];
}

interface IUseFormItemProps
{
    mode: "create" | "edit";
}

export function useFormItem({ mode }: IUseFormItemProps): IUseFormItemResult
{
    const formItems = React.useMemo<IFormSection<IPartFormValues>[]>(() => [
        {
            card: true,
            gutter: FORM_SECTION_GUTTER.DEFAULT,
            fields: [
                {
                    key: "code",
                    label: PART_FORM_ITEM.CODE_LABEL,
                    maxLength: 150,
                    name: "code",
                    placeholder: PART_FORM_ITEM.CODE_PLACEHOLDER,
                    editable: mode === "create",
                    required: true,
                    showCount: true,
                    span: FORM_FIELD_SPAN.HALF,
                    type: FORM_TYPE.TEXT,
                },
                {
                    key: "name",
                    label: PART_FORM_ITEM.NAME_LABEL,
                    maxLength: 150,
                    name: "name",
                    placeholder: PART_FORM_ITEM.NAME_PLACEHOLDER,
                    required: true,
                    showCount: true,
                    span: FORM_FIELD_SPAN.HALF,
                    type: FORM_TYPE.TEXT,
                },
                {
                    controlId: "productTypeLookupDisplay",
                    key: "productTypeId",
                    label: PRODUCT_TYPE_FORM_ITEM.PRODUCT_TYPE_LABEL,
                    lookupKey: "productType",
                    name: "productTypeId",
                    required: true,
                    span: FORM_FIELD_SPAN.HALF,
                    type: FORM_TYPE.LOOKUP,
                    renderControl: (context) =>
                    {
                        return (
                            <LookupField<IProductTypeLookupRow>
                                controlId="productTypeLookupDisplay"
                                definition={ProductTypeLookupDefinition}
                                disabled={context.disabled}
                                displayValue={formatJoinedLabel([context.values.productTypeCode, context.values.productTypeName])}
                                hasError={Boolean(context.errors.productTypeId)}
                                initialSearch={String(context.values.productTypeCode || context.values.productTypeName || "")}
                                onClear={() =>
                                {
                                    context.setValue("productTypeId", 0);
                                    context.setValue("productTypeCode", "");
                                    context.setValue("productTypeName", "");
                                    context.clearError("productTypeId");
                                }}
                                onSelect={(productType) =>
                                {
                                    context.setValue("productTypeId", productType.id);
                                    context.setValue("productTypeCode", String(productType.code ?? ""));
                                    context.setValue("productTypeName", String(productType.name ?? ""));
                                    context.clearError("productTypeId");
                                }}
                                placeholder={PRODUCT_TYPE_FORM_ITEM.PRODUCT_TYPE_PLACEHOLDER}
                                value={context.values.productTypeId}
                            />
                        );
                    },
                },
            ],
            key: PART_FORM_ITEM.SECTION_KEY,
        },
    ], [mode]);

    return { formItems };
}