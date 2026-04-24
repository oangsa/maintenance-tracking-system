import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FiSearch, FiX } from "react-icons/fi";
import { GripVertical, LoaderCircle } from "lucide-react";
import { z } from "zod";
import type { FieldErrors } from "react-hook-form";
import CommonForm, { FormActions } from "~/components/Common/Form";
import LineItemsEditor, { type ILineItemColumn, type ILineItemPickerColumn, type ILineItemPickerFetchParams } from "~/components/Common/LineItemsEditor";
import { useManagedForm } from "~/components/Common/Form/useManagedForm";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import type { IProduct, IUser } from "~/api/types/types";
import { buildLookupPayload } from "~/constants";
import { formatDepartmentLabel, formatRequesterLabel } from "~/lib/formatters";
import { searchProducts } from "~/services/products.service";
import { createEmptyRepairRequestLineItem, mapProductToLineItem, parsePositiveNumber } from "./hooks/helpers";
import { useFormItem } from "./hooks/useFormItem";
import type { IRepairRequestFormLineItem, IRepairRequestFormValues } from "./hooks/helpers";
import { RepairRequestFormSchema } from "~/schemas/repairRequestFormSchema";

type IProductPickerRow = IProduct & Record<string, unknown>;

interface IRepairRequestFormProps
{
    mode: "create" | "edit";
    currentUser: IUser;
    initialValues: IRepairRequestFormValues;
    submitting?: boolean;
    onCancel: () => void;
    onSubmit: (values: IRepairRequestFormValues) => void | Promise<void>;
}

interface IRepairRequestFormErrors
{
    items?: string;
    itemIssues: string[];
    priority?: string;
}

function resolveErrorMessage(errorValue: unknown): string | undefined
{
    if (!errorValue || typeof errorValue !== "object")
    {
        return undefined;
    }

    if (!("message" in errorValue))
    {
        return undefined;
    }

    const messageValue = (errorValue as { message?: unknown }).message;

    if (typeof messageValue === "string" && messageValue.trim() !== "")
    {
        return messageValue;
    }

    return undefined;
}

function mapRepairRequestFormErrors(fieldErrors: FieldErrors<IRepairRequestFormValues>): IRepairRequestFormErrors
{
    const nextItemIssues: string[] = [];
    const itemErrors = fieldErrors.items;

    if (Array.isArray(itemErrors))
    {
        itemErrors.forEach((itemError, index) =>
        {
            if (!itemError || typeof itemError !== "object")
            {
                return;
            }

            Object.values(itemError).forEach((fieldErrorValue) =>
            {
                const message = resolveErrorMessage(fieldErrorValue);

                if (!message)
                {
                    return;
                }

                nextItemIssues.push(`Item ${index + 1}: ${message}`);
            });
        });
    }

    let itemsMessage = resolveErrorMessage(itemErrors);

    if (!itemsMessage && nextItemIssues.length > 0)
    {
        itemsMessage = "Review the repair request items and complete all required fields.";
    }

    return {
        itemIssues: nextItemIssues,
        items: itemsMessage,
        priority: fieldErrors.priority?.message,
    };
}

export default function RepairRequestForm({
    mode,
    currentUser,
    initialValues,
    submitting = false,
    onCancel,
    onSubmit,
}: IRepairRequestFormProps)
{
    const resolvedSchema = React.useMemo(() => RepairRequestFormSchema.superRefine((currentValues, ctx) =>
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
    }), []);
    const {
        values,
        errors: formErrors,
        clearFieldError,
        handleFormSubmit,
        setFieldValue,
    } = useManagedForm<IRepairRequestFormValues, IRepairRequestFormErrors>({
        initialValues,
        mapErrors: mapRepairRequestFormErrors,
        onSubmit,
        resolver: zodResolver(resolvedSchema),
    });
    const [itemMessages, setItemMessages] = React.useState<Record<number, string | undefined>>({});
    const [resolvingRows, setResolvingRows] = React.useState<Record<number, boolean>>({});

    const fieldErrors = React.useMemo<Partial<Record<keyof IRepairRequestFormValues, string>>>(() => ({
        items: formErrors.items,
        priority: formErrors.priority,
    }), [formErrors.items, formErrors.priority]);

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
        setItemMessages({});
        setResolvingRows({});
    }, [initialValues]);

    const requesterLabel = formatRequesterLabel(currentUser.name, currentUser.email);
    const departmentLabel = formatDepartmentLabel(currentUser.departmentCode, currentUser.departmentName);

    function handleValueChange<TKey extends keyof IRepairRequestFormValues>(fieldName: TKey, value: IRepairRequestFormValues[TKey])
    {
        setFieldValue(fieldName, value);
    }

    function handleItemsChange(nextItems: IRepairRequestFormLineItem[])
    {
        setFieldValue("items", nextItems);
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
        const response = await searchProducts(buildLookupPayload("product", {
            limit: params.limit,
            page: params.page,
            search: params.search,
            sortBy: params.sortBy,
            sortDir: params.sortDir,
        }));

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
            ...buildLookupPayload("product", {
                limit: 1,
                page: 1,
                search: "",
            }),
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

    // TODO: Extract line items editor into a separate component to avoid passing so many props and callbacks
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

    const { formItems } = useFormItem<IProductPickerRow>({
        mode,
        departmentLabel,
        itemIssues: formErrors.itemIssues,
        items: values.items,
        itemsError: formErrors.items,
        lineItemColumns,
        onItemsChange: handleItemsChange,
        requesterLabel,
    });

    return (
        <CommonForm
            actions={(
                <FormActions
                    cancelDisabled={submitting}
                    onCancel={onCancel}
                    submitDisabled={submitting}
                    submitLabel={mode === "create" ? "Create Repair Request" : "Save Changes"}
                    submitting={submitting}
                    submittingLabel={mode === "create" ? "Creating..." : "Saving..."}
                />
            )}
            clearError={clearFieldError}
            disabled={submitting}
            errors={fieldErrors}
            onSubmit={handleFormSubmit}
            sections={formItems}
            setValue={handleValueChange}
            values={values}
        />
    );
}
