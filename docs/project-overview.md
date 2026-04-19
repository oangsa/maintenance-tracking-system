# Main Project Overview

This document describes the current frontend structure in `maintainance-tracking-system` and the conventions the project uses today.

## Purpose

The project is a TypeScript React Router frontend for the Maintenance Tracking System. It uses a layered structure:

- route wrappers for URL composition
- feature modules for page logic
- shared Maintain components for common CRUD page shells
- shared Common components for tables, detail sections, pickers, and line-item editing
- `app/api/` plus `app/services/` for backend communication

## Current Application Surface

The current application is split into these route groups:

- `auth/login`: login screen
- `repair-requests/*`: employee repair request list, create, and detail
- `manager/repair-requests/*`: manager repair request list and detail
- `master/users/*`: user CRUD
- `master/departments/*`: department CRUD

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
|   |   |   `-- Modal/
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
|   |   |-- priority.constant.ts
|   |   |-- role.constant.ts
|   |   `-- searchOperator.constant.ts
|   |-- layouts/
|   |   `-- LayoutMain.tsx
|   |-- lib/
|   |   |-- formatters.ts
|   |   |-- pageUtils.ts
|   |   `-- repairRequestUtils.ts
|   |-- modules/
|   |   |-- auth/
|   |   |   `-- login/
|   |   |-- Feature/
|   |   |   |-- RepairRequestForEmployee/
|   |   |   |-- RepairRequestForManager/
|   |   |   `-- RepairRequests/
|   |   `-- Master/
|   |       |-- Departments/
|   |       `-- Users/
|   |-- routes/
|   |   |-- Main/
|   |   |   `-- RepairRequests/
|   |   |-- Manager/
|   |   |   `-- RepairRequests/
|   |   `-- Master/
|   |       |-- Departments/
|   |       `-- Users/
|   |-- services/
|   |   |-- auth.service.ts
|   |   |-- departments.service.ts
|   |   |-- products.service.ts
|   |   |-- repairRequests.service.ts
|   |   |-- repairStatuses.service.ts
|   |   `-- users.service.ts
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
- starts shared providers
- initializes auth state

### `app/routes.ts`

- central route registration file
- maps URL paths to route wrapper files under `app/routes/`
- keeps routing separate from module implementation

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
  - `ListPickerModal` for lookup selection dialogs
  - `Modal` and `ConfirmModal` for confirmation flows
  - `Loading` for loading states

### `app/components/ui/`

- raw shadcn UI primitives
- treat these as base components only
- do not place feature-specific business logic here

### `app/constants/`

- shared UI-facing constants and metadata
- current important files:
  - `formItem.constants.ts` for form labels, placeholders, field types, spans, and layout constants used by `app/components/Common/Form`
  - `fieldFilter.constants.ts` for list filter keys, labels, search field names, search terms, and shared `DataTable` filter types
  - `searchOperator.constant.ts` for reusable search operator constants such as `SEARCH_OPERATOR.EQUAL`
- modules should import these constants instead of repeating labels, param keys, or operator strings inline

### `app/modules/`

- feature code lives here
- the best current full-CRUD reference is `app/modules/Master/Users`
- modules follow a nested page-entry layout instead of the older flat `Create.tsx` or `Manage.tsx` pattern

Current full CRUD shape:

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
- detail-heavy modules can add `hooks/useLineItem.ts` when a detail page needs to load a secondary item collection from `/items/search`
- shared cross-module helpers can live beside the feature folders, for example `app/modules/Feature/RepairRequests/detailLineItemColumns.tsx`

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

## Current Reference Modules

### `app/modules/Master/Users`

- full CRUD reference module
- uses advanced filters through `hooks/useFieldFilter.ts`
- uses `app/components/Common/Form` plus `hooks/useFormItem.tsx` for config-driven fields
- uses a related-entity picker in `form.tsx`
- best example for new CRUD work

### `app/modules/Master/Departments`

- full CRUD module with a simpler list page
- uses `app/components/Common/Form` with `hooks/useFormItem.ts`
- no advanced filter hook today
- good reference when the entity only needs quick search plus create, edit, detail, and delete

### `app/modules/Feature/RepairRequestForEmployee`

- list, create, and detail only
- create page loads current user and initial repair status before rendering the form
- create page uses `LineItemsEditor` for repair request items
- detail page uses `hooks/useLineItem.ts` to load all submitted items from `/api/v1/repair-requests/{id}/items/search`
- list pages always scope results to the current requester

### `app/modules/Feature/RepairRequestForManager`

- read-only list and detail module
- disables create, edit, and delete actions in the table
- detail page uses `hooks/useLineItem.ts` to load line items from `/api/v1/repair-requests/{id}/items/search`
- manager detail filters that item search by the current user's `departmentId` and can inject manager-only row actions

## Current Page Flow Patterns

### List pages

1. A route wrapper renders the module `index.tsx`.
2. The module reads URL state with `useSearchParams()`.
3. `useColumns()` returns the table column definitions.
4. Optional `useFieldFilter()` owns filter metadata plus mapping from UI filters to backend `search[]` conditions, usually consuming constants from `app/constants/fieldFilter.constants.ts`.
5. `useTableSearchParams()` centralizes the `page`, `search`, and filter URL updates.
6. The module defines a local `fetchData()` function that calls the correct service.
7. The page renders `app/components/Maintain/Table` with the local fetch and delete props.

### Create pages

1. `Create/index.tsx` stays thin.
2. The file keeps API-related work local, such as prerequisite loading and `create<Entity>()` submission.
3. The page renders `app/components/Maintain/Create`.
4. The shared component renders `form.tsx` and handles submit state and page-level error display.
5. When the module uses `app/components/Common/Form`, `form.tsx` should consume `hooks/useFormItem.ts(x)` for static field metadata.

### Edit pages

1. `Edit/index.tsx` owns the record loader and update mutation.
2. The page renders `app/components/Maintain/Edit`.
3. The shared component handles invalid id checks, loading, not-found states, and submit state.
4. `form.tsx` is reused between create and edit.
5. `hooks/useFormItem.ts(x)` stays module-local so the page-level form state and zod validation remain in `form.tsx`.

### Detail pages

1. `Detail/index.tsx` owns the record loader and any delete confirmation flow.
2. The page renders `app/components/Maintain/Detail`.
3. The shared component handles invalid id checks, loading, not-found states, and section layout.
4. Module code still owns `actions`, `buildSections`, and any extra content below the detail sections.
5. If the detail page needs to load a secondary collection such as repair request items, keep that request in a module-local hook like `hooks/useLineItem.ts` instead of embedding it in shared Maintain components.

## Important Conventions

- write new frontend code in TypeScript
- use interfaces for component props
- keep route wrappers thin
- keep API calls in module pages, services, and api files; do not move domain-specific fetching into shared Maintain components
- prefer the current nested module layout with `Create/index.tsx`, `Edit/index.tsx`, `Detail/index.tsx`, `form.tsx`, and `hooks/`
- centralize repeated form metadata in `app/constants/formItem.constants.ts` and repeated list filter metadata in `app/constants/fieldFilter.constants.ts`
- use `search` for structured filters and `searchTerm` for free-text search
- keep backend field mapping near the module, not inside `DataTable`
- when detail pages load item collections from `/items/search`, keep that request in module-local hooks such as `hooks/useLineItem.ts`
- show meaningful business values such as code and name instead of internal ids where possible
- use zod for form validation
- use shared Common components before creating a new abstraction

## Where To Look First

- start with `app/modules/Master/Users` for the full current pattern
- use `app/modules/Master/Departments` for the simpler CRUD pattern without advanced filters
- use `app/modules/Feature/RepairRequestForEmployee` for `LineItemsEditor` and preloaded create-page dependencies
- use `app/modules/Feature/RepairRequestForManager` for read-only list and detail patterns
- use `app/components/Common/Form` plus `app/constants/formItem.constants.ts` when building config-driven forms
- use `app/constants/fieldFilter.constants.ts` when wiring list filters
- use `app/modules/Feature/RepairRequestForEmployee/hooks/useLineItem.ts` and `app/modules/Feature/RepairRequestForManager/hooks/useLineItem.ts` for detail-page line item loading patterns
- use `docs/crud-guide.md` when creating or refactoring a module
- use `docs/search-guide.md` when wiring list filters or quick search
- use `docs/openapi.yaml` when checking backend contracts
