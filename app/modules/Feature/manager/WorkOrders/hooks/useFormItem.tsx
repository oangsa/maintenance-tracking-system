import React from "react";
import type { IFormSection } from "~/components/Common/Form";
import { FORM_FIELD_SPAN, FORM_SECTION_GUTTER, FORM_TYPE, WORK_ORDER_FORM_ITEM } from "~/constants";
import LookupField from "~/components/Common/LookupField";
import type { IWorkOrderFormValues } from "~/schemas/workOrderFormSchema";

import { RepairRequestItemLookupDefinition, type IRepairRequestItemLookupRow } from "~/components/Common/LookupField/lookups/repairRequestItem.lookup";
import { RepairStatusLookupDefinition, type IRepairStatusLookupRow } from "~/components/Common/LookupField/lookups/repairStatus.lookup";

interface IUseFormItemResult
{
    formItems: IFormSection<IWorkOrderFormValues>[];
}

interface IUseFormItemProps
{
    mode: "create" | "edit";
    onClearItem: () => void;
    onSelectItem: (item: IRepairRequestItemLookupRow) => void;
    onClearStatus: () => void;
    onSelectStatus: (status: IRepairStatusLookupRow) => void;
}

export function useFormItem({
    mode,
    onClearItem,
    onSelectItem,
    onClearStatus,
    onSelectStatus,
}: IUseFormItemProps): IUseFormItemResult
{
    const formItems = React.useMemo<IFormSection<IWorkOrderFormValues>[]>(() => [
        {
            card: true,
            gutter: FORM_SECTION_GUTTER.DEFAULT,
            fields: [
                {
                    controlId: "itemLookupDisplay",
                    key: "repairRequestItem",
                    label: WORK_ORDER_FORM_ITEM.REPAIR_REQUEST_ITEM_LABEL,
                    lookupKey: "repairRequestItem",
                    name: "repairRequestItemId",
                    required: true,
                    renderControl: (context) =>
                    {
                        return (
                            <LookupField<IRepairRequestItemLookupRow>
                                clearButtonLabel={WORK_ORDER_FORM_ITEM.REPAIR_REQUEST_ITEM_CLEAR}
                                controlId="itemLookupDisplay"
                                definition={RepairRequestItemLookupDefinition}
                                disabled={context.disabled || mode === "edit"}
                                displayValue={context.values.repairRequestItemDescription || "-"}
                                hasError={Boolean(context.errors.repairRequestItemId)}
                                lookupButtonLabel={WORK_ORDER_FORM_ITEM.REPAIR_REQUEST_ITEM_LOOKUP}
                                onClear={onClearItem}
                                onSelect={onSelectItem}
                                placeholder={WORK_ORDER_FORM_ITEM.REPAIR_REQUEST_ITEM_PLACEHOLDER}
                                value={context.values.repairRequestItemId}
                            />
                        );
                    },
                    span: FORM_FIELD_SPAN.FULL,
                    type: FORM_TYPE.LOOKUP,
                },
                {
                    key: "scheduledStart",
                    label: WORK_ORDER_FORM_ITEM.SCHEDULED_START_LABEL,
                    name: "scheduledStart",
                    placeholder: WORK_ORDER_FORM_ITEM.SCHEDULED_START_PLACEHOLDER,
                    span: FORM_FIELD_SPAN.HALF,
                    type: FORM_TYPE.DATE,
                },
                {
                    key: "scheduledEnd",
                    label: WORK_ORDER_FORM_ITEM.SCHEDULED_END_LABEL,
                    name: "scheduledEnd",
                    placeholder: WORK_ORDER_FORM_ITEM.SCHEDULED_END_PLACEHOLDER,
                    span: FORM_FIELD_SPAN.HALF,
                    type: FORM_TYPE.DATE,
                },
                {
                    key: "orderSequence",
                    label: WORK_ORDER_FORM_ITEM.ORDER_SEQUENCE_LABEL,
                    name: "orderSequence",
                    placeholder: WORK_ORDER_FORM_ITEM.ORDER_SEQUENCE_PLACEHOLDER,
                    required: true,
                    span: FORM_FIELD_SPAN.HALF,
                    type: FORM_TYPE.TEXT,
                },
                {
                    controlId: "statusLookupDisplay",
                    key: "status",
                    label: WORK_ORDER_FORM_ITEM.STATUS_LABEL,
                    lookupKey: "repairStatus",
                    name: "statusName",
                    required: false,
                    disabled: true,
                    renderControl: (context) =>
                    {
                        return (
                            <LookupField<IRepairStatusLookupRow>
                                clearButtonLabel={WORK_ORDER_FORM_ITEM.STATUS_CLEAR}
                                controlId="statusLookupDisplay"
                                definition={RepairStatusLookupDefinition}
                                disabled={context.disabled}
                                displayValue={context.values.statusName || context.values.statusCode || "-"}
                                hasError={Boolean(context.errors.statusId)}
                                lookupButtonLabel={WORK_ORDER_FORM_ITEM.STATUS_LOOKUP}
                                onClear={onClearStatus}
                                onSelect={onSelectStatus}
                                placeholder={WORK_ORDER_FORM_ITEM.STATUS_PLACEHOLDER}
                                value={context.values.statusId}
                            />
                        );
                    },
                    span: FORM_FIELD_SPAN.HALF,
                    type: FORM_TYPE.LOOKUP,
                },
            ],
            key: WORK_ORDER_FORM_ITEM.SECTION_KEY,
        },
    ], [
        mode,
        onClearItem,
        onClearStatus,
        onSelectItem,
        onSelectStatus,
    ]);

    return { formItems };
}
