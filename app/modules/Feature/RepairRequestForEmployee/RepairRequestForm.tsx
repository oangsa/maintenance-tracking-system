import React from "react";
import {
    FiSearch,
    FiX,
} from "react-icons/fi";
import {
    GripVertical,
    LoaderCircle,
} from "lucide-react";
import { z } from "zod";
import LineItemsEditor, {
    type ILineItemColumn,
    type ILineItemPickerColumn,
    type ILineItemPickerFetchParams,
} from "../../../components/Common/LineItemsEditor/index";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import type { IProduct, IPriority, IUser } from "~/api/types";
import { searchProducts } from "~/services/products.service";
import {
    createEmptyRepairRequestLineItem,
    formatDepartmentLabel,
    formatRequesterLabel,
    formatTitleCase,
    mapProductToLineItem,
    parsePositiveNumber,
} from "./helpers";
import type {
    IRepairRequestFormLineItem,
    IRepairRequestFormValues,
} from "./helpers";
import { RepairRequestFormSchema } from "~/schemas/repairRequestFormSchema";
import { PRIORITY_OPTIONS as priorityOptions } from "@/constants/priority.constant";

type IProductPickerRow = IProduct & Record<string, unknown>;

interface IRepairRequestFormProps
{
    currentUser: IUser;
    initialValues: IRepairRequestFormValues;
    submitting?: boolean;
    error?: string;
    onCancel: () => void;
    onSubmit: (values: IRepairRequestFormValues) => void | Promise<void>;
}

interface IRepairRequestFormErrors
{
    items?: string;
    itemIssues: string[];
    priority?: string;
}

;

function validateForm(values: IRepairRequestFormValues): IRepairRequestFormErrors
{
    const nextErrors: IRepairRequestFormErrors = {
        itemIssues: [],
    };
    const validationResult = RepairRequestFormSchema.superRefine((currentValues, ctx) =>
    {
        currentValues.items.forEach((item, index) =>
        {
            const quantity = parsePositiveNumber(item.quantity);

            if (quantity === null)
            {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Quantity must be greater than 0.",
                    path: ["items", index, "quantity"],
                });
            }
        });
    }).safeParse(values);

    if (validationResult.success)
    {
        return nextErrors;
    }

    for (const issue of validationResult.error.issues)
    {
        const [fieldName, itemIndex] = issue.path;

        if (fieldName === "items" && typeof itemIndex === "number")
        {
            nextErrors.itemIssues.push(`Item ${itemIndex + 1}: ${issue.message}`);
            continue;
        }

        if (fieldName === "priority" && !nextErrors.priority)
        {
            nextErrors.priority = issue.message;
        }

        if (fieldName === "items" && !nextErrors.items)
        {
            nextErrors.items = issue.message;
        }
    }

    if (nextErrors.itemIssues.length > 0 && !nextErrors.items)
    {
        nextErrors.items = "Review the repair request items and complete all required fields.";
    }

    return nextErrors;
}

