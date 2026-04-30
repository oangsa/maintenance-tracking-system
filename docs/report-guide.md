# Dashboard Report Wiring Guide

## Goal

Wire dashboard report cards using one consistent pattern (same style as Latest Repair Requests and Repair Status Breakdown), for:

- Repairs by Department
- Monthly Repair Trend
- Top Repaired Products

This guide is intentionally not split per card. Use the same flow for all three and only change payload fields, transform logic, and UI columns/chart keys.

## Use One Pattern For All Report Cards

1. Hook owns data flow.
2. Card owns rendering only.
3. API and Service stay thin and typed.
4. Transform backend response into card-ready view model inside the hook.

## What To Change

### 1) Define report DTO types first

Create typed interfaces for each report payload returned by backend.

Examples of shape:

- group/summary chart row: `name + value`
- list row: business keys (code/name/status/priority), avoid raw ids for display

If needed, add filter state types too (for month/year, `startDate`, `endDate`).

### 2) Add API request functions

In report API layer, add one function per report endpoint:

- use `httpPaginated()` for `/search` style responses
- request body is `ISearchRequest`

Keep endpoint path and request structure close to backend contract.

### 3) Add service wrappers

Expose report methods from service layer with clear names, such as:

- `getRepairsByDepartmentReport(...)`
- `getMonthlyRepairTrendReport(...)`
- `getTopRepairedProductsReport(...)`

Cards/hooks should call services, not API files directly.

### 4) Move all fetching into hooks

Each report hook should:

- keep local `data` state
- build request filters in hook
- fetch in `useEffect`
- guard unmount with `isMounted`
- map response into card-ready data
- set empty array on failure

Do not fetch inside `useMemo`.

### 5) Keep filter logic in hook

For monthly trend:

- keep `selectedMonth`, `selectedYear` in hook
- derive `startDate` and `endDate` from selected month/year
- use first day (`YYYY-MM-01`) and last day of month
- use these values in request `search` conditions

UI controls only call hook handlers (`onMonthChange`, `onYearChange`).

### 6) Keep chart config in hook

For chart cards, return:

- `data`
- `config` (`ChartConfig`)

Generate chart config with stable colors and labels in the hook, then bind in card component.

### 7) Keep card components presentational

Cards should only:

- call hook
- render chart/table
- bind click/navigation actions if needed

No query building, no service call, no backend field mapping in card component.

### 8) Normalize business display values

Before render, ensure transformed fields are safe:

- nullable names fallback to email or `"-"`
- human-readable status/priority labels
- show code/name values, not internal ids

### 9) Use consistent error/empty behavior

If request fails, hook should return empty data set (not throw in render path).

Cards should render gracefully with empty state table/chart.

### 10) Keep manager scoping in hook when needed

If a report is manager-scoped, add department filter from current user context in hook search payload.

## Recommended Hook Output Contract

Use one consistent return structure:

- Always return `data`
- Return `config` for chart cards
- Return filter state/handlers only when card has controls

Example contract shape:

- list card: `{ data }`
- chart card: `{ data, config }`
- chart with filter: `{ data, config, filters, selectedMonth, selectedYear, monthOptions, yearOptions, onMonthChange, onYearChange }`

## Acceptance Checklist

1. No async work inside `useMemo`.
2. No direct API calls from card component.
3. Service functions exist for each report.
4. All report payloads are typed.
5. Month/year controls only update hook state.
6. Cards render with empty data without crashing.
7. Business labels shown instead of ids.
8. `bun run typecheck` passes.

