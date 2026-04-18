import React from "react"
import {
    ArrowDown,
    ArrowUp,
    GripVertical,
    LoaderCircle,
    Plus,
    Search,
    Trash2,
    X,
} from "lucide-react"
import ListPickerModal from "../ListPickerModal"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "~/components/ui/table"
import { Textarea } from "~/components/ui/textarea"
import { cn } from "~/lib/utils"

export interface ILineItemValue
{
    id?: string | number;
    code: string;
    name: string;
    quantity: number | string;
    description?: string;
    unitLabel?: string;
    unitPrice?: number | string;
    [key: string]: unknown;
}

export interface ILineItemLookupRow extends Record<string, unknown>
{
    id?: string | number;
    code: string;
    name: string;
    description?: string | null;
    unitLabel?: string | null;
    unitPrice?: number | string | null;
}

export interface ILineItemLookupColumn<TLookupRow = ILineItemLookupRow>
{
    key: string;
    label: string;
    align?: "left" | "right" | "center";
    render?: (value: unknown, row: TLookupRow) => React.ReactNode;
    style?: React.CSSProperties;
}

export interface ILineItemLookupFetchParams
{
    search: string;
    page: number;
    limit: number;
    sortBy?: string;
    sortDir?: "asc" | "desc";
}

export interface ILineItemLookupFetchResult<TLookupRow = ILineItemLookupRow>
{
    data: TLookupRow[];
    total: number;
    totalPages: number;
    pageItemCount?: number;
    currentPage?: number;
    hasNext?: boolean;
    hasPrevious?: boolean;
}

export interface ILineItemLookupConfig<TLookupRow = ILineItemLookupRow>
{
    columns: ILineItemLookupColumn<TLookupRow>[];
    fetchData: (params: ILineItemLookupFetchParams) => Promise<ILineItemLookupFetchResult<TLookupRow>>;
    title?: string;
    searchPlaceholder?: string;
    itemName?: string;
    emptySearch?: string;
    emptyDefault?: string;
    mapRowToItem?: (row: TLookupRow) => Partial<ILineItemValue> & {
        code: string;
        name: string;
    };
}

interface ILineItemsEditorProps<TLookupRow = ILineItemLookupRow>
{
    value: ILineItemValue[];
    onChange: (items: ILineItemValue[]) => void;
    title?: string;
    addButtonLabel?: string;
    itemLabel?: string;
    emptyMessage?: string;
    minRows?: number;
    disabled?: boolean;
    showDescription?: boolean;
    showUnit?: boolean;
    showPricing?: boolean;
    allowDuplicateCodes?: boolean;
    allowManualNameEdit?: boolean;
    allowUnitPriceEdit?: boolean;
    quantityStep?: number;
    codeLabel?: string;
    nameLabel?: string;
    descriptionLabel?: string;
    quantityLabel?: string;
    unitLabel?: string;
    unitPriceLabel?: string;
    totalLabel?: string;
    createEmptyItem?: () => ILineItemValue;
    formatCurrency?: (value: number) => string;
    lookupConfig?: ILineItemLookupConfig<TLookupRow>;
    onResolveItemByCode?: (
        code: string,
        currentItem: ILineItemValue,
        rowIndex: number,
    ) => Promise<(Partial<ILineItemValue> & { code?: string; name?: string; }) | null>;
}

