// Users service — thin orchestration layer over the users API.
//
// Re-exports typed functions that components and loaders can call without
// knowledge of request shapes or URL construction.

import {
    createUserRequest,
    deleteUserCollectionRequest,
    deleteUserRequest,
    getUserByIdRequest,
    searchUsersRequest,
    updateUserRequest,
} from "../api/users.api";
import type {
    IDeleteCollectionRequest,
    IPagedResult,
    ISearchRequest,
    IUser,
    IUserForCreate,
    IUserForUpdate,
} from "../api/types/types";

// ---- Query ---------------------------------------------------

/**
 * Search users with optional filters, sorting, and pagination.
 * Returns a paged result containing the matching users and pagination metadata.
 */
export async function searchUsers(params: ISearchRequest): Promise<IPagedResult<IUser>>
{
    return searchUsersRequest(params);
}

// ---- Commands ------------------------------------------------

/**
 * Create a new user.
 * Returns the full user object that was created, including its generated id.
 */
export async function createUser(data: IUserForCreate): Promise<IUser>
{
    return createUserRequest(data);
}

/**
 * Fetch a single user by their numeric id.
 */
export async function getUserById(id: number): Promise<IUser>
{
    return getUserByIdRequest(id);
}

/**
 * Update an existing user.
 * Returns the updated user object.
 */
export async function updateUser(id: number, data: IUserForUpdate): Promise<IUser>
{
    return updateUserRequest(id, data);
}

/**
 * Delete a single user by their numeric id.
 */
export async function deleteUser(id: number): Promise<void>
{
    return deleteUserRequest(id);
}

/**
 * Delete a collection of users by their numeric ids in a single request.
 */
export async function deleteUsers(body: IDeleteCollectionRequest): Promise<void>
{
    return deleteUserCollectionRequest(body);
}
