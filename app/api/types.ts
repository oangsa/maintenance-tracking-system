// ============================================================
// Barrel — re-exports all types and interfaces.
// Import from here or directly from the individual files.
// ============================================================

export type { IPriority, IRole, ISearchConditionOperator } from "../constants";

export type {
    IPagedResult,
    IPaginationMeta,
    ISearchCondition,
    ISearchRequest,
    ISearchTerm,
} from "./types/core/search.types";

export type {
    ILoginRequest,
    ILoginResponse,
    IMessageResponse,
    IRefreshResponse,
} from "./types/auth.types";

export type {
    IDeleteCollectionRequest,
    IUser,
    IUserForCreate,
    IUserForUpdate,
} from "./types/user.types";

export type { IApiErrorBody } from "./types/core/error.types";
