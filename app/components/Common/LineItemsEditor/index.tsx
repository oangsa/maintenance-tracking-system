import React from "react"
import {
    ArrowDown,
    ArrowUp,
    Plus,
    Trash2,
} from "lucide-react"
import { Button } from "~/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "~/components/ui/table"
import { cn } from "~/lib/utils"

export interface ILineItemValue extends Record<string, unknown>
{
    id?: string | number;
}

export interface ILineItemRowHandlers
{
    moveUp: () => void;
    moveDown: () => void;
    insertBelow: () => void;
    remove: () => void;
}

export interface ILineItemColumnRenderContext<TItem extends ILineItemValue = ILineItemValue>
{
    index: number;
    item: TItem;
    itemsLength: number;
    disabled: boolean;
    readOnly: boolean;
    isDragging: boolean;
    isDragOver: boolean;
    minRows: number;
    updateItem: (patch: Partial<TItem>) => void;
    replaceItem: (nextItem: TItem) => void;
    rowHandlers: ILineItemRowHandlers;
    renderReadOnlyValue: (value: React.ReactNode, className?: string) => React.ReactNode;
    renderDefaultActions: (extraActions?: React.ReactNode) => React.ReactNode;
}

export interface ILineItemColumn<TItem extends ILineItemValue = ILineItemValue>
{
    key: string;
    label: string;
    headerClassName?: string;
    cellClassName?: string;
    renderCell: (context: ILineItemColumnRenderContext<TItem>) => React.ReactNode;
    renderHeader?: () => React.ReactNode;
}

interface IBaseLineItemsEditorProps<TItem extends ILineItemValue>
{
    value: TItem[];
    onChange: (items: TItem[]) => void;
    columns: ILineItemColumn<TItem>[];
    title?: string;
    addButtonLabel?: string;
    itemLabel?: string;
    emptyMessage?: string;
    minRows?: number;
    disabled?: boolean;
    hideAddButton?: boolean;
}

interface IEditableLineItemsEditorProps<TItem extends ILineItemValue>
{
    readOnly?: false;
    createEmptyItem: () => TItem;
}

interface IReadOnlyLineItemsEditorProps
{
    readOnly: true;
    createEmptyItem?: never;
}

export type ILineItemsEditorProps<TItem extends ILineItemValue = ILineItemValue> = IBaseLineItemsEditorProps<TItem>
    & (IEditableLineItemsEditorProps<TItem> | IReadOnlyLineItemsEditorProps)

