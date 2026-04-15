import React from "react";
import { Link, useLocation } from "react-router";
import {
    FiHome,
    FiLogOut,
    FiMoreVertical,
    FiSettings,
    FiTool,
} from "react-icons/fi";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator,
} from "~/components/ui/sidebar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "~/components/ui/popover";
import { Button } from "~/components/ui/button";

interface INavItem
{
    label: string;
    path: string;
    icon: React.ReactNode;
}

interface ISidebarProfileProps
{
    name: string;
    role?: string;
    onAccountSettings: () => void;
    onLogout: () => void;
}

interface IAppSidebarProps
{
    navItems?: INavItem[];
    profile: ISidebarProfileProps;
}

function getInitials(name: string): string
{
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join("");
}

function SidebarProfile({ name, role, onAccountSettings, onLogout }: ISidebarProfileProps)
{
    return (
        <Popover>
            <PopoverTrigger
                className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none"
            >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground text-sm font-bold tracking-wide">
                    {getInitials(name)}
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-semibold text-sidebar-foreground">{name}</span>
                    {role && (
                        <span className="truncate text-xs capitalize text-sidebar-foreground/60">{role}</span>
                    )}
                </span>
                <FiMoreVertical className="shrink-0 text-sidebar-foreground/50" size={15} />
            </PopoverTrigger>

            <PopoverContent
                className="w-52 p-1"
                side="top"
                align="start"
                sideOffset={8}
            >
                <Button
                    className="w-full justify-start gap-2.5 font-normal"
                    variant="ghost"
                    onClick={onAccountSettings}
                >
                    <FiSettings size={15} />
                    Account Settings
                </Button>
                <div className="my-1 h-px bg-border" />
                <Button
                    className="w-full justify-start gap-2.5 font-normal text-destructive hover:text-destructive"
                    variant="ghost"
                    onClick={onLogout}
                >
                    <FiLogOut size={15} />
                    Logout
                </Button>
            </PopoverContent>
        </Popover>
    );
}

function NavItem({ item }: { item: INavItem })
{
    const location = useLocation();
    const isActive = item.path === "/"
        ? location.pathname === "/"
        : location.pathname.startsWith(item.path);

    return (
        <SidebarMenuItem>
            <SidebarMenuButton
                isActive={isActive}
                render={<Link to={item.path} />}
                size="default"
                tooltip={item.label}
            >
                {item.icon}
                <span>{item.label}</span>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}

const defaultNavItems: INavItem[] = [
    { label: "Dashboard", path: "/", icon: <FiHome size={18} /> },
    { label: "Maintenance", path: "/maintenance", icon: <FiTool size={18} /> },
];

export default function AppSidebar({ navItems = defaultNavItems, profile }: IAppSidebarProps)
{
    return (
        <Sidebar collapsible="none">
            <SidebarHeader className="h-16 justify-center border-b border-sidebar-border px-4">
                <Link
                    className="flex items-center gap-2 font-bold text-xl text-sidebar-foreground"
                    to="/"
                >
                    <FiTool size={20} />
                    MTS
                </Link>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navItems.map((item) => (
                                <NavItem item={item} key={item.path} />
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarSeparator />

            <SidebarFooter>
                <SidebarProfile
                    name={profile.name}
                    onAccountSettings={profile.onAccountSettings}
                    onLogout={profile.onLogout}
                    role={profile.role}
                />
            </SidebarFooter>
        </Sidebar>
    );
}

export type { INavItem, ISidebarProfileProps, IAppSidebarProps };
