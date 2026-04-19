import { FiTool } from "react-icons/fi";
import { Outlet, useLocation, useNavigate } from "react-router";
import AppSidebar, { defaultNavSections, flattenNavItems } from "~/components/Common/Sidebar";
import Loading from "~/components/Common/Loading";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "~/components/ui/sidebar";
import { useUserContext } from "~/providers/UserProvider";
import { logout } from "~/services/auth.service";

function getPageTitle(pathname: string): string
{
    const activeItem = flattenNavItems(defaultNavSections).find((item) =>
    {
        if (item.path === "/")
        {
            return pathname === "/";
        }

        return pathname === item.path || pathname.startsWith(`${item.path}/`);
    });

    return activeItem?.label ?? "Workspace";
}

export default function LayoutMain()
{
    const location = useLocation();
    const navigate = useNavigate();
    const { currentUser, isLoadingUser } = useUserContext();
    const pageTitle = getPageTitle(location.pathname);
    const userName = currentUser?.name ?? currentUser?.email ?? "User";
    const userRole = currentUser?.role ?? undefined;

    if (isLoadingUser && currentUser === null)
    {
        return (
            <div className="flex min-h-svh items-center justify-center bg-background px-4">
                <Loading message="Loading your workspace..." size="large" />
            </div>
        );
    }

    async function handleLogout()
    {
        await logout();
        navigate("/auth/login", { replace: true });
    }

    return (
        <SidebarProvider>
            <AppSidebar
                navSections={defaultNavSections}
                profile={{
                    name: userName,
                    role: userRole,
                    onLogout: handleLogout,
                }}
            />
            <SidebarInset className="min-h-svh bg-background">
                <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:px-6">
                    <div className="flex min-w-0 items-center gap-3">
                        <SidebarTrigger className="size-9 shrink-0" />
                        <div className="h-6 w-px shrink-0 bg-border" />
                        <div className="flex min-w-0 items-center gap-3">
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                                <FiTool size={16} />
                            </span>
                            <div className="min-w-0">
                                <p className="truncate text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                                    Maintainance Tracking System
                                </p>
                                <p className="truncate text-sm font-semibold text-foreground sm:text-base">
                                    {pageTitle}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="hidden min-w-0 text-right md:block">
                        <p className="truncate text-sm font-semibold text-foreground">{userName}</p>
                        {userRole && (
                            <p className="truncate text-xs capitalize text-muted-foreground">{userRole}</p>
                        )}
                    </div>
                </header>

                <div className="flex-1 overflow-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
                    <Outlet />
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