interface ILineItemRowProps<TItem extends ILineItemValue>
{
    columns: ILineItemColumn<TItem>[];
    index: number;
    item: TItem;
    itemsLength: number;
    disabled: boolean;
    readOnly: boolean;
    minRows: number;
    isDragging: boolean;
    isDragOver: boolean;
    onUpdateItem: (index: number, patch: Partial<TItem>) => void;
    onReplaceItem: (index: number, nextItem: TItem) => void;
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

function BuildItemCountLabel(count: number, itemLabel: string): string
{
    return `${count} ${itemLabel}${count === 1 ? "" : "s"}`
}

function RenderReadOnlyValue(value: React.ReactNode, className?: string): React.ReactNode
{
    return (
        <div className={cn("rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-foreground", className)}>
            {value}
        </div>
    )
}

function ResolveItemKey<TItem extends ILineItemValue>(item: TItem, index: number): string
{
    return `${String(item.id ?? index)}-${index}`
}

function LineItemRow<TItem extends ILineItemValue>({
    columns,
    index,
    item,
    itemsLength,
    disabled,
    readOnly,
    minRows,
    isDragging,
    isDragOver,
    onUpdateItem,
    onReplaceItem,
    onMoveUp,
    onMoveDown,
    onInsertBelow,
    onRemove,
    onDragStart,
    onDragOver,
    onDragLeave,
    onDrop,
    onDragEnd,
}: ILineItemRowProps<TItem>)
{
    const rowHandlers: ILineItemRowHandlers = {
        insertBelow: onInsertBelow,
        moveDown: onMoveDown,
        moveUp: onMoveUp,
        remove: onRemove,
    }

    function renderDefaultActions(extraActions?: React.ReactNode): React.ReactNode
    {
        if (readOnly && !extraActions)
        {
            return null
        }

        return (
            <div className="flex flex-wrap items-center justify-end gap-1">
                {extraActions}

                {!readOnly && (
                    <>
                        <Button
                            disabled={disabled || index === 0}
                            onClick={rowHandlers.moveUp}
                            size="icon-xs"
                            title="Move item up"
                            type="button"
                            variant="ghost"
                        >
                            <ArrowUp className="size-3.5" />
                        </Button>
                        <Button
                            disabled={disabled || index >= itemsLength - 1}
                            onClick={rowHandlers.moveDown}
                            size="icon-xs"
                            title="Move item down"
                            type="button"
                            variant="ghost"
                        >
                            <ArrowDown className="size-3.5" />
                        </Button>
                        <Button
                            disabled={disabled}
                            onClick={rowHandlers.insertBelow}
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
                            onClick={rowHandlers.remove}
                            size="icon-xs"
                            title="Remove item"
                            type="button"
                            variant="ghost"
                        >
                            <Trash2 className="size-3.5" />
                        </Button>
                    </>
                )}
            </div>
        )
    }

    const renderContext: ILineItemColumnRenderContext<TItem> = {
        disabled,
        index,
        isDragOver,
        isDragging,
        item,
        itemsLength,
        minRows,
        readOnly,
        renderDefaultActions,
        renderReadOnlyValue: RenderReadOnlyValue,
        replaceItem: (nextItem) => onReplaceItem(index, nextItem),
        rowHandlers,
        updateItem: (patch) => onUpdateItem(index, patch),
    }

    return (
        <TableRow
            className={cn(
                isDragging && "opacity-50",
                isDragOver && "bg-muted/60",
            )}
            draggable={!disabled && !readOnly}
            onDragEnd={onDragEnd}
            onDragLeave={onDragLeave}
            onDragOver={(event) => onDragOver(event, index)}
            onDragStart={(event) => onDragStart(event, index)}
            onDrop={(event) => onDrop(event, index)}
        >
            {columns.map((column) => (
                <TableCell className={cn("align-top", column.cellClassName)} key={column.key}>
                    {column.renderCell(renderContext)}
                </TableCell>
            ))}
        </TableRow>
    )
}

export default function LineItemsEditor<TItem extends ILineItemValue = ILineItemValue>(props: ILineItemsEditorProps<TItem>)
{
    const {
        value,
        onChange,
        columns,
        title = "Line Items",
        addButtonLabel = "Add Item",
        itemLabel = "item",
        emptyMessage = "No items added yet.",
        minRows = 1,
        disabled = false,
        hideAddButton = false,
    } = props

    const readOnly = props.readOnly === true
    const createEmptyItem = "createEmptyItem" in props ? props.createEmptyItem : undefined

    const [dragIndex, setDragIndex] = React.useState<number | null>(null)
    const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null)

    const itemsRef = React.useRef(value)

    itemsRef.current = value

    function CreateItem(): TItem
    {
        if (!createEmptyItem)
        {
            throw new Error("LineItemsEditor requires createEmptyItem when readOnly is false.")
        }

        return createEmptyItem()
    }

    function UpdateRow(index: number, patch: Partial<TItem>)
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

    function ReplaceRow(index: number, nextItem: TItem)
    {
        const nextItems = itemsRef.current.map((currentItem, currentIndex) =>
        {
            if (currentIndex !== index)
            {
                return currentItem
            }

            return nextItem
        })

        onChange(nextItems)
    }

    function HandleAddRow()
    {
        onChange([...itemsRef.current, CreateItem()])
    }

