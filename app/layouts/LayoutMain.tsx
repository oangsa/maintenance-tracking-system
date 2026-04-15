import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router";
import AppSidebar from "~/components/Common/Sidebar";
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";
import { getCurrentUser, logout } from "~/services/auth.service";

export default function LayoutMain()
{
    const navigate = useNavigate();
    const [userName, setUserName] = useState("User");
    const [userRole, setUserRole] = useState<string | undefined>(undefined);

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

    function handleAccountSettings()
    {
        navigate("/account-settings");
    }

    return (
        <SidebarProvider>
            <AppSidebar
                profile={{
                    name: userName,
                    role: userRole,
                    onAccountSettings: handleAccountSettings,
                    onLogout: handleLogout,
                }}
            />
            <SidebarInset className="p-8">
                <Outlet />
            </SidebarInset>
        </SidebarProvider>
    );
}
