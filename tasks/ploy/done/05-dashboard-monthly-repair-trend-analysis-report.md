# Task 05: Dashboard Monthly Repair Trend Analysis Report Frontend

Owner
- Ploy

Main dependency
- None.

Endpoints in scope
- `POST /api/v1/repair-requests/reports/monthly-product-type/search`

Why
- `etc/context.md` assigns Monthly Repair Trend Analysis by Product Type to Ploy.
- The current card UI and month/year filters already exist, but the hook still serves mock data.
- OpenAPI already defines a backend report endpoint for monthly product type trend, so this card can move to real data without waiting for new backend API paths.

What to implement
- Replace mock data logic in `useMonthlyRepairTrend.ts` with API-backed data loading.
- Keep the current month and year selectors and convert them into `requested_at` search range payload.
- Map API response rows (`productTypeName`, `value`) into the chart data shape.
- Preserve the existing chart structure and dashboard card layout behavior.
- Add safe loading and fallback behavior in the hook so the chart does not break on API errors.

Merge-safe ownership
- Ploy owns only the Monthly Repair Trend analysis report implementation in this task.
- Do not refactor unrelated dashboard cards in this task.
- Avoid broad chart component refactors unless there is a reusable bug that blocks report integration.

Exact touchpoints
- Edit `app/api/types/types.ts`
- Create `app/api/types/monthlyRepairTrendByProductTypeReport.type.ts`
- Edit `app/api/repairRequests.api.ts`
- Edit `app/services/repairRequests.service.ts`
- Edit `app/modules/Feature/Dashboard/hooks/useMonthlyRepairTrend.ts`
- Optional small edits to `app/modules/Feature/Dashboard/cards/MonthlyRepairTrendCard.tsx` only if required for loading/error state wiring

Files to change
- `app/api/types/types.ts`
- `app/api/repairRequests.api.ts`
- `app/services/repairRequests.service.ts`
- `app/modules/Feature/Dashboard/hooks/useMonthlyRepairTrend.ts`
- optional new report type file under `app/api/types/`

Acceptance criteria
- Monthly Repair Trend card loads data from backend report endpoint, not mock constants.
- Month/year filter selection updates the API request date range (`requested_at` between month start and month end).
- Chart renders `productTypeName` with `value` from API results.
- Hook handles empty response and API error safely.
- Dashboard page behavior remains unchanged outside this card.

What is not in scope
- Repairs by Department report implementation.
- Top Repaired Products report implementation.
- Dashboard summary cards and non-report cards.
- Global role-based navigation changes.
