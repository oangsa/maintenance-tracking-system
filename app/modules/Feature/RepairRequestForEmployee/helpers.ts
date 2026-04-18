import type { ILineItemValue } from "~/components/Common/LineItemsEditor";
import type {
    IProduct,
    IPriority,
    IRepairRequestForCreate,
    IRepairRequestItem,
    IUser,
} from "~/api/types";

interface IRepairRequestFormLineItem extends ILineItemValue
{
    productId: string;
}

interface IRepairRequestFormValues
{
    priority: IPriority;
    items: IRepairRequestFormLineItem[];
}

const priorityOptions: IPriority[] = ["low", "medium", "high", "urgent"];

function formatDateTime(value?: string | null): string
{
    if (!value)
    {
        return "-";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime()))
    {
        return value;
    }

    return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}

function formatTitleCase(value?: string | null): string
{
    if (!value)
    {
        return "-";
    }

    return value
        .split(/[_\s-]+/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(" ");
}

function formatRequesterLabel(name?: string | null, email?: string | null): string
{
    if (name?.trim())
    {
        return name.trim();
    }

    if (email?.trim())
    {
        return email.trim();
    }

    return "-";
}

function formatDepartmentLabel(code?: string | null, name?: string | null): string
{
    const parts = [code, name]
        .map((value) => value?.trim() ?? "")
        .filter(Boolean);

    if (parts.length === 0)
    {
        return "-";
    }

    return parts.join(" - ");
}

function formatRepairStatusLabel(item: IRepairRequestItem): string
{
    if (item.repairStatusName?.trim())
    {
        return item.repairStatusName.trim();
    }

    if (item.repairStatusCode?.trim())
    {
        return formatTitleCase(item.repairStatusCode);
    }

    return "-";
}

function formatProductLabel(item: IRepairRequestItem): string
{
    const parts = [item.productCode, item.productName]
        .map((value) => value?.trim() ?? "")
        .filter(Boolean);

    if (parts.length === 0)
    {
        return "-";
    }

    return parts.join(" - ");
}

function createEmptyRepairRequestLineItem(): IRepairRequestFormLineItem
{
    return {
        productId: "",
        code: "",
        name: "",
        quantity: 1,
        description: "",
    };
}

function createEmptyRepairRequestFormValues(): IRepairRequestFormValues
{
    return {
        priority: "medium",
        items: [createEmptyRepairRequestLineItem()],
    };
}

function mapProductToLineItem(product: IProduct): Partial<IRepairRequestFormLineItem> & { code: string; name: string; }
{
    return {
        productId: String(product.id),
        code: product.code,
        description: "",
        name: product.name,
    };
}

function parsePositiveNumber(value: string | number): number | null
{
    const parsedValue = typeof value === "number" ? value : Number(String(value).trim());

    if (!Number.isFinite(parsedValue) || parsedValue <= 0)
    {
        return null;
    }

    return parsedValue;
}

function buildCreatePayload(values: IRepairRequestFormValues, currentStatusId: number, currentUser: IUser): IRepairRequestForCreate
{
    if (!Number.isFinite(currentStatusId))
    {
        throw new Error("The initial repair request status is invalid.");
    }

    if (!Number.isFinite(currentUser.departmentId))
    {
        throw new Error("Your user account is not assigned to a department.");
    }

    return {
        priority: values.priority,
        currentStatusId,
        items: values.items.map((item) =>
        {
            const productId = Number(item.productId.trim());
            const quantity = parsePositiveNumber(item.quantity);

            if (!Number.isFinite(productId) || quantity === null)
            {
                throw new Error("One or more repair request items are invalid.");
            }

            return {
                departmentId: currentUser.departmentId as number,
                description: String(item.description ?? "").trim(),
                productId,
                quantity,
            };
        }),
    };
}

export {
    buildCreatePayload,
    createEmptyRepairRequestFormValues,
    createEmptyRepairRequestLineItem,
    formatDateTime,
    formatDepartmentLabel,
    formatProductLabel,
    formatRepairStatusLabel,
    formatRequesterLabel,
    formatTitleCase,
    mapProductToLineItem,
    parsePositiveNumber,
    priorityOptions,
};

export type { IRepairRequestFormLineItem, IRepairRequestFormValues };
