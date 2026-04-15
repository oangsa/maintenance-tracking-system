import { useEffect, useState } from "react";
import { FiTool } from "react-icons/fi";
import { Outlet, useLocation, useNavigate } from "react-router";
import AppSidebar, { defaultNavSections, flattenNavItems } from "~/components/Common/Sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "~/components/ui/sidebar";
import { getCurrentUser, logout } from "~/services/auth.service";

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
    const [userName, setUserName] = useState("User");
    const [userRole, setUserRole] = useState<string | undefined>(undefined);
    const pageTitle = getPageTitle(location.pathname);

    useEffect(() =>
    {
        const user = getCurrentUser();

        if (user)
        {
            setUserName(user.name ?? user.email);
            setUserRole(user.role ?? undefined);
        }
    }, []);

    async function handleLogout()
    {
        await logout();
        navigate("/auth/login");
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
