import type { ILineItemValue } from "../../../components/Common/LineItemsEditor/index";
import { PRIORITY_OPTIONS } from "@/constants/priority.constant";
import type {
    IProduct,
    IPriority,
    IRepairRequestForCreate,
    IUser,
} from "~/api/types";

interface IRepairRequestFormLineItem extends ILineItemValue
{
    code: string;
    description?: string;
    name: string;
    productId: string;
    quantity: number | string;
}

interface IRepairRequestFormValues
{
    priority: IPriority;
    items: IRepairRequestFormLineItem[];
}

const priorityOptions: IPriority[] = [...PRIORITY_OPTIONS];

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
    mapProductToLineItem,
    parsePositiveNumber,
    priorityOptions,
};

export type { IRepairRequestFormLineItem, IRepairRequestFormValues };
