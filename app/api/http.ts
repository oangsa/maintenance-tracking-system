import type { IPaginationMeta, IPagedResult } from "./types";

const BASE_URL: string = (import.meta.env.VITE_BASE_API_URL ?? "").replace(/\/$/, "");

console.log("API base URL:", BASE_URL);

// ---- Token store ------------------------------------------
// In-memory primary; sessionStorage as client-side persistence (SSR-safe).

let _accessToken: string | null = null;

export function setAccessToken(token: string | null): void
{
    _accessToken = token;

    if (typeof window !== "undefined")
    {
        if (token)
        {
            sessionStorage.setItem("_at", token);
        }
        else
        {
            sessionStorage.removeItem("_at");
        }
    }
}

export function getAccessToken(): string | null
{
    if (_accessToken) return _accessToken;

    if (typeof window !== "undefined")
    {
        const stored = sessionStorage.getItem("_at");
        if (stored)
        {
            _accessToken = stored;
            return stored;
        }
    }

    return null;
}

export function clearAccessToken(): void
{
    setAccessToken(null);
}

let _refreshFn: (() => Promise<string>) | null = null;

export function registerRefreshFn(fn: () => Promise<string>): void
{
    _refreshFn = fn;
}

let _isRefreshing = false;
let _pendingQueue: Array<{
    resolve: (token: string) => void;
    reject: (err: unknown) => void;
}> = [];

function processQueue(err: unknown, token: string | null = null): void
{
    for (const entry of _pendingQueue)
    {
        if (err) entry.reject(err);
        else entry.resolve(token!);
    }
    _isRefreshing = false;
    _pendingQueue = [];
}

export class ApiError extends Error
{
    readonly statusCode: number;
    readonly error: string;

    constructor(statusCode: number, message: string, error: string)
    {
        super(message);
        this.name = "ApiError";
        this.statusCode = statusCode;
        this.error = error;
    }
}

interface IRawResponse<T>
{
    body: T;
    headers: Headers;
    status: number;
}

function createFallbackPagination(itemCount: number): IPaginationMeta
{
    return {
        currentPage: 1,
        totalPages: 1,
        pageSize: itemCount,
        totalCount: itemCount,
        hasPrevious: false,
        hasNext: false,
    };
}

function normalizeNumber(value: unknown, fallback: number): number
{
    if (typeof value === "number" && Number.isFinite(value))
    {
        return value;
    }

    if (typeof value === "string")
    {
        const parsed = Number(value);

        if (Number.isFinite(parsed))
        {
            return parsed;
        }
    }

    return fallback;
}

function normalizeBoolean(value: unknown, fallback: boolean): boolean
{
    if (typeof value === "boolean")
    {
        return value;
    }

    if (typeof value === "string")
    {
        if (value.toLowerCase() === "true") return true;
        if (value.toLowerCase() === "false") return false;
    }

    return fallback;
}

function parsePaginationHeader(headers: Headers, itemCount: number): IPaginationMeta
{
    const fallback = createFallbackPagination(itemCount);
    const rawPagination = headers.get("X-Pagination") ?? headers.get("x-pagination");

    if (!rawPagination)
    {
        return fallback;
    }

    try
    {
        const parsed = JSON.parse(rawPagination) as Partial<IPaginationMeta>;

        return {
            currentPage: normalizeNumber(parsed.currentPage, fallback.currentPage),
            totalPages: normalizeNumber(parsed.totalPages, fallback.totalPages),
            pageSize: normalizeNumber(parsed.pageSize, fallback.pageSize),
            totalCount: normalizeNumber(parsed.totalCount, fallback.totalCount),
            hasPrevious: normalizeBoolean(parsed.hasPrevious, fallback.hasPrevious),
            hasNext: normalizeBoolean(parsed.hasNext, fallback.hasNext),
        };
    }
    catch
    {
        return fallback;
    }
}

async function rawFetch<T>(path: string, options: RequestInit, tokenOverride?: string | null): Promise<IRawResponse<T>>
{
    const token = tokenOverride !== undefined ? tokenOverride : getAccessToken();

    const baseHeaders: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string> ?? {}),
    };

    if (token)
    {
        baseHeaders["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers: baseHeaders,
        credentials: "include",
    });

    if (res.status === 204)
    {
        return { body: undefined as T, headers: res.headers, status: res.status };
    }

    const ct = res.headers.get("content-type") ?? "";
    const isJson = ct.includes("application/json");
    const body = isJson ? await res.json() : await res.text();

    if (!res.ok)
    {
        const statusCode = res.status;
        const message: string = isJson && body?.message ? String(body.message) : `HTTP ${statusCode}`;
        const errorText: string = isJson && body?.error ? String(body.error) : String(statusCode);
        throw new ApiError(statusCode, message, errorText);
    }

    return { body: body as T, headers: res.headers, status: res.status };
}

/**
 * Makes an authenticated HTTP request.
 * Automatically injects the Bearer token and retries once after a
 * transparent token refresh when the server responds with 401.
 */
export async function http<T>(path: string, options: RequestInit = {}): Promise<T>
{
    try
    {
        const { body } = await rawFetch<T>(path, options);
        return body;
    }
    catch (err)
    {
        if (!(err instanceof ApiError) || err.statusCode !== 401 || !_refreshFn)
        {
            throw err;
        }

        // If another call is already refreshing, queue this one
        if (_isRefreshing)
        {
            return new Promise<T>((resolve, reject) =>
            {
                _pendingQueue.push({
                    resolve: (newToken) =>
                    {
                        rawFetch<T>(path, options, newToken)
                            .then(({ body }) => resolve(body))
                            .catch(reject);
                    },
                    reject,
                });
            });
        }

        _isRefreshing = true;

        try
        {
            const newToken = await _refreshFn();
            setAccessToken(newToken);
            processQueue(null, newToken);
            const { body } = await rawFetch<T>(path, options, newToken);
            return body;
        }
        catch (refreshErr)
        {
            processQueue(refreshErr);
            clearAccessToken();
            throw refreshErr;
        }
    }
}

/**
 * Like http(), but for endpoints that return a list in the body and
 * pagination metadata in the X-Pagination response header.
 * Used by all /search POST endpoints.
 */
export async function httpPaginated<T>(path: string, options: RequestInit = {}): Promise<IPagedResult<T>>
{
    let rawRes: IRawResponse<T[]>;

    try
    {
        rawRes = await rawFetch<T[]>(path, options);
    }
    catch (err)
    {
        if (!(err instanceof ApiError) || err.statusCode !== 401 || !_refreshFn)
        {
            throw err;
        }

        const newToken = await _refreshFn();
        setAccessToken(newToken);
        rawRes = await rawFetch<T[]>(path, options, newToken);
    }

    const data = Array.isArray(rawRes.body) ? rawRes.body : [];
    const pagination = parsePaginationHeader(rawRes.headers, data.length);

    return { data, pagination };
}
