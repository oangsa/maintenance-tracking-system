import React from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { formStyleClassNames } from "~/components/Common/Form/styles";
import ListPickerModal, {
    type IFetchParams,
    type IFetchResult,
    type IPickerColumn,
} from "~/components/Common/ListPickerModal";

export interface ILookupDefinition<TLookupRow extends Record<string, unknown>>
{
    columns: IPickerColumn<TLookupRow>[];
    fetchData: (params: IFetchParams) => Promise<IFetchResult<TLookupRow>>;
    title?: string;
    itemName?: string;
    searchPlaceholder?: string;
    emptySearch?: string;
    emptyDefault?: string;
}

interface ILookupFieldProps<TLookupRow extends Record<string, unknown>>
{
    controlId: string;
    definition: ILookupDefinition<TLookupRow>;
    displayValue: string;
    value?: string | number | null;
    placeholder?: string;
    disabled?: boolean;
    hasError?: boolean;
    initialSearch?: string;
    lookupButtonLabel?: React.ReactNode;
    clearButtonLabel?: React.ReactNode;
    disableClearWhenEmpty?: boolean;
    onSelect: (row: TLookupRow) => void;
    onClear?: () => void;
}

function ResolveIsEmpty(value: string | number | null | undefined): boolean
{
    if (value === null || value === undefined)
    {
        return true;
    }

    return String(value).trim() === "";
}

export default function LookupField<TLookupRow extends Record<string, unknown>>({
    controlId,
    definition,
    displayValue,
    value,
    placeholder = "Select value",
    disabled = false,
    hasError = false,
    initialSearch = "",
    lookupButtonLabel = "Lookup",
    clearButtonLabel = "Clear",
    disableClearWhenEmpty = true,
    onSelect,
    onClear,
}: ILookupFieldProps<TLookupRow>)
{
    const [isOpen, setIsOpen] = React.useState(false);
    const isClearDisabled = disabled
        || !onClear
        || (disableClearWhenEmpty && ResolveIsEmpty(value));

    return (
        <>
            <div className={formStyleClassNames.inlineFieldLayout}>
                <div className={formStyleClassNames.inlineFieldInput}>
                    <Input
                        aria-invalid={hasError}
                        disabled={disabled}
                        id={controlId}
                        placeholder={placeholder}
                        readOnly={true}
                        type="text"
                        value={displayValue}
                    />
                </div>

                <div className={formStyleClassNames.inlineFieldActions}>
                    <Button
                        disabled={disabled}
                        onClick={() => setIsOpen(true)}
                        type="button"
                        variant="outline"
                    >
                        {lookupButtonLabel}
                    </Button>
                    <Button
                        disabled={isClearDisabled}
                        onClick={onClear}
                        type="button"
                        variant="outline"
                    >
                        {clearButtonLabel}
                    </Button>
                </div>
            </div>

            <ListPickerModal<TLookupRow>
                columns={definition.columns}
                emptyDefault={definition.emptyDefault ?? "No items found."}
                emptySearch={definition.emptySearch ?? "No matching items found."}
                fetchData={definition.fetchData}
                initialSearch={initialSearch}
                isOpen={isOpen}
                itemName={definition.itemName ?? "item"}
                onClose={() => setIsOpen(false)}
                onSelect={onSelect}
                searchPlaceholder={definition.searchPlaceholder ?? "Search..."}
                title={definition.title ?? "Select"}
            />
        </>
    );
}
