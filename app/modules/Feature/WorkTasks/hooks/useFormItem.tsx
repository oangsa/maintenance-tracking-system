import React from "react";
import type { IFormSection } from "~/components/Common/Form";
import { FORM_FIELD_SPAN, FORM_SECTION_GUTTER } from "~/constants";
import type { IWorkTaskFormValues } from "./helpers";

interface IUseFormItemResult {
    formItems: IFormSection<IWorkTaskFormValues>[];
}

interface IUseFormItemProps {
    mode: "create" | "edit";
}

export function useFormItem({ mode }: IUseFormItemProps): IUseFormItemResult {
    const formItems = React.useMemo<IFormSection<IWorkTaskFormValues>[]>(() => [
        {
            card: true,
            gutter: FORM_SECTION_GUTTER.DEFAULT,
            key: "work-task-details",
            title: "Work Task Details",
            fields: [
                {
                    key: "description",
                    label: "Description",
                        name: "description",
                    placeholder: "Task description and details...",
                        required: true,
                    span: FORM_FIELD_SPAN.FULL,
                    type: "textarea",
                },
                {
                    key: "started_at",
                    label: "Started At",
                        name: "started_at",
                    span: FORM_FIELD_SPAN.HALF,
                    type: "datetime-local" as any,
                },
                {
                    key: "ended_at",
                    label: "Ended At",
                        name: "ended_at",
                    span: FORM_FIELD_SPAN.HALF,
                    type: "datetime-local" as any,
                },
                {
                    key: "note",
                    label: "Note",
                        name: "note",
                        placeholder: "Add operational notes or remarks...",
                    span: FORM_FIELD_SPAN.FULL,
                    type: "textarea",
                },
            ],
        },
    ], [mode]);

    return { formItems };
}