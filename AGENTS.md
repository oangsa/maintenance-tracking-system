## 1. Main Project Overview

This document describes the current frontend structure in `maintainance-tracking-system` and the conventions the project uses today.

### Purpose

The project is a TypeScript React Router frontend for the Maintenance Tracking System. It uses a layered structure:

- route wrappers for URL composition
- feature modules for page logic
- shared Maintain components for common CRUD page shells
- shared Common components for tables, detail sections, pickers, and line-item editing
- `app/api/` plus `app/services/` for backend communication

### Current Application Surface

The current application is split into these route groups:

- `auth/login`: login screen
- `repair-requests/*`: employee repair request list, create, and detail
- `manager/repair-requests/*`: manager repair request list and detail
- `master/users/*`: user CRUD
- `master/departments/*`: department CRUD

### Current Project Structure

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

### Layer Responsibilities

#### `app/root.tsx`

- loads global styles
- starts shared providers
- initializes auth state

#### `app/routes.ts`

- central route registration file
- maps URL paths to route wrapper files under `app/routes/`
- keeps routing separate from module implementation

#### `app/routes/`

- thin wrappers only
- each file imports a module page and returns it
- no business logic should live here

#### `app/layouts/`

- shared application shells
- `LayoutMain.tsx` handles the authenticated layout, sidebar, top bar, and current user display

#### `app/components/Maintain/`

- shared CRUD page layer
- `Create`, `Edit`, `Detail`, and `Table` are the high-level entry components used by module pages
- `ManagePage`, `DetailPage`, `PageHeader`, and `ErrorCard` are lower-level layout primitives behind those entry components
- Maintain components are intentionally generic and UI-focused
- Maintain components do not call the API directly; module entry pages own loaders and mutations and pass them in through props

#### `app/components/Common/`

- reusable application-level components
- important shared pieces already in use:
    - `DataTable` for paginated list pages
    - `DetailSections` for section-based read-only pages
    - `LineItemsEditor` for editable or read-only line-item collections
    - `ListPickerModal` for lookup selection dialogs
    - `Modal` and `ConfirmModal` for confirmation flows
    - `Loading` for loading states

#### `app/components/ui/`

- raw shadcn UI primitives
- treat these as base components only
- do not place feature-specific business logic here

