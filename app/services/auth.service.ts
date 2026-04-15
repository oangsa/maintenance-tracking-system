// Auth service — orchestrates token lifecycle and session state.
//
// Responsibilities:
//   • Initialize http.ts token store from sessionStorage on app start
//   • Register the refresh function so http.ts can auto-refresh on 401
//   • Expose login / logout / refresh as single-entry-point functions
//   • Keep current user in memory for quick access without re-fetching

import {
    clearAccessToken,
    getAccessToken,
    registerRefreshFn,
    setAccessToken,
} from "../api/http";
import {
    loginRequest,
    logoutAllRequest,
    logoutRequest,
    refreshTokenRequest,
} from "../api/auth.api";
import type { ILoginRequest, IUser } from "../api/types";

// ---- In-memory session state ------------------------------

let _currentUser: IUser | null = null;
let _isInitialized = false;

// ---- Initialization ---------------------------------------

/**
 * Call once at app startup (e.g. in root.tsx or a top-level loader).
 * Registers the refresh function with http.ts so 401 retries work automatically.
 * A stored token in sessionStorage means we are likely logged in; the first
 * protected request will validate it, triggering a refresh if it has expired.
 */
export function initAuthService(): void
{
    if (_isInitialized)
    {
        return;
    }

    registerRefreshFn(refreshAccessToken);
    _isInitialized = true;
}

// ---- Public service functions -----------------------------

/**
 * Log in with email + password.
 * Stores the returned access token and caches the user object.
 * The server sets the HttpOnly refresh_token cookie automatically.
 */
export async function login(credentials: ILoginRequest): Promise<IUser>
{
    const response = await loginRequest(credentials);
    setAccessToken(response.accessToken);
    _currentUser = response.user;
    return response.user;
}

/**
 * Silently refresh the access token using the HttpOnly refresh cookie.
 * Called automatically by http.ts on 401 — can also be called proactively.
 * Returns the new access token string.
 */
export async function refreshAccessToken(): Promise<string>
{
    try
    {
        const response = await refreshTokenRequest();

        setAccessToken(response.accessToken);

        return response.accessToken;
    }
    catch (error)
    {
        clearAccessToken();
        _currentUser = null;

        throw error;
    }
}

/**
 * Log out of the current device session.
 * Clears the local token regardless of whether the server call succeeds.
 */
export async function logout(): Promise<void>
{
    try
    {
        await logoutRequest();
    }
    finally
    {
        clearAccessToken();
        _currentUser = null;
    }
}

/**
 * Log out of all device sessions for the current user.
 * Clears the local token regardless of whether the server call succeeds.
 */
export async function logoutAll(): Promise<void>
{
    try
    {
        await logoutAllRequest();
    }
    finally
    {
        clearAccessToken();
        _currentUser = null;
    }
}

/**
 * Returns the cached current user without making a network request.
 * Returns null if the user has not logged in during this session.
 */
export function getCurrentUser(): IUser | null
{
    return _currentUser;
}

/**
 * Returns true if there is a stored access token in memory/sessionStorage.
 * Does NOT validate the token against the server.
 */
export function isAuthenticated(): boolean
{
    return getAccessToken() !== null;
}
