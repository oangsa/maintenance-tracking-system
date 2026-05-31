# Task 04: Dashboard Repairs By Department Analysis Report Frontend

Owner
- Phi

Main dependency
- None.

Endpoints in scope
- NOT EXIST FOR NOW

Why
- `etc/context.md` assigns Number of Repair Requests by Department to Phi.
- `RepairsByDepartmentCard` currently renders mock data only.
- OpenAPI already provides the grouped-by-department report endpoint, so this card can be upgraded to real backend data.

What to implement
- Add API and service support for the by-department report endpoint.
- Replace mock dataset in `useRepairsByDepartment.ts` with API-backed fetching.
- Map API fields (`departmentName`, `value`) to the existing vertical bar chart format.
- Keep the existing card layout and chart visual style.
- Add stable fallback behavior for empty or failed responses.

Merge-safe ownership
- Phi owns only the Repairs by Department analysis report card integration in this task.
- Do not refactor unrelated dashboard cards.
- Keep broader dashboard layout logic untouched.

Exact touchpoints
- Edit `app/api/types/types.ts`
- Create `app/api/types/repairRequestGroupByDepartmentReport.type.ts`
- Edit `app/api/repairRequests.api.ts`
- Edit `app/services/repairRequests.service.ts`
- Edit `app/modules/Feature/Dashboard/hooks/useRepairsByDepartment.ts`
- Optional small edits to `app/modules/Feature/Dashboard/cards/RepairsByDepartmentCard.tsx` if loading/error props are needed

Files to change
- `app/api/types/types.ts`
- `app/api/repairRequests.api.ts`
- `app/services/repairRequests.service.ts`
- `app/modules/Feature/Dashboard/hooks/useRepairsByDepartment.ts`
- optional new report type file under `app/api/types/`

Acceptance criteria
- Repairs by Department card uses backend report data, not local mock arrays.
- Card renders department labels and values from API response.
- Hook handles no-data and API-failure states without crashing dashboard.
- Dashboard page behavior remains unchanged outside this card.

What is not in scope
- Monthly Repair Trend report implementation.
- Top Repaired Products report implementation.
- Dashboard summary cards and non-report cards.
- Global role-based navigation changes.
