import React from "react";
import { z } from "zod";
import LineItemsEditor, { type ILineItemLookupFetchParams } from "~/components/Common/LineItemsEditor";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select";
import type { IProduct, IPriority, IUser } from "~/api/types";
import { searchProducts } from "~/services/products.service";
import {
    createEmptyRepairRequestLineItem,
    formatDepartmentLabel,
    formatRequesterLabel,
    formatTitleCase,
    mapProductToLineItem,
    parsePositiveNumber,
    priorityOptions,
} from "./helpers";
import type {
    IRepairRequestFormLineItem,
    IRepairRequestFormValues,
} from "./helpers";

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

const RepairRequestFormSchema = z.object({
    items: z.array(z.object({
        code: z.string().trim().min(1, "Product is required."),
        description: z.string().trim().min(1, "Description is required."),
        name: z.string().trim().min(1, "Product name is required."),
        productId: z.string().trim().regex(/^\d+$/, "Product is required."),
        quantity: z.union([z.number(), z.string()]),
    })).min(1, "At least one repair request item is required."),
    priority: z.string().trim().refine((value) => priorityOptions.includes(value as IPriority), {
        message: "Priority is required.",
    }),
});

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

    const productColumns = React.useMemo(() => [
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

    const fetchProducts = React.useCallback(async (params: ILineItemLookupFetchParams) =>
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

                <LineItemsEditor<IProductPickerRow>
                    addButtonLabel="Add Product"
                    allowDuplicateCodes={true}
                    createEmptyItem={createEmptyRepairRequestLineItem}
                    descriptionLabel="Issue Description"
                    emptyMessage="No repair request items added yet."
                    itemLabel="product"
                    lookupConfig={{
                        columns: productColumns,
                        emptyDefault: "No products are available.",
                        emptySearch: "No matching products found.",
                        fetchData: fetchProducts,
                        itemName: "products",
                        mapRowToItem: mapProductToLineItem,
                        searchPlaceholder: "Search product code or name...",
                        title: "Select Product",
                    }}
                    onChange={(items) =>
                    {
                        setValues((currentValues) => ({
                            ...currentValues,
                            items: items as IRepairRequestFormLineItem[],
                        }));
                        setFormErrors((currentErrors) => ({
                            ...currentErrors,
                            itemIssues: [],
                            items: undefined,
                        }));
                    }}
                    onResolveItemByCode={resolveProductByCode}
                    quantityLabel="Quantity"
                    showPricing={false}
                    showUnit={false}
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
