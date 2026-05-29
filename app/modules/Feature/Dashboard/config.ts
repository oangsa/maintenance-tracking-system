import type { IDashboardCardDefinition, TDashboardCardZone } from "./types";
import LatestRepairRequestsCard from "./cards/LatestRepairRequestsCard";
import MonthlyRepairTrendCard from "./cards/MonthlyRepairTrendCard";
import PendingRepairsCard from "./cards/PendingRepairsCard";
import RepairStatusBreakdownCard from "./cards/RepairStatusBreakdownCard";
import RepairsByDepartmentCard from "./cards/RepairsByDepartmentCard";
import TopRepairedProductsCard from "./cards/TopRepairedProductsCard";
import TotalActiveProductsCard from "./cards/TotalActiveProductsCard";
import UrgentRequestsCard from "./cards/UrgentRequestsCard";

const SUMMARY_ZONE: TDashboardCardZone = "summary";


// Change this config to add/remove/rearrange cards on the dashboard.
const dashboardCardDefinitions: IDashboardCardDefinition[] = [
    {
        id: "total-active-products",
        zone: SUMMARY_ZONE,
        title: "Total Active Products",
        component: TotalActiveProductsCard,
    },
    {
        id: "ongoing-repairs",
        zone: SUMMARY_ZONE,
        title: "Ongoing Repair Requests",
        component: PendingRepairsCard,
    },
    {
        id: "urgent-requests",
        zone: SUMMARY_ZONE,
        title: "Urgent Requests",
        component: UrgentRequestsCard,
    },
    // Phi
    {
        id: "repairs-by-department",
        zone: "main-left",
        title: "Repairs by Department",
        description: "Graph Card",
        component: RepairsByDepartmentCard,
    },
    // Ploy
    {
        id: "monthly-repair-trend",
        zone: "main-right-top",
        title: "Monthly Repair Trend",
        description: "Graph Card",
        component: MonthlyRepairTrendCard,
    },
    // Oangsa
    {
        id: "repair-status-breakdown",
        zone: "main-right-bottom-left",
        title: "Repair Status Breakdown",
        description: "Graph Card",
        component: RepairStatusBreakdownCard,
    },
    // Oangsa
    {
        id: "latest-repair-requests",
        zone: "main-right-bottom-right-top",
        title: "Latest Repair Requests",
        description: "List Card",
        component: LatestRepairRequestsCard,
    },
    // Philaiwan (Chonpu) (Just want it to be 3P :))
    {
        id: "top-repaired-products",
        zone: "main-right-bottom-right-bottom",
        title: "Top Repaired Products",
        description: "List Card",
        component: TopRepairedProductsCard,
    },
];

export { dashboardCardDefinitions };
