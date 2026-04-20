// Raw API calls for /api/v1/users/* endpoints.
// Each function maps 1-to-1 with an OpenAPI operation.
// All endpoints require Bearer authentication (injected by http.ts automatically).

import { http, httpPaginated } from "./http";
import type {
    IDeleteCollectionRequest,
    IPagedResult,
    ISearchRequest,
    IUser,
    IUserForCreate,
    IUserForUpdate,
} from "./types/types";

const PREFIX = "/api/v1/users";

/**
 * POST /api/v1/users/search
 * Returns a paginated list of users. Pagination metadata is in X-Pagination header.
 */
export async function searchUsersRequest(body: ISearchRequest): Promise<IPagedResult<IUser>>
{
    return httpPaginated<IUser>(`${PREFIX}/search`, {
        method: "POST",
        body: JSON.stringify(body),
    });
}

/**
 * GET /api/v1/users/me
 * Retrieves the currently authenticated user profile.
 */
export async function getCurrentUserRequest(): Promise<IUser>
{
    return http<IUser>(`${PREFIX}/me`);
}

/**
 * POST /api/v1/users
 * Creates a new user. Returns the created user with status 201.
 */
export async function createUserRequest(body: IUserForCreate): Promise<IUser>
{
    return http<IUser>(PREFIX, {
        method: "POST",
        body: JSON.stringify(body),
    });
}

/**
 * GET /api/v1/users/{id}
 * Retrieves a single user by numeric ID.
 */
export async function getUserByIdRequest(id: number): Promise<IUser>
{
    return http<IUser>(`${PREFIX}/${id}`);
}

/**
 * PUT /api/v1/users/{id}
 * Updates an existing user. Returns the updated user.
 */
export async function updateUserRequest(id: number, body: IUserForUpdate): Promise<IUser>
{
    return http<IUser>(`${PREFIX}/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
    });
}

/**
 * DELETE /api/v1/users/{id}
 * Deletes a single user. Returns void (204 No Content).
 */
export async function deleteUserRequest(id: number): Promise<void>
{
    return http<void>(`${PREFIX}/${id}`, {
        method: "DELETE",
    });
}

/**
 * DELETE /api/v1/users/collection
 * Deletes multiple users by IDs in a single request. Returns void (204 No Content).
 */
export async function deleteUserCollectionRequest(body: IDeleteCollectionRequest): Promise<void>
{
    return http<void>(`${PREFIX}/collection`, {
        method: "DELETE",
        body: JSON.stringify(body),
    });
}
