import React from "react";
import type { IFormSection } from "~/components/Common/Form";
import LookupField from "~/components/Common/LookupField";
import { ProductTypeLookupDefinition, type IProductTypeLookupRow } from "~/components/Common/LookupField/lookups/productType.lookup";
import { FORM_FIELD_SPAN, FORM_SECTION_GUTTER, FORM_TYPE } from "~/constants";
import type { IProductFormValues } from "./helpers";

interface IUseFormItemProps
{
    mode: "create" | "edit";
}

interface IUseFormItemResult
{
    formItems: IFormSection<IProductFormValues>[];
}

export function useFormItem({ mode }: IUseFormItemProps): IUseFormItemResult
{
    const formItems = React.useMemo<IFormSection<IProductFormValues>[]>(() => [
        {
            key: "product-fields",
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
                    controlId: "productTypeLookupDisplay",
                    description: "Search and select a product type from the lookup table.",
                    key: "productTypeId",
                    label: "Product Type",
                    lookupKey: "productType",
                    name: "productTypeId",
                    required: true,
                    span: FORM_FIELD_SPAN.FULL,
                    type: FORM_TYPE.LOOKUP,
                    renderControl: (context) =>
                    {
                        const displayValue = context.values.productTypeCode && context.values.productTypeName
                            ? `[${context.values.productTypeCode}] ${context.values.productTypeName}`
                            : context.values.productTypeCode || context.values.productTypeName || "";

                        return (
                            <LookupField<IProductTypeLookupRow>
                                clearButtonLabel="Clear"
                                controlId="productTypeLookupDisplay"
                                definition={ProductTypeLookupDefinition}
                                disabled={context.disabled}
                                displayValue={displayValue}
                                hasError={Boolean(context.errors.productTypeId)}
                                initialSearch={displayValue}
                                lookupButtonLabel="Lookup Product Type"
                                onClear={() =>
                                {
                                    context.setValue("productTypeId", "");
                                    context.setValue("productTypeCode", "");
                                    context.setValue("productTypeName", "");
                                    context.clearError("productTypeId");
                                }}
                                onSelect={(productType) =>
                                {
                                    context.setValue("productTypeId", String(productType.id));
                                    context.setValue("productTypeCode", String(productType.code ?? ""));
                                    context.setValue("productTypeName", String(productType.name ?? ""));
                                    context.clearError("productTypeId");
                                }}
                                placeholder="Select product type"
                                value={context.values.productTypeId}
                            />
                        );
                    },
                },
            ],
        },
    ], [mode]);

    return { formItems };
}
