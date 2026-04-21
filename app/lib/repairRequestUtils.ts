import type { IRepairRequestItem } from "~/api/types/types";
import {
    formatJoinedLabel,
    formatTitleCase,
} from "~/lib/formatters";

type IRepairRequestStatusSource = Pick<IRepairRequestItem, "repairStatusCode" | "repairStatusName">;
type IRepairRequestProductSource = Pick<IRepairRequestItem, "productCode" | "productName">;

function formatRepairStatusLabel(item: IRepairRequestStatusSource): string
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

function formatProductLabel(item: IRepairRequestProductSource): string
{
    return formatJoinedLabel([item.productCode, item.productName]);
}

export {
    formatProductLabel,
    formatRepairStatusLabel,
};
