import React from "react";
import { useLocation, useNavigate } from "react-router";
import type { IUser } from "~/api/types/types";
import { ensureCurrentUser, getCurrentUser, isAuthenticated, subscribeCurrentUser } from "~/services/auth.service";

const AUTH_ROUTE_PREFIX = "/auth/";

export interface IUserContextValue
{
    clearUserError: () => void;
    currentUser: IUser | null;
    isLoadingUser: boolean;
    isProtectedRoute: boolean;
    refreshCurrentUser: () => Promise<IUser | null>;
    userError: string;
}

interface IUserProviderProps
{
    children: React.ReactNode;
}

export const UserContext = React.createContext<IUserContextValue | undefined>(undefined);

function isProtectedPath(pathname: string): boolean
{
    return !pathname.startsWith(AUTH_ROUTE_PREFIX);
}

export function UserProvider({ children }: IUserProviderProps)
{
    const currentUser = React.useSyncExternalStore(subscribeCurrentUser, getCurrentUser, getCurrentUser);
    const location = useLocation();
    const navigate = useNavigate();
    const isProtectedRoute = isProtectedPath(location.pathname);

    const [isLoadingUser, setIsLoadingUser] = React.useState<boolean>(() => isAuthenticated() && getCurrentUser() === null);
    const [userError, setUserError] = React.useState("");

    const clearUserError = React.useCallback(() =>
    {
        setUserError("");
    }, []);

    const refreshCurrentUser = React.useCallback(async (): Promise<IUser | null> =>
    {
        if (!isAuthenticated())
        {
            setIsLoadingUser(false);
            return null;
        }

        setIsLoadingUser(true);
        setUserError("");

        try
        {
            const resolvedUser = await ensureCurrentUser();

            if (resolvedUser === null)
            {
                setUserError("Unable to load your user profile.");
            }

            return resolvedUser;
        }
        catch (error)
        {
            const message = (error as Error).message || "Unable to load your user profile.";

            setUserError(message);

            return null;
        }
        finally
        {
            setIsLoadingUser(false);
        }
    }, []);

    React.useEffect(() =>
    {
        let cancelled = false;

        async function resolveRouteUser()
        {
            const hasSession = isAuthenticated();

            if (!isProtectedRoute)
            {
                if (!hasSession)
                {
                    setIsLoadingUser(false);
                    setUserError("");
                    return;
                }

                if (currentUser !== null)
                {
                    setIsLoadingUser(false);
                    setUserError("");
                    navigate("/", { replace: true });
                    return;
                }

                const resolvedUser = await refreshCurrentUser();

                if (!cancelled && resolvedUser !== null)
                {
                    navigate("/", { replace: true });
                }

                return;
            }

            if (!hasSession)
            {
                setIsLoadingUser(false);
                setUserError("");
                navigate("/auth/login", { replace: true });
                return;
            }

            if (currentUser !== null)
            {
                setIsLoadingUser(false);
                setUserError("");
                return;
            }

            const resolvedUser = await refreshCurrentUser();

            if (!cancelled && resolvedUser === null)
            {
                navigate("/auth/login", { replace: true });
            }
        }

        void resolveRouteUser();

        return () =>
        {
            cancelled = true;
        };
    }, [currentUser, isProtectedRoute, navigate, refreshCurrentUser]);

    const contextValue = React.useMemo<IUserContextValue>(() => ({
        clearUserError,
        currentUser,
        isLoadingUser,
        isProtectedRoute,
        refreshCurrentUser,
        userError,
    }), [
        clearUserError,
        currentUser,
        isLoadingUser,
        isProtectedRoute,
        refreshCurrentUser,
        userError,
    ]);

    return (
        <UserContext.Provider value={contextValue}>
            {children}
        </UserContext.Provider>
    );
}

export function useUserContext(): IUserContextValue
{
    const context = React.useContext(UserContext);

    if (context === undefined)
    {
        throw new Error("useUserContext must be used within UserProvider.");
    }

    return context;
}