#### `app/modules/`

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
|   `-- useFieldFilter.ts
`-- index.tsx
```

Notes:

- `useFieldFilter.ts` is optional for simple list pages
- read-only modules can omit `Create/`, `Edit/`, and `form.tsx`
- shared cross-module helpers can live beside the feature folders, for example `app/modules/Feature/RepairRequests/detailLineItemColumns.tsx`

#### `app/api/`

- raw backend request layer
- one file per backend resource
- uses shared `http()` and `httpPaginated()` helpers
- keeps endpoint paths and request contracts close to the backend

#### `app/services/`

- thin orchestration layer on top of `app/api/`
- modules should import services, not raw HTTP helpers
- good place for UI-facing request composition and naming

#### `app/api/types/` and `app/api/types.ts`

- shared API contracts and barrel exports
- add or update entity types here before wiring pages

#### `app/lib/`

- shared frontend utilities
- current important helpers:
    - `pageUtils.ts` for list URL state and sort mapping
    - `formatters.ts` for generic formatting helpers
    - `repairRequestUtils.ts` for repair-request-specific display helpers

### Current Reference Modules

#### `app/modules/Master/Users`

- full CRUD reference module
- uses advanced filters through `hooks/useFieldFilter.ts`
- uses a related-entity picker in `form.tsx`
- best example for new CRUD work

#### `app/modules/Master/Departments`

- full CRUD module with a simpler list page
- no advanced filter hook today
- good reference when the entity only needs quick search plus create, edit, detail, and delete

#### `app/modules/Feature/RepairRequestForEmployee`

- list, create, and detail only
- create page loads current user and initial repair status before rendering the form
- uses `LineItemsEditor` for repair request items
- list pages always scope results to the current requester

#### `app/modules/Feature/RepairRequestForManager`

- read-only list and detail module
- disables create, edit, and delete actions in the table
- detail page uses `LineItemsEditor` in read-only mode and can inject manager-only row actions

### Current Page Flow Patterns

#### List pages

1. A route wrapper renders the module `index.tsx`.
2. The module reads URL state with `useSearchParams()`.
3. `useColumns()` returns the table column definitions.
4. Optional `useFieldFilter()` owns filter metadata plus mapping from UI filters to backend `search[]` conditions.
5. `useTableSearchParams()` centralizes the `page`, `search`, and filter URL updates.
6. The module defines a local `fetchData()` function that calls the correct service.
7. The page renders `app/components/Maintain/Table` with the local fetch and delete props.

#### Create pages

1. `Create/index.tsx` stays thin.
2. The file keeps API-related work local, such as prerequisite loading and `create<Entity>()` submission.
3. The page renders `app/components/Maintain/Create`.
4. The shared component renders `form.tsx` and handles submit state and page-level error display.

#### Edit pages

1. `Edit/index.tsx` owns the record loader and update mutation.
2. The page renders `app/components/Maintain/Edit`.
3. The shared component handles invalid id checks, loading, not-found states, and submit state.
4. `form.tsx` is reused between create and edit.

#### Detail pages

1. `Detail/index.tsx` owns the record loader and any delete confirmation flow.
2. The page renders `app/components/Maintain/Detail`.
3. The shared component handles invalid id checks, loading, not-found states, and section layout.
4. Module code still owns `actions`, `buildSections`, and any extra content below the detail sections.

### Important Conventions

- build the main project in TypeScript even if references are in JavaScript
- use interfaces for component props
- keep route wrappers thin
- keep API calls in module pages, services, and api files; do not move domain-specific fetching into shared Maintain components
- prefer the current nested module layout with `Create/index.tsx`, `Edit/index.tsx`, `Detail/index.tsx`, `form.tsx`, and `hooks/`
- use `search` for structured filters and `searchTerm` for free-text search
- keep backend field mapping near the module, not inside shared table code
- show meaningful business values such as code and name instead of internal ids where possible
- use zod for form validation
- use shared Common components before creating a new abstraction

### Where To Look First

- start with `app/modules/Master/Users` for the full current pattern
- use `app/modules/Master/Departments` for the simpler CRUD pattern without advanced filters
- use `app/modules/Feature/RepairRequestForEmployee` for `LineItemsEditor` and preloaded create-page dependencies
- use `app/modules/Feature/RepairRequestForManager` for read-only list and detail patterns
- use `docs/crud-guide.md` when creating or refactoring a module
- use `docs/search-guide.md` when wiring list filters or quick search
- use `docs/openapi.yaml` when checking backend contracts


## 2. How To Add A New CRUD Interaction

This guide explains how to add or refactor a module so it matches the current project standard.

The main reference is `app/modules/Master/Users`. That module reflects the current architecture:

- nested page-entry folders such as `Create/index.tsx`
- a shared `form.tsx`
- module-local `hooks/`
- shared CRUD shells from `app/components/Maintain`
- API logic kept in module entry pages and passed into shared components through props

### Recommended Order

1. Define API types.
2. Add raw API request functions.
3. Add service functions.
4. Create the module folder.
5. Add route wrapper files.
6. Register routes in `app/routes.ts`.
7. Build the list page.
8. Build the shared form.
9. Build the create, edit, and detail entry pages.
10. Add lookup or line-item interactions if needed.
11. Validate with typecheck.

### Step 1: Define The Entity Contract

Add entity types under `app/api/types/`.

Typical additions:

- `IAsset`
- `IAssetForCreate`
- `IAssetForUpdate`

Then re-export them from:

- `app/api/types/types.ts`
- `app/api/types.ts`

This keeps feature code importing from the shared barrel instead of deep paths.

### Step 2: Add Raw API Calls

Create `app/api/assets.api.ts` for the new entity.

Typical functions:

```ts
import { http, httpPaginated } from "./http";
import type { IAsset, IAssetForCreate, IAssetForUpdate, IPagedResult, ISearchRequest } from "./types";

const PREFIX = "/api/v1/assets";

export async function searchAssetsRequest(body: ISearchRequest): Promise<IPagedResult<IAsset>>
{
    return httpPaginated<IAsset>(`${PREFIX}/search`, {
        method: "POST",
        body: JSON.stringify(body),
    });
}

export async function createAssetRequest(body: IAssetForCreate): Promise<IAsset>
{
    return http<IAsset>(PREFIX, {
        method: "POST",
        body: JSON.stringify(body),
    });
}

export async function getAssetByIdRequest(id: number): Promise<IAsset>
{
    return http<IAsset>(`${PREFIX}/${id}`);
}

