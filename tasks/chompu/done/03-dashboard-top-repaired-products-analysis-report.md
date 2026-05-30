# Task 03: Dashboard Top Repaired Products Analysis Report Frontend

Owner
- Chompu

Main dependency
- Backend endpoint contract for Top Repaired Products report is required.

Endpoints in scope
- `POST /api/v1/repair-requests/reports/top-repaired-products/search`

Why
- `etc/context.md` assigns Top Repaired Products Performance Report to Chompu.
- Dashboard card `TopRepairedProductsCard` is currently hardcoded with mock data.
- Existing OpenAPI has the report schema but not an exposed path, so frontend cannot integrate real data yet without backend path confirmation.

What to implement
- Confirm and align final backend report endpoint path and request contract.
- Add API type, api function, and service function for the top repaired products report.
- Replace mock table rows in `TopRepairedProductsCard.tsx` with API-backed data source.
- Keep table layout and badge display style consistent with current dashboard.
- Add graceful empty and error state behavior.

Merge-safe ownership
- Chompu owns Top Repaired Products analysis report integration only.
- Avoid cross-card dashboard refactors in this task.
- If backend endpoint path changes, keep changes limited to this report flow.

Exact touchpoints
- Edit `app/api/types/types.ts`
- Create `app/api/types/topRepairedProductsPerformanceReport.type.ts`
- Edit `app/api/repairRequests.api.ts`
- Edit `app/services/repairRequests.service.ts`
- Edit `app/modules/Feature/Dashboard/cards/TopRepairedProductsCard.tsx`
- Optional create `app/modules/Feature/Dashboard/hooks/useTopRepairedProducts.ts`

Files to change
- `app/api/types/types.ts`
- `app/api/repairRequests.api.ts`
- `app/services/repairRequests.service.ts`
- `app/modules/Feature/Dashboard/cards/TopRepairedProductsCard.tsx`
- optional new hook and report type file

Acceptance criteria
- Top Repaired Products card no longer uses hardcoded rows.
- Card reads backend report response and renders product name plus repair count.
- Empty and error responses are handled safely.
- Endpoint path and payload are documented and consistent with agreed backend contract.

What is not in scope
- Monthly Repair Trend report implementation.
- Repairs by Department report implementation.
- Dashboard summary cards and non-report cards.
- Global role-based navigation changes.
