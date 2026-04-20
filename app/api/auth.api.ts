// Raw API calls for /api/v1/authentication/* endpoints.
// Each function maps 1-to-1 with an OpenAPI operation.
// Token management is NOT handled here — that belongs in auth.service.ts.

import { http } from "./http";
import type { ILoginRequest, ILoginResponse, IMessageResponse, IRefreshResponse } from "./types/types";

const PREFIX = "/api/v1/authentication";

/**
 * POST /api/v1/authentication/login
 * Returns access token + user. Server sets refresh_token HttpOnly cookie.
 */
export async function loginRequest(body: ILoginRequest): Promise<ILoginResponse>
{
    return http<ILoginResponse>(`${PREFIX}/login`, {
        method: "POST",
        body: JSON.stringify(body),
        skipAuth: true,
        skipRefresh: true,
    });
}

/**
 * POST /api/v1/authentication/refresh
 * Uses the refresh_token HttpOnly cookie (sent automatically via credentials: "include").
 * Returns a new access token. Server rotates the refresh cookie.
 */
export async function refreshTokenRequest(): Promise<IRefreshResponse>
{
    return http<IRefreshResponse>(`${PREFIX}/refresh`, {
        method: "POST",
        skipAuth: true,
        skipRefresh: true,
    });
}

/**
 * POST /api/v1/authentication/logout
 * Invalidates the current device session. Requires Bearer token.
 */
export async function logoutRequest(): Promise<IMessageResponse>
{
    return http<IMessageResponse>(`${PREFIX}/logout`, {
        method: "POST",
    });
}

/**
 * POST /api/v1/authentication/logout-all
 * Invalidates all device sessions for the current user. Requires Bearer token.
 */
export async function logoutAllRequest(): Promise<IMessageResponse>
{
    return http<IMessageResponse>(`${PREFIX}/logout-all`, {
        method: "POST",
    });
}