interface ILineItemRowProps
{
    index: number;
    item: ILineItemValue;
    itemsLength: number;
    disabled: boolean;
    message?: string;
    isResolving: boolean;
    isDragging: boolean;
    isDragOver: boolean;
    showDescription: boolean;
    showUnit: boolean;
    showPricing: boolean;
    allowLookup: boolean;
    allowManualNameEdit: boolean;
    allowUnitPriceEdit: boolean;
    quantityStep: number;
    minRows: number;
    formatCurrency: (value: number) => string;
    computeLineTotal: (item: ILineItemValue) => number;
    onCodeChange: (value: string) => void;
    onCodeBlur: () => void;
    onNameChange: (value: string) => void;
    onDescriptionChange: (value: string) => void;
    onQuantityChange: (value: string) => void;
    onUnitPriceChange: (value: string) => void;
    onOpenLookup: () => void;
    onClearLookupValues: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    onInsertBelow: () => void;
    onRemove: () => void;
    onDragStart: (event: React.DragEvent<HTMLTableRowElement>, index: number) => void;
    onDragOver: (event: React.DragEvent<HTMLTableRowElement>, index: number) => void;
    onDragLeave: () => void;
    onDrop: (event: React.DragEvent<HTMLTableRowElement>, index: number) => void;
    onDragEnd: () => void;
}

function CreateDefaultItem(): ILineItemValue
{
    return {
        code: "",
        name: "",
        quantity: 1,
        description: "",
        unitLabel: "",
        unitPrice: 0,
    }
}

function NormalizeCode(value: unknown): string
{
    return String(value ?? "").trim().toLowerCase()
}

function ParseNumericValue(value: unknown, fallback = 0): number
{
    if (typeof value === "number" && Number.isFinite(value))
    {
        return value
    }

    if (typeof value === "string")
    {
        const trimmedValue = value.trim()

        if (trimmedValue === "")
        {
            return fallback
        }

        const parsedValue = Number(trimmedValue)

        if (Number.isFinite(parsedValue))
        {
            return parsedValue
        }
    }

    return fallback
}

function FormatDefaultCurrency(value: number): string
{
    return new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value)
}

function BuildLookupItem(row: ILineItemLookupRow): Partial<ILineItemValue> & { code: string; name: string; }
{
    const rawUnitLabel = typeof row["unitLabel"] === "string"
        ? row["unitLabel"]
        : typeof row["unitCode"] === "string"
            ? row["unitCode"]
            : typeof row["unitsCode"] === "string"
                ? row["unitsCode"]
                : ""
    const rawUnitPrice = typeof row["unitPrice"] === "number" || typeof row["unitPrice"] === "string"
        ? row["unitPrice"]
        : typeof row["price"] === "number" || typeof row["price"] === "string"
            ? row["price"]
            : 0

    return {
        code: String(row.code ?? "").trim(),
        name: String(row.name ?? "").trim(),
        description: typeof row.description === "string" ? row.description : "",
        unitLabel: String(rawUnitLabel ?? ""),
        unitPrice: rawUnitPrice,
    }
}

function BuildItemCountLabel(count: number, itemLabel: string): string
{
    return `${count} ${itemLabel}${count === 1 ? "" : "s"}`
}

