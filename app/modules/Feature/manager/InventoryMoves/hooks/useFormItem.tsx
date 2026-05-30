import React from "react";
import type { IFormSection } from "~/components/Common/Form";
import { FORM_FIELD_SPAN, FORM_SECTION_GUTTER, FORM_TYPE } from "~/constants";
import LineItemsEditor from "~/components/Common/LineItemsEditor"; 
import type { IInventoryMoveFormValues } from "~/schemas/inventoryMoveFormSchema";
import LookupField from "~/components/Common/LookupField"; 
import { PartLookupDefinition } from "~/components/Common/LookupField/lookups/part.lookup"; 

interface IUseFormItemResult {
    formItems: IFormSection<IInventoryMoveFormValues>[];
}

interface IUseFormItemProps {
    mode: "create";
    values: IInventoryMoveFormValues;
    setFieldValue: (name: keyof IInventoryMoveFormValues, value: any) => void;
}

export function useFormItem({
    mode,
    values,
    setFieldValue,
}: IUseFormItemProps): IUseFormItemResult {
    const formItems = React.useMemo<IFormSection<IInventoryMoveFormValues>[]>(() => [
        {
            card: true,
            gutter: FORM_SECTION_GUTTER.DEFAULT,
            key: "inventoryMoveDetails",
            fields: [
                {
                    key: "remarks",
                    label: "Remarks / Reason",
                    name: "remarks",
                    placeholder: "Select a reason for this move...",
                    span: FORM_FIELD_SPAN.FULL,
                    type: FORM_TYPE.SELECT,
                    options: [
                        { label: "buy", value: "buy" },
                        { label: "use", value: "use" },
                        { label: "lost", value: "lost" },
                        { label: "found", value: "found" },
                        { label: "adjust", value: "adjust" },
                    ],
                },
                {
                    controlId: "inventoryMoveItemsDisplay",
                    key: "items",
                    label: "Transaction Items",
                    type: FORM_TYPE.CUSTOM, 
                    render: (context: any) => {
                        return (
                            <LineItemsEditor
                                columns={[
                                    { 
                                        key: "partId", 
                                        label: "Part", 
                                        renderCell: (cellContext: any) => (
                                            <LookupField
                                                controlId="partId"
                                                definition={PartLookupDefinition as any}
                                                disabled={cellContext.disabled}
                                                value={cellContext.item.partId || ""}
                                                displayValue={cellContext.item.partName || cellContext.item.partCode || ""}
                                                onClear={() => {
                                                    cellContext.updateItem({
                                                        partId: "",
                                                        partCode: "",
                                                        partName: "",
                                                    });
                                                }}
                                                onSelect={(selectedPart: any) => {
                                                    cellContext.updateItem({
                                                        partId: selectedPart ? String(selectedPart.id) : "",
                                                        partCode: selectedPart?.code || "",
                                                        partName: selectedPart?.name || "",
                                                    });
                                                }}
                                            />
                                        )
                                    },
                                    { 
                                        key: "quantityIn", 
                                        label: "Quantity In", 
                                        renderCell: (cellContext: any) => (
                                            <input
                                                type="number"
                                                className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm"
                                                disabled={cellContext.disabled}
                                                min={0}
                                                onChange={(e) => cellContext.updateItem({ quantityIn: e.target.value })}
                                                value={cellContext.item.quantityIn || ""}
                                            />
                                        )
                                    },
                                    { 
                                        key: "quantityOut", 
                                        label: "Quantity Out", 
                                        renderCell: (cellContext: any) => (
                                            <input
                                                type="number"
                                                className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm"
                                                disabled={cellContext.disabled}
                                                min={0}
                                                onChange={(e) => cellContext.updateItem({ quantityOut: e.target.value })}
                                                value={cellContext.item.quantityOut || ""}
                                            />
                                        )
                                    },
                                    {
                                        key: "actions",
                                        label: "",
                                        renderCell: (cellContext: any) => {
                                            const currentItems = context.values.items || [];
                                            const isFirstRow = currentItems.indexOf(cellContext.item) === 0;

                                            if (isFirstRow) {
                                                return (
                                                    <button type="button" className="invisible px-3 py-1.5 text-base font-bold">
                                                        ✕
                                                    </button>
                                                );
                                            }

                                            return (
                                                <button
                                                    type="button"
                                                    title="Delete Item"
                                                    className="text-slate-400 hover:text-red-600 text-base font-bold px-3 py-1.5 rounded hover:bg-red-50 transition-colors"
                                                    disabled={cellContext.disabled}
                                                    onClick={() => {
                                                        const newItems = currentItems.filter((it: any) => it !== cellContext.item);
                                                        setFieldValue("items", newItems);
                                                    }}
                                                >
                                                    ✕
                                                </button>
                                            );
                                        }
                                    }
                                ] as any}
                                createEmptyItem={() => ({ partId: "", partCode: "", partName: "", quantityIn: "", quantityOut: "" })}
                                disabled={context.disabled}
                                onChange={(newItems) => setFieldValue("items", newItems)}
                                value={context.values.items || []}
                            />
                        );
                    },
                    span: FORM_FIELD_SPAN.FULL,
                },
            ],
        },
    ], [
        setFieldValue,
    ]);

    return { formItems };
}