import React from "react";
import DashboardCard from "~/components/Common/DashboardCard";
import { dashboardCardDefinitions } from "./config";
import type { IDashboardCardDefinition, TDashboardCardZone } from "./types";

function findCardByZone(zone: TDashboardCardZone): IDashboardCardDefinition | null
{
    return dashboardCardDefinitions.find((card) => card.zone === zone) ?? null;
}

function renderCard(card: IDashboardCardDefinition | null)
{
    if (card === null)
    {
        return null;
    }

    const CardComponent = card.component;

    return (
        <DashboardCard
            description={card.description}
            key={card.id}
            title={card.title}
        >
            <CardComponent
                description={card.description}
                title={card.title}
            />
        </DashboardCard>
    );
}

export default function DashboardPage()
{
    const summaryCards = dashboardCardDefinitions.filter((card) => card.zone === "summary");
    const leftCard = findCardByZone("main-left");
    const topRightCard = findCardByZone("main-right-top");
    const bottomLeftCard = findCardByZone("main-right-bottom-left");
    const bottomRightTopCard = findCardByZone("main-right-bottom-right-top");
    const bottomRightBottomCard = findCardByZone("main-right-bottom-right-bottom");

    return (
        <div className="space-y-4">
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {summaryCards.map((card) => renderCard(card))}
            </section>

            <section className="grid gap-4 xl:grid-cols-12">
                <div className="xl:col-span-4 xl:row-span-2">
                    {renderCard(leftCard)}
                </div>

                <div className="xl:col-span-8">
                    {renderCard(topRightCard)}
                </div>

                <div className="grid gap-4 lg:grid-cols-2 xl:col-span-8">
                    {renderCard(bottomLeftCard)}

                    <div className="grid gap-4">
                        {renderCard(bottomRightTopCard)}
                        {renderCard(bottomRightBottomCard)}
                    </div>
                </div>
            </section>
        </div>
    );
}
