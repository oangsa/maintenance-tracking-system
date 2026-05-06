import React from "react";
import { Link, useLocation } from "react-router";
import {
    FiClipboard,
    FiFileText,
    FiLayers,
    FiHome,
    FiLogOut,
    FiTool,
    FiUsers,
} from "react-icons/fi";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    SidebarSeparator,
    useSidebar,
} from "~/components/ui/sidebar";

interface INavItem
{
    label: string;
    path: string;
    icon: React.ReactNode;
}

interface INavSection
{
    label: string;
    items: INavItem[];
}

type TSidebarActionHandler = () => void | Promise<void>;

interface ISidebarProfileProps
{
    name: string;
    role?: string;
    onLogout: TSidebarActionHandler;
}

interface IAppSidebarProps
{
    navSections?: INavSection[];
    profile: ISidebarProfileProps;
}

interface INavItemProps
{
    item: INavItem;
}

interface ISidebarActionButtonProps
{
    icon: React.ReactNode;
    isDestructive?: boolean;
    label: string;
    onClick: TSidebarActionHandler;
}

function isActivePath(currentPath: string, itemPath: string): boolean
{
    if (itemPath === "/")
    {
        return currentPath === "/";
    }

    return currentPath === itemPath || currentPath.startsWith(`${itemPath}/`);
}

function SidebarActionButton({ icon, isDestructive = false, label, onClick }: ISidebarActionButtonProps)
{
    const { isMobile, setOpenMobile } = useSidebar();

    function handleClick()
    {
        if (isMobile)
        {
            setOpenMobile(false);
        }

        void onClick();
    }

    return (
        <SidebarMenuItem>
            <SidebarMenuButton
                className={isDestructive ? "text-destructive hover:text-destructive" : undefined}
                onClick={handleClick}
                tooltip={label}
            >
                {icon}
                <span>{label}</span>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}

function NavItem({ item }: INavItemProps)
{
    const location = useLocation();
    const { isMobile, setOpenMobile } = useSidebar();
    const isActive = isActivePath(location.pathname, item.path);

    function handleClick()
    {
        if (isMobile)
        {
            setOpenMobile(false);
        }
    }

    return (
        <SidebarMenuItem>
            <SidebarMenuButton
                isActive={isActive}
                onClick={handleClick}
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

// When new pages are added, their routes should be added to the defaultNavSections in this file
// TODO: Add role based access control for nav items
const defaultNavSections: INavSection[] = [
    {
        label: "Main",
        items: [
            { label: "Home", path: "/", icon: <FiHome size={18} /> },
            { label: "Repair Requests", path: "/repair-requests", icon: <FiClipboard size={18} /> },
        ],
    },
    {
        label: "Manager",
        items: [
            { label: "Repair Requests", path: "/manager/repair-requests", icon: <FiClipboard size={18} /> },
        ],
    },
    {
        label: "Master",
        items: [
            { label: "Users", path: "/master/users", icon: <FiUsers size={18} /> },
            { label: "Departments", path: "/master/departments", icon: <FiLayers size={18} /> },
            { label: "Repair Request Item Statuses", path: "/master/repair-request-item-status", icon: <FiFileText size={18} /> },
            { label: "Parts", path: "/master/parts", icon: <FiTool size={18} /> },
        ],
    },
   
];

function flattenNavItems(navSections: INavSection[]): INavItem[]
{
    return navSections.flatMap((section) => section.items);
}

export default function AppSidebar({ navSections = defaultNavSections, profile }: IAppSidebarProps)
{
    return (
        <Sidebar collapsible="icon">
            <SidebarHeader className="h-16 justify-center border-b border-sidebar-border px-2 py-2">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            className="h-12"
                            render={<Link to="/" />}
                            size="lg"
                            tooltip="Maintainance Tracking System"
                        >
                            <span className="flex aspect-square size-9 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground shadow-sm group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:px-1">
                                <FiTool size={20} />
                            </span>
                            <span className="grid min-w-0 flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
                                <span className="truncate text-[10px] font-semibold uppercase tracking-[0.24em] text-sidebar-foreground/55">
                                    Maintainance
                                </span>
                                <span className="truncate text-base font-semibold text-sidebar-foreground">
                                    Tracking System
                                </span>
                            </span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {navSections.map((section) => (
                    <SidebarGroup className="pt-3" key={section.label}>
                        <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu className="px-1">
                                {section.items.map((item) => (
                                    <NavItem item={item} key={item.path} />
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>

            <SidebarSeparator />

            <SidebarFooter className="gap-3 px-2 py-3">
                <div className="px-2 group-data-[collapsible=icon]:hidden">
                    <p className="truncate text-sm font-semibold text-sidebar-foreground">
                        {profile.name}
                    </p>
                    {profile.role && (
                        <p className="truncate text-xs capitalize text-sidebar-foreground/60">
                            {profile.role}
                        </p>
                    )}
                </div>

                <SidebarMenu>
                    <SidebarActionButton
                        icon={<FiLogOut size={18} />}
                        isDestructive={true}
                        label="Logout"
                        onClick={profile.onLogout}
                    />
                </SidebarMenu>
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    );
}

export { defaultNavSections, flattenNavItems };
export type { INavItem, INavSection, ISidebarProfileProps, IAppSidebarProps, TSidebarActionHandler };