export async function updateAssetRequest(id: number, body: IAssetForUpdate): Promise<IAsset>
{
    return http<IAsset>(`${PREFIX}/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
    });
}

export async function deleteAssetRequest(id: number): Promise<void>
{
    return http<void>(`${PREFIX}/${id}`, {
        method: "DELETE",
    });
}
```

Rules:

- use `httpPaginated()` for search endpoints
- use `http()` for detail, create, update, and delete
- keep each function close to the backend endpoint contract

### Step 3: Add Service Functions

Create `app/services/assets.service.ts`.

This file should wrap the API calls with UI-facing names such as:

- `searchAssets()`
- `getAssetById()`
- `createAsset()`
- `updateAsset()`
- `deleteAsset()`

Modules should import services, not raw API files.

### Step 4: Create The Module Folder

Create a module folder using the current Users shape.

Full CRUD example:

```text
app/modules/Master/Assets/
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
|   `-- useFieldFilter.ts
`-- index.tsx
```

Purpose of each file:

- `index.tsx`: list page and `Table` integration
- `Create/index.tsx`: thin create entry page
- `Edit/index.tsx`: thin edit entry page
- `Detail/index.tsx`: thin detail entry page
- `form.tsx`: reusable form used by create and edit
- `hooks/helpers.ts`: payload mappers, labels, and form-value helpers
- `hooks/useColumns.tsx`: list table columns
- `hooks/useFieldFilter.ts`: optional advanced list filters

Variations:

- omit `hooks/useFieldFilter.ts` when the entity only needs quick search
- omit `Create/`, `Edit/`, and `form.tsx` for a read-only module
- keep shared cross-feature helpers outside the module when more than one feature reuses them

### Step 5: Add Route Wrapper Files

Create thin route wrappers under `app/routes/`.

Example:

```text
app/routes/Master/Assets/
|-- master.assets.tsx
|-- master.assets.new.tsx
|-- master.assets.$id.tsx
`-- master.assets.$id.edit.tsx
```

Example route wrapper:

```tsx
import AssetsListPage from "~/modules/Master/Assets";

export default function MasterAssetsRoute()
{
    return <AssetsListPage />;
}
```

Use the nested page folder paths for create, edit, and detail wrappers:

```tsx
import CreateAssetPage from "~/modules/Master/Assets/Create";
```

### Step 6: Register Routes

Add the route entries to `app/routes.ts`.

Example:

```ts
route("master/assets", "routes/Master/Assets/master.assets.tsx"),
route("master/assets/new", "routes/Master/Assets/master.assets.new.tsx"),
route("master/assets/:id/edit", "routes/Master/Assets/master.assets.$id.edit.tsx"),
route("master/assets/:id", "routes/Master/Assets/master.assets.$id.tsx"),
```

If the feature should appear in navigation, add the nav item only after the route exists.

### Step 7: Build The List Page

The list page lives in `index.tsx` and should follow the current `Users` or `Departments` pattern.

Responsibilities:

- read URL state with `useSearchParams()`
- define columns in `hooks/useColumns.tsx`
- optionally define filters in `hooks/useFieldFilter.ts`
- use `app/components/Maintain/Table`
- use `app/components/Maintain/Table/useSearchParams`
- keep the local `fetchData()` function inside the module file
- pass delete behavior through `deleteConfig` when delete is allowed

### Step 8: Build The Shared Form

The shared form lives in `form.tsx` and should be reusable for create and edit.

Typical responsibilities:

- local form state
- zod validation
- field rendering
- lookup or line-item UI when needed
- inline field errors

Keep page-level API work out of `form.tsx` unless the field itself needs a lookup service or a local helper query.

### Step 9: Build Create And Edit Entry Pages

Create and edit entry pages should stay thin.

Important rule:

- API-related functions must stay in the module entry file and be passed into the shared Maintain component through props

Use `app/components/Maintain/Create` and `app/components/Maintain/Edit` instead of reintroducing a custom `Manage.tsx` layer.

### Step 10: Build The Detail Page

The detail page should use `app/components/Maintain/Detail`.

Responsibilities that stay in the module file:

- record loader passed through `loadData`
- delete confirmation flow
- `actions` rendering
- `buildSections` mapping
- extra content such as `LineItemsEditor` below the detail sections

### Step 11: Add Lookup Or Line-Item Interactions When Needed

Use the existing shared components instead of building custom solutions first.

Lookup guidance:

- use `ListPickerModal` for related-record selection
- keep the picker request function close to the form that needs it
- show business labels such as `code` and `name`, not only ids

Line-item guidance:

- use `LineItemsEditor` for editable row collections
- provide the line-item columns from the feature module
- use the read-only mode for detail pages when the collection should not be edited

Reference modules:

- `app/modules/Master/Users/form.tsx` for relation lookup
- `app/modules/Feature/RepairRequestForEmployee/form.tsx` for editable `LineItemsEditor`
- `app/modules/Feature/RepairRequestForManager/Detail/index.tsx` for read-only line-item display with injected actions

### Step 12: Validate

Run:

```bash
bun run typecheck
```

Then manually verify the flows that apply to the module:

1. Open list page.
2. Search by quick text.
3. Apply and clear filters when filters exist.
4. Open detail page.
5. Create a new record when create exists.
6. Edit an existing record when edit exists.
7. Delete a record when delete exists.
8. Check pagination and sorting.

### Copy-From References In This Repo

Use these files as the baseline:

- `app/modules/Master/Users/index.tsx`
- `app/modules/Master/Users/Create/index.tsx`
- `app/modules/Master/Users/Edit/index.tsx`
- `app/modules/Master/Users/Detail/index.tsx`
- `app/modules/Master/Users/form.tsx`
- `app/modules/Master/Users/hooks/helpers.ts`
- `app/modules/Master/Users/hooks/useColumns.tsx`
- `app/modules/Master/Users/hooks/useFieldFilter.ts`
- `app/modules/Master/Departments/index.tsx`
- `app/modules/Feature/RepairRequestForEmployee/form.tsx`
- `app/modules/Feature/RepairRequestForManager/Detail/index.tsx`
- `app/api/users.api.ts`
- `app/services/users.service.ts`

### Common Mistakes To Avoid

- do not call raw `fetch()` from modules when `app/api/` already exists
- do not reintroduce the older flat `Create.tsx`, `Edit.tsx`, `Detail.tsx`, or `Manage.tsx` structure for new work
- do not move API loaders or mutations into shared Maintain components
- do not duplicate search parameter parsing in multiple pages when `useTableSearchParams()` already covers it
- do not move backend field-name mapping into `DataTable`
- do not show plain ids when code and name are available
- do not put feature-specific logic inside raw shadcn UI primitives
- do not copy reference-app JavaScript files directly without converting them to the current TypeScript pattern

## 3. Runtimes
- Bun

## 4. Code Style
Use PascalCase or UpperCamelCase to define methods and Classes. Use 'I' as a prefix of a class contract. Functions and variables can be use camelCase as usual. We use old style of C for curly braces, we put them one line after the method, class, function, if-else, and more that use curly braces.

Bad Examples:

```ts
export interface iExampleClass {
    exampleMethod() {};
}
```

```ts
export class exampleClass implements iExampleClass {
    public exampleMethod() {}
}
```

```ts
export function MyFunction() {}
```

```ts
if (a > b) {}
```

```ts
if (a > b) {

} else {

}
```

```ts
export function myFunction() {
    if (a > b) {
        console.log("TEST")
        return 0;
    }
}
```

Good Examples:

```ts
export interface IExampleClass
{
    ExampleMethod()
    {};
}
```

```ts
export class ExampleClass implements IExampleClass
{
    public ExampleMethod()
    {}
}
```

```ts
export function myFunction()
{

}
```

```ts
if (a > b)
{

}
```

```ts
if (a > b)
{

}
else
{

}
```

```ts
export function myFunction()
{
    if (a > b)
    {
        console.log("TEST")

        return 0;
    }
}
```

For the rest you may need to see the old files, how I named them and write them.

## 5. Dependencies

You have to strictly using only dependency I provided for the Icons and UI Components.

- Icons: `React-Icons` or `Lucide`
- UI Components: `shadcn`
- CSS: `tailwindcss`
- Schema Validator: `zod`

## 6. Rules

You have to follow these rules strictly

- 1. Now declare `maintainance-tracking-system` folder as a `main` project folder
- 2. Use `client/src` as a reference only. Do not change anything.
- 3. Use `example/src` as a reference only. Do not change anything.
- 4. Write only in main project folder.
- 5. Use `/docs` in main project folder for any references.
- 6. You must understand both references.
- 7. Even in both references are using JavaScript, In our main project, we want to use TypeScript.
- 8. You must declare interfaces for all components parameters.
- 9. Do not use any emoji. Instead, use Icons
- 10. Use tailwindcss ONLY
- 11. When adding new custom components, please strictly use provided dependencies in section 5.
- 12. Do not change anything inside the raw shadcn ui components.
- 13. Edit/Create should use the same component, go see `example`
- 14. Use `zod` as a schema validator.
- 15. For showing data do not show running id, please show code and name instead.
- 16. Instead of using normal html tags, use shadcn ui components instead eg. Button, Input, etc.
- 17. For `/search` endpoint there's a guide how we using it in `/docs/search-guide.md` in the main project folder
