# Main Project Overview

This document describes the current frontend structure in `maintainance-tracking-system` and the conventions the project uses today.

## Purpose

The project is a TypeScript React Router frontend for the Maintenance Tracking System. It uses a layered structure:

- route wrappers for URL composition
- provider-driven auth restoration and route protection
- feature modules for page logic
- shared Maintain components for CRUD page shells
- shared Common components for tables, detail sections, forms, lookup pickers, and line-item editing
- `app/api/` plus `app/services/` for backend communication

## Current Route Surface

The current application exposes these routes:

- `/`: authenticated home page rendered inside `LayoutMain`
- `/auth/login`: login screen
- `/repair-requests/*`: employee repair request list, create, and detail
- `/manager/repair-requests/*`: manager repair request list and detail
- `/master/users/*`: user CRUD
- `/master/departments/*`: department CRUD
- `/master/repair-request-item-status/*`: repair request item status CRUD

## Current Project Structure

```text
maintainance-tracking-system/
|-- app/
|   |-- api/
|   |   |-- auth.api.ts
|   |   |-- departments.api.ts
|   |   |-- http.ts
|   |   |-- products.api.ts
|   |   |-- repairRequests.api.ts
|   |   |-- repairStatuses.api.ts
|   |   |-- users.api.ts
|   |   |-- types.ts
|   |   `-- types/
|   |-- components/
|   |   |-- Common/
|   |   |   |-- DataTable/
|   |   |   |-- DetailSections/
|   |   |   |-- Form/
|   |   |   |-- LineItemsEditor/
|   |   |   |-- ListPickerModal/
|   |   |   |-- Loading/
|   |   |   |-- LookupField/
|   |   |   |-- Modal/
|   |   |   |-- ReportTable/
|   |   |   |-- SearchableSelect/
|   |   |   `-- Sidebar/
|   |   |-- Maintain/
|   |   |   |-- Create/
|   |   |   |-- Detail/
|   |   |   |-- DetailPage/
|   |   |   |-- Edit/
|   |   |   |-- ErrorCard/
|   |   |   |-- ManagePage/
|   |   |   |-- PageHeader/
|   |   |   |-- Table/
|   |   |   `-- types.ts
|   |   `-- ui/
|   |-- constants/
|   |   |-- fieldFilter.constants.ts
|   |   |-- formItem.constants.ts
|   |   |-- lookupColumn.constants.ts
|   |   |-- lookupQuery.constants.ts
|   |   |-- priority.constant.ts
|   |   |-- role.constant.ts
|   |   |-- searchOperator.constant.ts
|   |   `-- index.ts
|   |-- contexts/
|   |-- hooks/
|   |-- layouts/
|   |-- lib/
|   |-- modules/
|   |   |-- auth/
|   |   |   `-- login/
|   |   |-- Feature/
|   |   |   |-- RepairRequests/
|   |   |   |   |-- detailLineItemColumns.tsx
|   |   |   |   `-- useLineItemColumn.ts
|   |   |   |-- employee/
|   |   |   |   `-- RepairRequests/
|   |   |   |       |-- Create/
|   |   |   |       |-- Detail/
|   |   |   |       |-- form.tsx
|   |   |   |       |-- hooks/
|   |   |   |       |-- index.tsx
|   |   |   |       |-- Create.tsx
|   |   |   `-- manager/
|   |   |       `-- RepairRequests/
|   |   |           |-- Detail/
|   |   |           |-- hooks/
|   |   |           `-- index.tsx
|   |   |-- Master/
|   |   |   |-- Departments/
|   |   |   |-- RepairRequestItemStatus/
|   |   |   `-- Users/
|   |-- providers/
|   |-- routes/
|   |   |-- home.tsx
|   |   |-- layout.tsx
|   |   |-- login.tsx
|   |   |-- Main/
|   |   |   `-- RepairRequests/
|   |   |-- Manager/
|   |   |   `-- RepairRequests/
|   |   `-- Master/
|   |       |-- Departments/
|   |       |-- RepairRequestItemStatus/
|   |       `-- Users/
|   |-- schemas/
|   |-- services/
|   |-- app.css
|   |-- root.tsx
|   `-- routes.ts
|-- docs/
|   |-- crud-guide.md
|   |-- openapi.yaml
|   |-- project-overview.md
|   `-- search-guide.md
|-- public/
|-- README.md
`-- package.json
```

## Layer Responsibilities

### `app/root.tsx`

- loads global styles
- initializes the auth service
- starts shared providers such as `TooltipProvider`
- wraps the route outlet with `UserProvider`

### `app/providers/UserProvider.tsx`

- restores the current user for authenticated sessions
- redirects unauthenticated users away from protected routes
- redirects authenticated users away from `/auth/*`
- exposes `useUserContext()` so feature pages can consume `currentUser`, `isLoadingUser`, and `userError`

### `app/routes.ts`

- central route registration file
- wires the authenticated layout, home route, test route, auth route, and all feature routes
- keeps route declarations separate from page implementation

### `app/routes/`

- thin wrappers only
- each file imports a module page and returns it
- no business logic should live here

### `app/layouts/`

- shared application shells
- `LayoutMain.tsx` handles the authenticated layout, sidebar, top bar, and current user display

### `app/components/Maintain/`

- shared CRUD page layer
- `Create`, `Edit`, `Detail`, and `Table` are the high-level entry components used by module pages
- `ManagePage`, `DetailPage`, `PageHeader`, and `ErrorCard` are lower-level layout primitives behind those entry components
- Maintain components are intentionally generic and UI-focused
- Maintain components do not call the API directly; module entry pages own loaders and mutations and pass them in through props

### `app/components/Common/`

- reusable application-level components
- important shared pieces already in use:
  - `DataTable` for paginated list pages
  - `DetailSections` for section-based read-only pages
  - `Form` for config-driven create and edit forms
  - `LineItemsEditor` for editable or read-only line-item collections
  - `LookupField` for form lookup controls that reuse `ListPickerModal`
  - `ListPickerModal` for lookup selection dialogs
  - `Loading` for loading states
  - `Modal` and confirm-dialog flows for confirmation UX

### `app/components/ui/`

- raw shadcn UI primitives
- treat these as base components only
- do not place feature-specific business logic here

### `app/constants/`

- shared UI-facing constants and metadata
- current important files:
  - `formItem.constants.ts` for shared field labels, placeholders, field types, spans, and layout values
  - `fieldFilter.constants.ts` for reusable filter keys, labels, and common search fields
  - `lookupColumn.constants.ts` for centralized lookup picker columns
  - `lookupQuery.constants.ts` for `LOOKUP_ORDER_BY`, `LOOKUP_SEARCH_FIELDS`, and `buildLookupPayload()`
  - `searchOperator.constant.ts` for reusable search operator constants such as `SEARCH_OPERATOR.EQUAL`
  - `priority.constant.ts` and `role.constant.ts` for shared option values

### `app/schemas/`

- reusable zod validation schemas
- current schemas cover department, user, and repair-request form validation
- forms should import these schemas instead of duplicating validation rules inline when the schema is reused

### `app/modules/`

- feature code lives here
- route-wired modules should use the nested page-entry layout instead of the older flat `Create.tsx`, `Edit.tsx`, or `Detail.tsx` pattern
- some legacy flat files still exist under `app/modules/Feature/employee/RepairRequests/`; treat them as leftovers, not as the standard to copy
- shared cross-module helpers can live in helper-only folders such as `app/modules/Feature/RepairRequests/`

### `app/api/`

- raw backend request layer
- one file per backend resource
- uses shared `http()` and `httpPaginated()` helpers
- keeps endpoint paths and request contracts close to the backend

### `app/services/`

- thin orchestration layer on top of `app/api/`
- modules should import services, not raw HTTP helpers
- good place for UI-facing request composition and naming

### `app/api/types/` and `app/api/types.ts`

- shared API contracts and barrel exports
- add or update entity types here before wiring pages

### `app/lib/`

- shared frontend utilities
- current important helpers:
  - `pageUtils.ts` for list URL state and sort mapping
  - `formatters.ts` for generic formatting helpers
  - `repairRequestUtils.ts` for repair-request-specific display helpers

## Current Module Shapes

### Full CRUD Shape

```text
app/modules/Master/Entity/
|-- Create/
|   `-- index.tsx
|-- Detail/
|   `-- index.tsx
|-- Edit/
|   `-- index.tsx
|-- form.tsx
|-- hooks/
|   |-- helpers.ts
|   |-- useColumns.tsx
|   |-- useFieldFilter.ts
|   `-- useFormItem.tsx
`-- index.tsx
```

Notes:

- `useFieldFilter.ts` is optional for simple list pages
- `useFormItem.tsx` is recommended when the module uses `app/components/Common/Form`
- read-only modules can omit `Create/`, `Edit/`, and `form.tsx`
- detail-heavy modules can add `hooks/useLineItem.ts` when a detail page needs a secondary `/items/search` request

### Employee Repair Request Shape

```text
app/modules/Feature/employee/RepairRequests/
|-- Create/
|   `-- index.tsx
|-- Detail/
|   `-- index.tsx
|-- form.tsx
|-- hooks/
|   |-- helpers.ts
|   |-- useColumns.tsx
|   |-- useFieldFilter.ts
|   |-- useFormItem.tsx
|   `-- useLineItem.ts
|-- index.tsx
`-- Create.tsx
```

Notes:

- the route-wired pages use `Create/index.tsx` and `Detail/index.tsx`
- `Create.tsx` still exists as a legacy leftover and should not be used as the reference for new work
- the shared form combines `Common/Form` metadata with a custom `LineItemsEditor` block

### Manager Repair Request Shape

```text
app/modules/Feature/manager/RepairRequests/
|-- Detail/
|   `-- index.tsx
|-- hooks/
|   |-- useColumns.tsx
|   |-- useFieldFilter.ts
|   `-- useLineItem.ts
`-- index.tsx
```

Notes:

- manager repair requests are read-only in the current frontend
- the detail page loads line items through `hooks/useLineItem.ts`
- the manager item search is scoped by the current user's `departmentId`

### Shared Helper-Only Feature Shape

```text
app/modules/Feature/RepairRequests/
|-- detailLineItemColumns.tsx
`-- useLineItemColumn.ts
```

Use this folder for repair-request helpers shared by both employee and manager pages without making either module depend on the other's internal files.

## Current Reference Modules

### `app/modules/Master/Users`

- full CRUD reference module
- uses advanced filters through `hooks/useFieldFilter.ts`
- uses `app/components/Common/Form` plus `hooks/useFormItem.tsx` for config-driven fields
- uses `LookupField` and `app/components/Common/LookupField/lookups/department.lookup.ts` for related-entity selection
- imports reusable zod validation from `app/schemas/userFormSchema.ts`

### `app/modules/Master/RepairRequestItemStatus`

- full CRUD module with lookup usage patterns and list filters
- good reference for status-like entities that need `code`, `name`, and ordering behavior
- imports reusable zod validation from `app/schemas/repairRequestItemStatusFormSchema.ts`

### `app/modules/Master/Departments`

- full CRUD module with a simpler list page
- uses `app/components/Common/Form` with `hooks/useFormItem.ts`
- imports reusable zod validation from `app/schemas/departmentFormSchema.ts`
- good reference when the entity only needs quick search plus create, edit, detail, and delete

### `app/modules/Feature/employee/RepairRequests`

- list, create, and detail only
- list page always scopes results to the current requester
- create page loads the current user and the initial repair status before rendering the form
- form reuses `Common/Form` for request metadata and renders a dedicated `RepairRequestLineItemsEditor.tsx` wrapper for requested items
- the line-item wrapper keeps row-level state such as product-code resolution messages and loading flags out of `form.tsx`
- editable line-item columns live in `hooks/useLineItemColumn.tsx`
- product lookup inside line items now uses the same shared lookup-definition flow as normal forms through `app/components/Common/LookupField/lookups/product.lookup.ts`
- detail page loads submitted items through `hooks/useLineItem.ts`

### `app/modules/Feature/manager/RepairRequests`

- read-only list and detail module
- disables create, edit, and delete actions in the table
- detail page uses `hooks/useLineItem.ts` to load `/api/v1/repair-requests/{id}/items/search`
- the line-item search adds `department_id EQUAL currentUser.departmentId`

### `app/modules/Feature/RepairRequests`

- shared repair-request helper folder
- currently owns reusable detail line-item columns and related helper types
- use this folder when employee and manager pages need the same helper but should stay independently structured

## Current Page Flow Patterns

### Auth-Aware Pages

1. The route renders inside `UserProvider`.
2. Module pages read `currentUser`, `isLoadingUser`, and `userError` from `useUserContext()`.
3. Route protection and redirects stay in `UserProvider`; page modules only handle feature-specific gating such as requester ownership or manager department checks.

### List Pages

1. A route wrapper renders the module `index.tsx`.
2. The module reads URL state with `useSearchParams()`.
3. `useColumns()` returns the table column definitions.
4. Optional `useFieldFilter()` owns filter metadata plus mapping from UI filters to backend `search[]` conditions.
5. `useTableSearchParams()` centralizes the `page`, `search`, and filter URL updates.
6. The module defines a local `fetchData()` function that calls the correct service.
7. The page renders `app/components/Maintain/Table` with the local fetch and delete props.

### Create Pages

1. `Create/index.tsx` stays thin.
2. The file keeps API-related work local, such as prerequisite loading and `create<Entity>()` submission.
3. The page renders `app/components/Maintain/Create`.
4. The shared component renders `form.tsx` and handles submit state and page-level error display.
5. When the module uses `app/components/Common/Form`, `form.tsx` should consume `hooks/useFormItem.ts(x)` for static field metadata and `app/schemas/*.ts` for reusable zod validation.

### Edit Pages

1. `Edit/index.tsx` owns the record loader and update mutation.
2. The page renders `app/components/Maintain/Edit`.
3. The shared component handles invalid id checks, loading, not-found states, and submit state.
4. `form.tsx` is reused between create and edit.
5. `hooks/useFormItem.ts(x)` stays module-local so the page-level form state and validation logic remain in `form.tsx`.

### Detail Pages

1. `Detail/index.tsx` owns the record loader and any delete confirmation flow.
2. The page renders `app/components/Maintain/Detail`.
3. The shared component handles invalid id checks, loading, not-found states, and section layout.
4. Module code still owns `actions`, `buildSections`, and any extra content below the detail sections.
5. If the detail page needs a secondary collection such as repair request items, keep that request in a module-local hook like `hooks/useLineItem.ts` instead of embedding it in shared Maintain components.

## Important Conventions

- write new frontend code in TypeScript
- use interfaces for component props
- keep route wrappers thin
- keep API calls in module pages, services, and api files; do not move domain-specific fetching into shared Maintain components
- prefer the current nested module layout with `Create/index.tsx`, `Edit/index.tsx`, `Detail/index.tsx`, `form.tsx`, and `hooks/`
- use `app/providers/UserProvider.tsx` for current-user restoration and protected-route behavior instead of duplicating auth bootstrapping in each module
- centralize repeated form metadata in `app/constants/formItem.constants.ts` and reusable list filter metadata in `app/constants/fieldFilter.constants.ts`
- centralize lookup picker columns and query defaults in `app/constants/lookupColumn.constants.ts` and `app/constants/lookupQuery.constants.ts`
- keep reusable zod schemas in `app/schemas/` when the validation is shared across create and edit forms
- use `search` for structured filters and `searchTerm` for free-text search
- keep backend field mapping near the module, not inside `DataTable`
- when detail pages load item collections from `/items/search`, keep that request in module-local hooks such as `hooks/useLineItem.ts`
- show meaningful business values such as code and name instead of internal ids where possible
- use shared Common components before creating a new abstraction

## Where To Look First

- start with `app/modules/Master/Users` for the full current CRUD pattern
- use `app/modules/Master/Departments` for the simpler CRUD pattern without advanced filters
- use `app/modules/Master/RepairRequestItemStatus` for another full CRUD example with status ordering patterns
- use `app/modules/Feature/employee/RepairRequests` for `LineItemsEditor`, auth-aware feature gating, and preloaded create-page dependencies
- use `app/modules/Feature/manager/RepairRequests` for read-only list and detail patterns
- use `app/modules/Feature/RepairRequests/detailLineItemColumns.tsx` for shared repair-request detail column helpers
- use `app/components/Common/Form` plus `app/constants/formItem.constants.ts` when building config-driven forms
- use `app/components/Common/LookupField` and `app/components/Common/LookupField/lookups/` when building lookup form controls
- use `app/schemas/` for reusable zod validation
- use `app/constants/fieldFilter.constants.ts` when wiring repeated list filters or quick-search field names
- use `app/constants/lookupQuery.constants.ts` for lookup payload defaults and `orderBy`/search-field consistency
- use `docs/crud-guide.md` when creating or refactoring a module
- use `docs/search-guide.md` when wiring list filters or quick search
- use `docs/openapi.yaml` when checking backend contracts