    function HandleInsertBelow(index: number)
    {
        const nextItems = [...itemsRef.current]

        nextItems.splice(index + 1, 0, CreateItem())
        onChange(nextItems)
    }

    function HandleRemoveRow(index: number)
    {
        if (itemsRef.current.length <= minRows)
        {
            return
        }

        onChange(itemsRef.current.filter((_item, currentIndex) => currentIndex !== index))
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
    }

    function HandleDragStart(event: React.DragEvent<HTMLTableRowElement>, index: number)
    {
        if (disabled || readOnly)
        {
            return
        }

        setDragIndex(index)
        event.dataTransfer.effectAllowed = "move"
        event.dataTransfer.setData("text/plain", String(index))
    }

    function HandleDragOver(event: React.DragEvent<HTMLTableRowElement>, index: number)
    {
        if (disabled || readOnly)
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

        if (disabled || readOnly || dragIndex === null || dragIndex === dropIndex)
        {
            setDragIndex(null)
            setDragOverIndex(null)
            return
        }

        const nextItems = [...itemsRef.current]
        const [movedItem] = nextItems.splice(dragIndex, 1)

        nextItems.splice(dropIndex, 0, movedItem)
        onChange(nextItems)
        setDragIndex(null)
        setDragOverIndex(null)
    }

    function HandleDragEnd()
    {
        setDragIndex(null)
        setDragOverIndex(null)
    }

    const itemsCountLabel = BuildItemCountLabel(value.length, itemLabel)
    const shouldShowAddButton = !readOnly && !hideAddButton
    const visibleColumnCount = Math.max(columns.length, 1)

    return (
        <div className="rounded-lg border bg-card shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
                <div>
                    <h3 className="text-base font-semibold text-foreground">{title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {itemsCountLabel}
                        {!disabled && !readOnly && value.length > 0 && " added • Drag rows to reorder"}
                    </p>
                </div>

                {shouldShowAddButton && (
                    <Button disabled={disabled} onClick={HandleAddRow} type="button">
                        <Plus className="size-4" />
                        {addButtonLabel}
                    </Button>
                )}
            </div>

            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {columns.map((column) => (
                                <TableHead className={column.headerClassName} key={column.key}>
                                    {column.renderHeader ? column.renderHeader() : column.label}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {value.map((item, index) => (
                            <LineItemRow
                                columns={columns}
                                disabled={disabled}
                                index={index}
                                isDragOver={dragOverIndex === index && dragIndex !== index}
                                isDragging={dragIndex === index}
                                item={item}
                                itemsLength={value.length}
                                key={ResolveItemKey(item, index)}
                                minRows={minRows}
                                onDragEnd={HandleDragEnd}
                                onDragLeave={HandleDragLeave}
                                onDragOver={HandleDragOver}
                                onDragStart={HandleDragStart}
                                onDrop={HandleDrop}
                                onInsertBelow={() => HandleInsertBelow(index)}
                                onMoveDown={() => HandleMoveRow(index, 1)}
                                onMoveUp={() => HandleMoveRow(index, -1)}
                                onRemove={() => HandleRemoveRow(index)}
                                onReplaceItem={ReplaceRow}
                                onUpdateItem={UpdateRow}
                                readOnly={readOnly}
                            />
                        ))}

                        {value.length === 0 && (
                            <TableRow>
                                <TableCell className="py-10 text-center text-muted-foreground" colSpan={visibleColumnCount}>
                                    <div className="mx-auto flex max-w-sm flex-col items-center gap-2">
                                        {!readOnly && (
                                            <div className="rounded-full bg-muted p-3 text-muted-foreground">
                                                <Plus className="size-5" />
                                            </div>
                                        )}
                                        <p className="font-medium text-foreground">{emptyMessage}</p>
                                        {!readOnly && (
                                            <p className="text-sm text-muted-foreground">
                                                Add the first {itemLabel} to start building the list.
                                            </p>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
