// Auth service — orchestrates token lifecycle and session state.
//
// Responsibilities:
//   • Initialize http.ts token store from sessionStorage on app start
//   • Register the refresh function so http.ts can auto-refresh on 401
//   • Expose login / logout / refresh as single-entry-point functions
//   • Keep current user in memory for quick access without re-fetching

import {
    ApiError,
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
import { getCurrentUserRequest } from "../api/users.api";
import type { ILoginRequest, IUser } from "../api/types/types";

// ---- In-memory session state ------------------------------

let _currentUser: IUser | null = null;
let _isInitialized = false;
let _currentUserPromise: Promise<IUser | null> | null = null;
const CURRENT_USER_STORAGE_KEY = "_cu";
const _currentUserListeners = new Set<(user: IUser | null) => void>();

function notifyCurrentUserListeners(): void
{
    for (const listener of _currentUserListeners)
    {
        listener(_currentUser);
    }
}

function persistCurrentUser(user: IUser | null): void
{
    if (typeof window === "undefined")
    {
        return;
    }

    if (user)
    {
        sessionStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(user));
        return;
    }

    sessionStorage.removeItem(CURRENT_USER_STORAGE_KEY);
}

function readStoredCurrentUser(): IUser | null
{
    if (typeof window === "undefined")
    {
        return null;
    }

    const storedUser = sessionStorage.getItem(CURRENT_USER_STORAGE_KEY);

    if (!storedUser)
    {
        return null;
    }

    try
    {
        return JSON.parse(storedUser) as IUser;
    }
    catch
    {
        sessionStorage.removeItem(CURRENT_USER_STORAGE_KEY);
        return null;
    }
}

function setCurrentUser(user: IUser | null): void
{
    _currentUser = user;
    persistCurrentUser(user);
    notifyCurrentUserListeners();
}

function clearSessionState(): void
{
    clearAccessToken();
    setCurrentUser(null);
}

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

    _currentUser = getAccessToken() === null ? null : readStoredCurrentUser();
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
    setCurrentUser(response.user);
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

        if (_currentUser === null)
        {
            _currentUser = readStoredCurrentUser();
        }

        return response.accessToken;
    }
    catch (error)
    {
        clearSessionState();

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
    catch
    {
        // The local session should still be cleared even if the server session is already invalid.
    }
    finally
    {
        clearSessionState();
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
    catch
    {
        // The local session should still be cleared even if the server session is already invalid.
    }
    finally
    {
        clearSessionState();
    }
}

/**
 * Returns the cached current user without making a network request.
 * Returns null if the user has not logged in during this session.
 */
export function getCurrentUser(): IUser | null
{
    if (getAccessToken() === null)
    {
        return null;
    }

    if (_currentUser)
    {
        return _currentUser;
    }

    const storedUser = readStoredCurrentUser();

    if (storedUser)
    {
        _currentUser = storedUser;
    }

    return _currentUser;
}

export function subscribeCurrentUser(listener: (user: IUser | null) => void): () => void
{
    _currentUserListeners.add(listener);

    return () =>
    {
        _currentUserListeners.delete(listener);
    };
}

export async function ensureCurrentUser(): Promise<IUser | null>
{
    const existingUser = getCurrentUser();

    if (existingUser)
    {
        return existingUser;
    }

    if (getAccessToken() === null)
    {
        return null;
    }

    if (_currentUserPromise)
    {
        return _currentUserPromise;
    }

    _currentUserPromise = getCurrentUserRequest()
        .then((user) =>
        {
            setCurrentUser(user);
            return user;
        })
        .catch((error) =>
        {
            if (error instanceof ApiError && [401, 403, 404].includes(error.statusCode))
            {
                clearSessionState();
                return null;
            }

            throw error;
        })
        .finally(() =>
        {
            _currentUserPromise = null;
        });

    return _currentUserPromise;
}

/**
 * Returns true if there is a stored access token in memory/sessionStorage.
 * Does NOT validate the token against the server.
 */
export function isAuthenticated(): boolean
{
    return getAccessToken() !== null;
}
