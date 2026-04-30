import type React from "react";

export type TDashboardCardZone =
    | "summary"
    | "main-left"
    | "main-right-top"
    | "main-right-bottom-left"
    | "main-right-bottom-right-top"
    | "main-right-bottom-right-bottom";

export interface IDashboardCardComponentProps
{
    title: string;
    description?: string;
}

export interface IDashboardCardDefinition
{
    id: string;
    zone: TDashboardCardZone;
    title: string;
    description?: string;
    component: React.ComponentType<IDashboardCardComponentProps>;
}