function LineItemRow({
    index,
    item,
    itemsLength,
    disabled,
    message,
    isResolving,
    isDragging,
    isDragOver,
    showDescription,
    showUnit,
    showPricing,
    allowLookup,
    allowManualNameEdit,
    allowUnitPriceEdit,
    quantityStep,
    minRows,
    formatCurrency,
    computeLineTotal,
    onCodeChange,
    onCodeBlur,
    onNameChange,
    onDescriptionChange,
    onQuantityChange,
    onUnitPriceChange,
    onOpenLookup,
    onClearLookupValues,
    onMoveUp,
    onMoveDown,
    onInsertBelow,
    onRemove,
    onDragStart,
    onDragOver,
    onDragLeave,
    onDrop,
    onDragEnd,
}: ILineItemRowProps)
{
    return (
        <TableRow
            className={cn(
                isDragging && "opacity-50",
                isDragOver && "bg-muted/60",
            )}
            draggable={!disabled}
            onDragEnd={onDragEnd}
            onDragLeave={onDragLeave}
            onDragOver={(event) => onDragOver(event, index)}
            onDragStart={(event) => onDragStart(event, index)}
            onDrop={(event) => onDrop(event, index)}
        >
            <TableCell className="w-[72px] align-top">
                <div className="flex items-center justify-center gap-1.5 pt-2 text-muted-foreground">
                    <span className={cn(!disabled && "cursor-grab")} title="Drag to reorder">
                        <GripVertical className="size-4" />
                    </span>
                    <span className="min-w-5 text-center text-xs font-semibold">{index + 1}</span>
                </div>
            </TableCell>

            <TableCell className="min-w-[240px] align-top">
                <div className="space-y-2">
                    <div className="flex items-start gap-2">
                        <Input
                            aria-invalid={Boolean(message)}
                            className="min-w-0"
                            disabled={disabled}
                            onBlur={onCodeBlur}
                            onChange={(event) => onCodeChange(event.target.value)}
                            placeholder="Enter item code"
                            type="text"
                            value={item.code ?? ""}
                        />

                        {allowLookup && (
                            <Button
                                disabled={disabled}
                                onClick={onOpenLookup}
                                size="icon-sm"
                                title="Lookup item"
                                type="button"
                                variant="outline"
                            >
                                <Search className="size-4" />
                            </Button>
                        )}

                        {item.code && (
                            <Button
                                disabled={disabled}
                                onClick={onClearLookupValues}
                                size="icon-sm"
                                title="Clear item"
                                type="button"
                                variant="ghost"
                            >
                                <X className="size-4" />
                            </Button>
                        )}
                    </div>

                    {(message || isResolving) && (
                        <div className="flex min-h-5 items-center gap-1.5 text-xs">
                            {isResolving && (
                                <>
                                    <LoaderCircle className="size-3 animate-spin text-muted-foreground" />
                                    <span className="text-muted-foreground">Resolving item code...</span>
                                </>
                            )}

                            {!isResolving && message && (
                                <span className="text-destructive">{message}</span>
                            )}
                        </div>
                    )}
                </div>
            </TableCell>

            <TableCell className="min-w-[220px] align-top">
                <Input
                    disabled={disabled}
                    onChange={(event) => onNameChange(event.target.value)}
                    placeholder="Item name"
                    readOnly={!allowManualNameEdit}
                    type="text"
                    value={item.name ?? ""}
                />
            </TableCell>

            {showDescription && (
                <TableCell className="min-w-[260px] align-top">
                    <Textarea
                        className="min-h-20 resize-y"
                        disabled={disabled}
                        onChange={(event) => onDescriptionChange(event.target.value)}
                        placeholder="Add item description"
                        value={String(item.description ?? "")}
                    />
                </TableCell>
            )}

            {showUnit && (
                <TableCell className="w-[120px] align-top">
                    <div className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                        {item.unitLabel ? String(item.unitLabel) : "-"}
                    </div>
                </TableCell>
            )}

            <TableCell className="w-[120px] align-top">
                <Input
                    className="text-right"
                    disabled={disabled}
                    min={quantityStep}
                    onChange={(event) => onQuantityChange(event.target.value)}
                    step={quantityStep}
                    type="number"
                    value={String(item.quantity ?? "")}
                />
            </TableCell>

            {showPricing && (
                <TableCell className="w-[140px] align-top">
                    {allowUnitPriceEdit
                        ? (
                            <Input
                                className="text-right"
                                disabled={disabled}
                                min={0}
                                onChange={(event) => onUnitPriceChange(event.target.value)}
                                step="0.01"
                                type="number"
                                value={String(item.unitPrice ?? 0)}
                            />
                        )
                        : (
                            <div className="rounded-md border border-border bg-muted/40 px-3 py-2 text-right text-sm font-medium text-muted-foreground">
                                {formatCurrency(ParseNumericValue(item.unitPrice, 0))}
                            </div>
                        )
                    }
                </TableCell>
            )}

            {showPricing && (
                <TableCell className="w-[140px] align-top text-right text-sm font-semibold text-foreground">
                    <div className="rounded-md border border-border/80 bg-background px-3 py-2">
                        {formatCurrency(computeLineTotal(item))}
                    </div>
                </TableCell>
            )}

            <TableCell className="w-[168px] align-top">
                <div className="flex flex-wrap items-center justify-end gap-1">
                    <Button
                        disabled={disabled || index === 0}
                        onClick={onMoveUp}
                        size="icon-xs"
                        title="Move item up"
                        type="button"
                        variant="ghost"
                    >
                        <ArrowUp className="size-3.5" />
                    </Button>
                    <Button
                        disabled={disabled || index >= itemsLength - 1}
                        onClick={onMoveDown}
                        size="icon-xs"
                        title="Move item down"
                        type="button"
                        variant="ghost"
                    >
                        <ArrowDown className="size-3.5" />
                    </Button>
                    <Button
                        disabled={disabled}
                        onClick={onInsertBelow}
                        size="icon-xs"
                        title="Insert item below"
                        type="button"
                        variant="ghost"
                    >
                        <Plus className="size-3.5" />
                    </Button>
                    <Button
                        className="text-destructive hover:text-destructive"
                        disabled={disabled || itemsLength <= minRows}
                        onClick={onRemove}
                        size="icon-xs"
                        title="Remove item"
                        type="button"
                        variant="ghost"
                    >
                        <Trash2 className="size-3.5" />
                    </Button>
                </div>
            </TableCell>
        </TableRow>
    )
}

