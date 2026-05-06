// ============================================================
// Barrel — re-exports all types and interfaces.
// Import from here or directly from the individual files.
// ============================================================

import type { IRepairRequestCountGroupByStatus } from "./repairRequestCountGroupByStatus.type";

export type { IPriority, IRole, ISearchConditionOperator } from "../../constants";

export type {
    IPagedResult,
    IPaginationMeta,
    ISearchCondition,
    ISearchRequest,
    ISearchTerm,
} from "../types/core/search.types";

export type {
    ILoginRequest,
    ILoginResponse,
    IMessageResponse,
    IRefreshResponse,
} from "../types/auth.types";

export type {
    IDepartment,
    IDepartmentForCreate,
    IDepartmentForUpdate,
} from "../types/department.types";

export type {
    IProduct,
    IProductForCreate,
    IProductForUpdate,
} from "../types/product.types";

export type { IRepairStatus } from "../types/repairStatus.types";

export type {
    IRepairRequest,
    IRepairRequestForCreate,
    IRepairRequestForUpdate,
    IRepairRequestItem,
    IRepairRequestItemForCreate,
    IRepairRequestStatusLog,
} from "../types/repairRequest.types";

export type {
    IRepairRequestItemStatus,
    IRepairRequestItemStatusForCreate,
    IRepairRequestItemStatusForUpdate,
} from "../types/repairRequestItemStatus.types";

export type {
    IDeleteCollectionRequest,
    IUser,
    IUserForCreate,
    IUserForUpdate,
} from "../types/user.types";

export type {
    IWorkOrder,
} from "../types/workOrder.types";

export type {
    IRepairRequestCountGroupByStatus
} from "../types/repairRequestCountGroupByStatus.type";

export type { IApiErrorBody } from "../types/core/error.types";

export type {
    IPart,
    IPartForCreate,
    IPartForUpdate,
} from "../types/part.types";

export type {
    IProductType,
    IProductTypeForCreate,
    IProductTypeForUpdate,
} from "../types/productType.types";