export default function RepairRequestForm({
    currentUser,
    initialValues,
    submitting = false,
    error = "",
    onCancel,
    onSubmit,
}: IRepairRequestFormProps)
{
    const [values, setValues] = React.useState<IRepairRequestFormValues>(initialValues);
    const [formErrors, setFormErrors] = React.useState<IRepairRequestFormErrors>({ itemIssues: [] });
    const [itemMessages, setItemMessages] = React.useState<Record<number, string | undefined>>({});
    const [resolvingRows, setResolvingRows] = React.useState<Record<number, boolean>>({});

    const itemsRef = React.useRef(initialValues.items);

    itemsRef.current = values.items;

    const productColumns = React.useMemo<ILineItemPickerColumn<IProductPickerRow>[]>(() => [
        {
            key: "code",
            label: "Code",
        },
        {
            key: "name",
            label: "Name",
        },
        {
            key: "productTypeName",
            label: "Product Type",
        },
    ], []);

    React.useEffect(() =>
    {
        setValues(initialValues);
        setFormErrors({ itemIssues: [] });
        setItemMessages({});
        setResolvingRows({});
    }, [initialValues]);

    const requesterLabel = formatRequesterLabel(currentUser.name, currentUser.email);
    const departmentLabel = formatDepartmentLabel(currentUser.departmentCode, currentUser.departmentName);

    function handleSubmit(event: React.FormEvent<HTMLFormElement>)
    {
        event.preventDefault();

        const nextErrors = validateForm(values);

        if (nextErrors.priority || nextErrors.items || nextErrors.itemIssues.length > 0)
        {
            setFormErrors(nextErrors);
            return;
        }

        void onSubmit(values);
    }

    function handleItemsChange(nextItems: IRepairRequestFormLineItem[])
    {
        setValues((currentValues) => ({
            ...currentValues,
            items: nextItems,
        }));
        setFormErrors((currentErrors) => ({
            ...currentErrors,
            itemIssues: [],
            items: undefined,
        }));
    }

    function updateItem(index: number, patch: Partial<IRepairRequestFormLineItem>)
    {
        handleItemsChange(itemsRef.current.map((item, itemIndex) =>
        {
            if (itemIndex !== index)
            {
                return item;
            }

            return {
                ...item,
                ...patch,
            };
        }));
    }

    function replaceItem(index: number, nextItem: IRepairRequestFormLineItem)
    {
        handleItemsChange(itemsRef.current.map((item, itemIndex) =>
        {
            if (itemIndex !== index)
            {
                return item;
            }

            return nextItem;
        }));
    }

    function clearProductSelection(index: number)
    {
        updateItem(index, {
            code: "",
            name: "",
            productId: "",
        });
        setItemMessages((currentMessages) => ({
            ...currentMessages,
            [index]: undefined,
        }));
    }

    const fetchProducts = React.useCallback(async (params: ILineItemPickerFetchParams) =>
    {
        const response = await searchProducts({
            deleted: false,
            orderBy: params.sortBy
                ? `${params.sortBy} ${params.sortDir === "desc" ? "desc" : "asc"}`
                : "code asc",
            pageNumber: params.page,
            pageSize: params.limit,
            searchTerm: params.search
                ? {
                    name: "code,name",
                    value: params.search,
                }
                : undefined,
        });

        return {
            currentPage: response.pagination.currentPage,
            data: response.data as IProductPickerRow[],
            hasNext: response.pagination.hasNext,
            hasPrevious: response.pagination.hasPrevious,
            pageItemCount: response.pagination.pageSize,
            total: response.pagination.totalCount,
            totalPages: response.pagination.totalPages,
        };
    }, []);

    const resolveProductByCode = React.useCallback(async (code: string) =>
    {
        const response = await searchProducts({
            deleted: false,
            orderBy: "code asc",
            pageNumber: 1,
            pageSize: 1,
            search: [
                {
                    condition: "EQUAL",
                    name: "code",
                    value: code,
                },
            ],
        });

        const matchedProduct = response.data[0];

        if (!matchedProduct)
        {
            return null;
        }

        return mapProductToLineItem(matchedProduct);
    }, []);

    async function handleCodeBlur(index: number)
    {
        const currentItem = itemsRef.current[index];

        if (!currentItem)
        {
            return;
        }

        const normalizedCode = String(currentItem.code ?? "").trim().toLowerCase();

        if (!normalizedCode)
        {
            clearProductSelection(index);
            return;
        }

        setResolvingRows((currentRows) => ({
            ...currentRows,
            [index]: true,
        }));
        setItemMessages((currentMessages) => ({
            ...currentMessages,
            [index]: undefined,
        }));

        try
        {
            const resolvedItem = await resolveProductByCode(String(currentItem.code).trim());
            const latestItem = itemsRef.current[index];

            if (!latestItem || String(latestItem.code ?? "").trim().toLowerCase() !== normalizedCode)
            {
                return;
            }

            if (!resolvedItem)
            {
                setItemMessages((currentMessages) => ({
                    ...currentMessages,
                    [index]: "Product code was not found.",
                }));
                return;
            }

            replaceItem(index, {
                ...latestItem,
                ...resolvedItem,
                code: String(resolvedItem.code ?? latestItem.code ?? "").trim(),
                name: String(resolvedItem.name ?? latestItem.name ?? "").trim(),
            });
            setItemMessages((currentMessages) => ({
                ...currentMessages,
                [index]: undefined,
            }));
        }
        catch (error)
        {
            const latestItem = itemsRef.current[index];

            if (!latestItem || String(latestItem.code ?? "").trim().toLowerCase() !== normalizedCode)
            {
                return;
            }

            setItemMessages((currentMessages) => ({
                ...currentMessages,
                [index]: error instanceof Error && error.message
                    ? error.message
                    : "Unable to resolve product code.",
            }));
        }
        finally
        {
            setResolvingRows((currentRows) => ({
                ...currentRows,
                [index]: false,
            }));
        }
    }

    const lineItemColumns = React.useMemo<ILineItemColumn<IRepairRequestFormLineItem, IProductPickerRow>[]>(() => [
        {
            cellClassName: "w-[72px] align-top",
            headerClassName: "w-[72px] text-center",
            key: "index",
            label: "#",
            renderCell: (context) => (
                <div className="flex items-center justify-center gap-1.5 pt-2 text-muted-foreground">
                    {!context.readOnly && <GripVertical className="size-4" />}
                    <span className="min-w-5 text-center text-xs font-semibold">{context.index + 1}</span>
                </div>
            ),
        },
        {
            cellClassName: "min-w-[240px] align-top",
            headerClassName: "min-w-[240px]",
            key: "code",
            label: "Product Code",
            renderCell: (context) => (
                <div className="space-y-2">
                    <div className="flex items-start gap-2">
                        <Input
                            aria-invalid={Boolean(itemMessages[context.index])}
                            className="min-w-0"
                            disabled={context.disabled}
                            onBlur={() => { void handleCodeBlur(context.index); }}
                            onChange={(event) =>
                            {
                                context.updateItem({ code: event.target.value });
                                setItemMessages((currentMessages) => ({
                                    ...currentMessages,
                                    [context.index]: undefined,
                                }));
                            }}
                            placeholder="Enter product code"
                            type="text"
                            value={String(context.item.code ?? "")}
                        />

                        <Button
                            disabled={context.disabled || !context.openPicker}
                            onClick={() => context.openPicker?.()}
                            size="icon-sm"
                            title="Lookup product"
                            type="button"
                            variant="outline"
                        >
                            <FiSearch className="size-4" />
                        </Button>

                        {String(context.item.code ?? "").trim() !== "" && (
                            <Button
                                disabled={context.disabled}
                                onClick={() => clearProductSelection(context.index)}
                                size="icon-sm"
                                title="Clear product"
                                type="button"
                                variant="ghost"
                            >
                                <FiX className="size-4" />
                            </Button>
                        )}
                    </div>

                    {(itemMessages[context.index] || resolvingRows[context.index]) && (
                        <div className="flex min-h-5 items-center gap-1.5 text-xs">
                            {resolvingRows[context.index] && (
                                <>
                                    <LoaderCircle className="size-3 animate-spin text-muted-foreground" />
                                    <span className="text-muted-foreground">Resolving product code...</span>
                                </>
                            )}

                            {!resolvingRows[context.index] && itemMessages[context.index] && (
                                <span className="text-destructive">{itemMessages[context.index]}</span>
                            )}
                        </div>
                    )}
                </div>
            ),
            renderPicker: (context) => ({
                columns: productColumns,
                emptyDefault: "No products are available.",
                emptySearch: "No matching products found.",
                fetchData: fetchProducts,
                getInitialSearch: (pickerContext) => String(pickerContext.item.code ?? ""),
                itemName: "products",
                onSelect: (product, pickerContext) =>
                {
                    const mappedItem = mapProductToLineItem(product);

                    pickerContext.replaceItem({
                        ...pickerContext.item,
                        ...mappedItem,
                        code: mappedItem.code,
                        name: mappedItem.name,
                    });
                    setItemMessages((currentMessages) => ({
                        ...currentMessages,
                        [pickerContext.index]: undefined,
                    }));
                },
                searchPlaceholder: "Search product code or name...",
                title: "Select Product",
            }),
        },
        {
            cellClassName: "min-w-[220px] align-top",
            headerClassName: "min-w-[220px]",
            key: "name",
            label: "Product Name",
            renderCell: (context) => (
                <Input
                    disabled
                    readOnly
                    type="text"
                    value={String(context.item.name ?? "")}
                />
            ),
        },
        {
            cellClassName: "min-w-[260px] align-top",
            headerClassName: "min-w-[260px]",
            key: "description",
            label: "Issue Description",
            renderCell: (context) => (
                <Textarea
                    className="min-h-20 resize-y"
                    disabled={context.disabled}
                    onChange={(event) => context.updateItem({ description: event.target.value })}
                    placeholder="Describe the issue"
                    value={String(context.item.description ?? "")}
                />
            ),
        },
        {
            cellClassName: "w-[120px] align-top",
            headerClassName: "w-[120px] text-right",
            key: "quantity",
            label: "Quantity",
            renderCell: (context) => (
                <Input
                    className="text-right"
                    disabled={context.disabled}
                    min={1}
                    onChange={(event) => context.updateItem({ quantity: event.target.value })}
                    step={1}
                    type="number"
                    value={String(context.item.quantity ?? "")}
                />
            ),
        },
        {
            cellClassName: "w-[168px] align-top",
            headerClassName: "w-[168px] text-right",
            key: "actions",
            label: "Actions",
            renderCell: (context) => context.renderDefaultActions(),
        },
    ], [fetchProducts, itemMessages, productColumns, resolvingRows]);

    return (
        <div className="card">
            {error && <div className="alert alert-error">{error}</div>}

            <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label>Requester</Label>
                        <div className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-foreground">
                            {requesterLabel}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Department</Label>
                        <div className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-foreground">
                            {departmentLabel}
                        </div>
                    </div>

                    <div className="space-y-2 md:max-w-xs">
                        <Label htmlFor="priority">
                            Priority
                            <span className="required-marker">*</span>
                        </Label>
                        <Select
                            value={values.priority}
                            onValueChange={(value) =>
                            {
                                setValues((currentValues) => ({
                                    ...currentValues,
                                    priority: value as IPriority,
                                }));
                                setFormErrors((currentErrors) => ({
                                    ...currentErrors,
                                    priority: undefined,
                                }));
                            }}
                        >
                            <SelectTrigger aria-invalid={Boolean(formErrors.priority)} className="w-full" id="priority">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {priorityOptions.map((priorityOption) => (
                                    <SelectItem key={priorityOption} value={priorityOption}>
                                        {formatTitleCase(priorityOption)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {formErrors.priority && <span className="form-error">{formErrors.priority}</span>}
                    </div>
                </div>

                <LineItemsEditor<IRepairRequestFormLineItem, IProductPickerRow>
                    addButtonLabel="Add Product"
                    columns={lineItemColumns}
                    createEmptyItem={createEmptyRepairRequestLineItem}
                    emptyMessage="No repair request items added yet."
                    itemLabel="product"
                    onChange={handleItemsChange}
                    title="Repair Request Items"
                    value={values.items}
                />

                {formErrors.items && <div className="form-error">{formErrors.items}</div>}
                {formErrors.itemIssues.length > 0 && (
                    <div className="space-y-1 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                        {formErrors.itemIssues.map((issue) => (
                            <p key={issue}>{issue}</p>
                        ))}
                    </div>
                )}

                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <Button disabled={submitting} onClick={onCancel} type="button" variant="outline">
                        Cancel
                    </Button>
                    <Button disabled={submitting} type="submit">
                        {submitting ? "Creating..." : "Create Repair Request"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