export default function LineItemsEditor<TLookupRow extends ILineItemLookupRow = ILineItemLookupRow>({
    value,
    onChange,
    title = "Line Items",
    addButtonLabel = "Add Item",
    itemLabel = "item",
    emptyMessage = "No items added yet.",
    minRows = 1,
    disabled = false,
    showDescription = true,
    showUnit = false,
    showPricing = false,
    allowDuplicateCodes = false,
    allowManualNameEdit = false,
    allowUnitPriceEdit = false,
    quantityStep = 1,
    codeLabel = "Code",
    nameLabel = "Name",
    descriptionLabel = "Description",
    quantityLabel = "Quantity",
    unitLabel = "Unit",
    unitPriceLabel = "Unit Price",
    totalLabel = "Total",
    createEmptyItem,
    formatCurrency = FormatDefaultCurrency,
    lookupConfig,
    onResolveItemByCode,
}: ILineItemsEditorProps<TLookupRow>)
{
    const [dragIndex, setDragIndex] = React.useState<number | null>(null)
    const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null)
    const [lookupRowIndex, setLookupRowIndex] = React.useState<number | null>(null)
    const [rowMessages, setRowMessages] = React.useState<Record<number, string | undefined>>({})
    const [resolvingRows, setResolvingRows] = React.useState<Record<number, boolean>>({})

    const itemsRef = React.useRef(value)

    itemsRef.current = value

    function CreateItem(): ILineItemValue
    {
        if (createEmptyItem)
        {
            return createEmptyItem()
        }

        return CreateDefaultItem()
    }

    function ClearTransientState()
    {
        setDragIndex(null)
        setDragOverIndex(null)
        setRowMessages({})
        setResolvingRows({})
    }

    function UpdateRow(index: number, patch: Partial<ILineItemValue>)
    {
        const nextItems = itemsRef.current.map((currentItem, currentIndex) =>
        {
            if (currentIndex !== index)
            {
                return currentItem
            }

            return {
                ...currentItem,
                ...patch,
            }
        })

        onChange(nextItems)
    }

    function ClearLookupValues(index: number)
    {
        UpdateRow(index, {
            code: "",
            name: "",
            unitLabel: "",
            unitPrice: 0,
        })

        setRowMessages((currentMessages) => ({
            ...currentMessages,
            [index]: undefined,
        }))
    }

    function ApplyResolvedItem(index: number, resolvedItem: Partial<ILineItemValue> & { code?: string; name?: string; })
    {
        const currentItems = itemsRef.current
        const currentItem = currentItems[index]

        if (!currentItem)
        {
            return
        }

        const nextItem: ILineItemValue = {
            ...currentItem,
            ...resolvedItem,
            code: String(resolvedItem.code ?? currentItem.code ?? "").trim(),
            name: String(resolvedItem.name ?? currentItem.name ?? ""),
        }

        const normalizedCode = NormalizeCode(nextItem.code)

        if (!allowDuplicateCodes && normalizedCode)
        {
            const duplicateIndex = currentItems.findIndex((candidate, candidateIndex) =>
            {
                return candidateIndex !== index && NormalizeCode(candidate.code) === normalizedCode
            })

            if (duplicateIndex !== -1)
            {
                const duplicateItem = currentItems[duplicateIndex]
                const mergedItem: ILineItemValue = {
                    ...duplicateItem,
                    ...nextItem,
                    code: nextItem.code,
                    name: String(duplicateItem.name ?? nextItem.name ?? ""),
                    description: String(duplicateItem.description ?? "") || String(nextItem.description ?? ""),
                    unitLabel: String(duplicateItem.unitLabel ?? "") || String(nextItem.unitLabel ?? ""),
                    unitPrice: ParseNumericValue(duplicateItem.unitPrice, 0) || ParseNumericValue(nextItem.unitPrice, 0),
                    quantity: ParseNumericValue(duplicateItem.quantity, 0) + Math.max(ParseNumericValue(nextItem.quantity, 0), 1),
                }
                const targetIndex = duplicateIndex > index ? duplicateIndex - 1 : duplicateIndex
                const nextItems = currentItems
                    .filter((_item, currentIndex) => currentIndex !== index)
                    .map((currentItemValue, currentIndex) =>
                    {
                        if (currentIndex !== targetIndex)
                        {
                            return currentItemValue
                        }

                        return mergedItem
                    })

                onChange(nextItems)
                ClearTransientState()
                return
            }
        }

        UpdateRow(index, nextItem)

        setRowMessages((currentMessages) => ({
            ...currentMessages,
            [index]: undefined,
        }))
    }

    function HandleAddRow()
    {
        onChange([...itemsRef.current, CreateItem()])
        ClearTransientState()
    }

    function HandleInsertBelow(index: number)
    {
        const nextItems = [...itemsRef.current]

        nextItems.splice(index + 1, 0, CreateItem())
        onChange(nextItems)
        ClearTransientState()
    }

    function HandleRemoveRow(index: number)
    {
        if (itemsRef.current.length <= minRows)
        {
            return
        }

        onChange(itemsRef.current.filter((_item, currentIndex) => currentIndex !== index))
        ClearTransientState()
    }

    function HandleMoveRow(index: number, direction: -1 | 1)
    {
        const targetIndex = index + direction

        if (targetIndex < 0 || targetIndex >= itemsRef.current.length)
        {
            return
        }

        const nextItems = [...itemsRef.current]
        const [movedItem] = nextItems.splice(index, 1)

        nextItems.splice(targetIndex, 0, movedItem)
        onChange(nextItems)
        ClearTransientState()
    }

    async function HandleCodeBlur(index: number)
    {
        if (!onResolveItemByCode)
        {
            return
        }

        const currentItem = itemsRef.current[index]

        if (!currentItem)
        {
            return
        }

        const normalizedCode = NormalizeCode(currentItem.code)

        if (!normalizedCode)
        {
            ClearLookupValues(index)
            return
        }

        setResolvingRows((currentRows) => ({
            ...currentRows,
            [index]: true,
        }))
        setRowMessages((currentMessages) => ({
            ...currentMessages,
            [index]: undefined,
        }))

        try
        {
            const resolvedItem = await onResolveItemByCode(String(currentItem.code).trim(), currentItem, index)
            const latestItem = itemsRef.current[index]

            if (!latestItem || NormalizeCode(latestItem.code) !== normalizedCode)
            {
                return
            }

            if (!resolvedItem)
            {
                setRowMessages((currentMessages) => ({
                    ...currentMessages,
                    [index]: "Item code was not found.",
                }))
                return
            }

            ApplyResolvedItem(index, resolvedItem)
        }
        catch (error)
        {
            const latestItem = itemsRef.current[index]

            if (!latestItem || NormalizeCode(latestItem.code) !== normalizedCode)
            {
                return
            }

            setRowMessages((currentMessages) => ({
                ...currentMessages,
                [index]: error instanceof Error && error.message
                    ? error.message
                    : "Unable to resolve item code.",
            }))
        }
        finally
        {
            setResolvingRows((currentRows) => ({
                ...currentRows,
                [index]: false,
            }))
        }
    }

    function HandleLookupSelect(row: TLookupRow)
    {
        if (lookupRowIndex === null)
        {
            return
        }

        const resolvedItem = lookupConfig?.mapRowToItem
            ? lookupConfig.mapRowToItem(row)
            : BuildLookupItem(row)

        ApplyResolvedItem(lookupRowIndex, resolvedItem)
        setLookupRowIndex(null)
    }

    function HandleDragStart(event: React.DragEvent<HTMLTableRowElement>, index: number)
    {
        if (disabled)
        {
            return
        }

        setDragIndex(index)
        event.dataTransfer.effectAllowed = "move"
        event.dataTransfer.setData("text/plain", String(index))
    }

    function HandleDragOver(event: React.DragEvent<HTMLTableRowElement>, index: number)
    {
        if (disabled)
        {
            return
        }

        event.preventDefault()
        event.dataTransfer.dropEffect = "move"
        setDragOverIndex(index)
    }

    function HandleDragLeave()
    {
        setDragOverIndex(null)
    }

    function HandleDrop(event: React.DragEvent<HTMLTableRowElement>, dropIndex: number)
    {
        event.preventDefault()

        if (disabled || dragIndex === null || dragIndex === dropIndex)
        {
            setDragIndex(null)
            setDragOverIndex(null)
            return
        }

        const nextItems = [...itemsRef.current]
        const [movedItem] = nextItems.splice(dragIndex, 1)

        nextItems.splice(dropIndex, 0, movedItem)
        onChange(nextItems)
        ClearTransientState()
    }

    function HandleDragEnd()
    {
        setDragIndex(null)
        setDragOverIndex(null)
    }

    function ComputeLineTotal(item: ILineItemValue): number
    {
        return ParseNumericValue(item.quantity, 0) * ParseNumericValue(item.unitPrice, 0)
    }

    const itemsCountLabel = BuildItemCountLabel(value.length, itemLabel)
    const totalAmount = value.reduce((sum, currentItem) => sum + ComputeLineTotal(currentItem), 0)

    return (
        <div className="rounded-lg border bg-card shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
                <div>
                    <h3 className="text-base font-semibold text-foreground">{title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {itemsCountLabel}
                        {!disabled && value.length > 0 && " added • Drag rows to reorder"}
                    </p>
                </div>

                <Button disabled={disabled} onClick={HandleAddRow} type="button">
                    <Plus className="size-4" />
                    {addButtonLabel}
                </Button>
            </div>

            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[72px] text-center">#</TableHead>
                            <TableHead className="min-w-[240px]">{codeLabel}</TableHead>
                            <TableHead className="min-w-[220px]">{nameLabel}</TableHead>
                            {showDescription && <TableHead className="min-w-[260px]">{descriptionLabel}</TableHead>}
                            {showUnit && <TableHead className="w-[120px]">{unitLabel}</TableHead>}
                            <TableHead className="w-[120px] text-right">{quantityLabel}</TableHead>
                            {showPricing && <TableHead className="w-[140px] text-right">{unitPriceLabel}</TableHead>}
                            {showPricing && <TableHead className="w-[140px] text-right">{totalLabel}</TableHead>}
                            <TableHead className="w-[168px] text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {value.map((item, index) => (
                            <LineItemRow
                                allowLookup={Boolean(lookupConfig)}
                                allowManualNameEdit={allowManualNameEdit}
                                allowUnitPriceEdit={allowUnitPriceEdit}
                                computeLineTotal={ComputeLineTotal}
                                disabled={disabled}
                                formatCurrency={formatCurrency}
                                index={index}
                                isDragOver={dragOverIndex === index && dragIndex !== index}
                                isDragging={dragIndex === index}
                                isResolving={Boolean(resolvingRows[index])}
                                item={item}
                                itemsLength={value.length}
                                key={`${String(item.id ?? item.code ?? index)}-${index}`}
                                message={rowMessages[index]}
                                minRows={minRows}
                                onClearLookupValues={() => ClearLookupValues(index)}
                                onCodeBlur={() => { void HandleCodeBlur(index) }}
                                onCodeChange={(nextCode) =>
                                {
                                    UpdateRow(index, { code: nextCode })
                                    setRowMessages((currentMessages) => ({
                                        ...currentMessages,
                                        [index]: undefined,
                                    }))
                                }}
                                onDescriptionChange={(nextDescription) => UpdateRow(index, { description: nextDescription })}
                                onDragEnd={HandleDragEnd}
                                onDragLeave={HandleDragLeave}
                                onDragOver={HandleDragOver}
                                onDragStart={HandleDragStart}
                                onDrop={HandleDrop}
                                onInsertBelow={() => HandleInsertBelow(index)}
                                onMoveDown={() => HandleMoveRow(index, 1)}
                                onMoveUp={() => HandleMoveRow(index, -1)}
                                onNameChange={(nextName) => UpdateRow(index, { name: nextName })}
                                onOpenLookup={() => setLookupRowIndex(index)}
                                onQuantityChange={(nextQuantity) => UpdateRow(index, { quantity: nextQuantity })}
                                onRemove={() => HandleRemoveRow(index)}
                                onUnitPriceChange={(nextUnitPrice) => UpdateRow(index, { unitPrice: nextUnitPrice })}
                                quantityStep={quantityStep}
                                showDescription={showDescription}
                                showPricing={showPricing}
                                showUnit={showUnit}
                            />
                        ))}

                        {value.length === 0 && (
                            <TableRow>
                                <TableCell
                                    className="py-10 text-center text-muted-foreground"
                                    colSpan={showDescription
                                        ? showPricing
                                            ? (showUnit ? 8 : 7)
                                            : (showUnit ? 6 : 5)
                                        : showPricing
                                            ? (showUnit ? 7 : 6)
                                            : (showUnit ? 5 : 4)
                                    }
                                >
                                    <div className="mx-auto flex max-w-sm flex-col items-center gap-2">
                                        <div className="rounded-full bg-muted p-3 text-muted-foreground">
                                            <Plus className="size-5" />
                                        </div>
                                        <p className="font-medium text-foreground">{emptyMessage}</p>
                                        <p className="text-sm text-muted-foreground">
                                            Add the first {itemLabel} to start building the list.
                                        </p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {showPricing && value.length > 0 && (
                <div className="flex justify-end border-t px-5 py-4">
                    <div className="flex min-w-[240px] items-center justify-between rounded-md border bg-muted/40 px-4 py-3">
                        <span className="text-sm font-medium text-muted-foreground">Subtotal</span>
                        <span className="text-base font-semibold text-foreground">{formatCurrency(totalAmount)}</span>
                    </div>
                </div>
            )}

            {lookupConfig && lookupRowIndex !== null && (
                <ListPickerModal<TLookupRow>
                    columns={lookupConfig.columns}
                    emptyDefault={lookupConfig.emptyDefault}
                    emptySearch={lookupConfig.emptySearch}
                    fetchData={lookupConfig.fetchData}
                    initialSearch={String(value[lookupRowIndex]?.code ?? "")}
                    isOpen={lookupRowIndex !== null}
                    itemName={lookupConfig.itemName ?? itemLabel}
                    onClose={() => setLookupRowIndex(null)}
                    onSelect={HandleLookupSelect}
                    searchPlaceholder={lookupConfig.searchPlaceholder ?? "Search item code or name..."}
                    title={lookupConfig.title ?? `Select ${itemLabel}`}
                />
            )}
        </div>
    )
}

export type { ILineItemsEditorProps }
