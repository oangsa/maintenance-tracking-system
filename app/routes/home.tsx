import DashboardPage from "~/modules/Feature/Dashboard";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs)
{
    return [
        { title: "Maintainance Tracking System" },
        { name: "description", content: "Dashboard for the maintenance tracking system." },
    ];
}

export default function Home()
{
    return <DashboardPage />;
}
