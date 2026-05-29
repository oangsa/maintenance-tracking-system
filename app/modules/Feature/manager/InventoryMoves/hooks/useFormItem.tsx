import React from "react";
import type { IFormSection } from "~/components/Common/Form";
import { formStyleClassNames } from "~/components/Common/Form/styles";
import { FORM_FIELD_SPAN, FORM_SECTION_GUTTER, FORM_TYPE } from "~/constants";
import type { IInventoryMoveFormValues } from "~/schemas/inventoryMoveFormSchema";

interface IUseFormItemResult
{
    formItems: IFormSection<IInventoryMoveFormValues>[];
}

interface IUseFormItemProps
{
    mode: "create";
    lineItemsEditor: React.ReactNode;
}

export function useFormItem({
    mode,
    lineItemsEditor,
}: IUseFormItemProps): IUseFormItemResult
{
    const inventoryMoveReasonOptions = React.useMemo(() => [
        { label: "buy", value: "buy" },
        { label: "use", value: "use" },
        { label: "lost", value: "lost" },
        { label: "found", value: "found" },
        { label: "adjust", value: "adjust" },
    ], []);

    const formItems = React.useMemo<IFormSection<IInventoryMoveFormValues>[]>(() => [
        {
            card: true,
            gutter: FORM_SECTION_GUTTER.DEFAULT,
            key: "transaction-information",
            title: "Transaction Information",
            fields: [
                {
                    containerClassName: formStyleClassNames.detailCard,
                    key: "remarks",
                    label: "Reason",
                    labelClassName: formStyleClassNames.detailLabel,
                    name: "remarks",
                    placeholder: "Select a reason for this move...",
                    required: true,
                    span: FORM_FIELD_SPAN.THIRD,
                    type: FORM_TYPE.SELECT,
                    options: inventoryMoveReasonOptions,
                },
            ],
        },
        {
            gridClassName: formStyleClassNames.lineItemGrid,
            key: "transaction-items",
            fields: [
                {
                    containerClassName: formStyleClassNames.lineItemSection,
                    controlId: "inventoryMoveItemsDisplay",
                    key: "items",
                    render: () => lineItemsEditor,
                    span: FORM_FIELD_SPAN.FULL,
                    type: FORM_TYPE.CUSTOM,
                },
            ],
        },
    ], [
        inventoryMoveReasonOptions,
        lineItemsEditor,
        mode,
    ]);

    return { formItems };
}
