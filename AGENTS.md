## 1. Main Project Overview

This document describes the main frontend project in `maintainance-tracking-system`, its current folder structure, and how the application is organized.

### Purpose

The main project is the TypeScript frontend for the Maintainance Tracking System. It uses React Router for route composition, a shared API layer for backend communication, shadcn-based UI primitives, and module folders to keep each CRUD area self-contained.

### Current Project Structure

```text
maintainance-tracking-system/
|-- app/
|   |-- api/
|   |   |-- http.ts
|   |   |-- auth.api.ts
|   |   |-- departments.api.ts
|   |   |-- users.api.ts
|   |   `-- types/
|   |-- components/
|   |   |-- Common/
|   |   `-- ui/
|   |-- constants/
|   |-- hooks/
|   |-- layouts/
|   |   `-- LayoutMain.tsx
|   |-- lib/
|   |   `-- pageUtils.ts
|   |-- modules/
|   |   |-- Master/
|   |   |   `-- Users/
|   |   `-- auth/
|   |-- routes/
|   |   `-- Master/
|   |       `-- Users/
|   |-- services/
|   |   |-- auth.service.ts
|   |   |-- departments.service.ts
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
|-- components.json
|-- package.json
|-- react-router.config.ts
|-- tsconfig.json
`-- vite.config.ts
```

### Layer Responsibilities

#### `app/root.tsx`

- Application root.
- Loads global styles.
- Starts shared providers.
- Initializes auth service.

#### `app/routes.ts`

- Central route definition file.
- Maps URL paths to route wrapper files.
- Keeps route registration separate from module implementation.

#### `app/routes/`

- Thin route wrappers only.
- Each route file should import a module page and return it.
- Do not place business logic here.

#### `app/layouts/`

- Shared application shells.
- `LayoutMain.tsx` handles authenticated layout, sidebar, header, and current-user display.

#### `app/modules/`

- Feature folders.
- Each CRUD area should live in its own module folder.
- The current reference implementation is `app/modules/Master/Users`.

Recommended module shape:

```text
app/modules/Master/Entity/
|-- index.tsx
|-- Create.tsx
|-- Edit.tsx
|-- Detail.tsx
|-- Manage.tsx
|-- EntityForm.tsx
|-- useColumns.tsx
|-- useFieldFilter.ts
`-- helpers.ts
```

#### `app/components/Common/`

- Reusable application-level components.
- Important shared pieces already in use:
  - `DataTable` for paginated list pages.
  - `ListPickerModal` for lookup relationships.
  - `Modal` and `ConfirmModal` for confirmations.
  - `Loading` for loading states.

#### `app/components/ui/`

- Raw shadcn UI primitives.
- Treat these as base components.
- Do not rewrite them for feature-specific behavior.

#### `app/api/`

- Raw backend request layer.
- One file per backend resource.
- Uses shared `http()` and `httpPaginated()` helpers.
- Should stay close to backend endpoints and request/response contracts.

#### `app/services/`

- Thin orchestration layer on top of `app/api/`.
- Modules should import services, not raw HTTP helpers.
- Good place for request composition and UI-facing helper functions.

#### `app/api/types/` and `app/api/types.ts`

- Shared API types and barrel exports.
- Add new entity contracts here before wiring new CRUD pages.

#### `app/lib/`

- Shared frontend helpers.
- `pageUtils.ts` currently contains shared list URL and sorting utilities.

#### `docs/`

- Main project reference material.
- Use this folder for internal implementation guides and API interaction notes.

### Current Implemented Feature Flow

The `Users` module is the best reference for new CRUD work.

#### List flow

- Route file renders `UsersListPage`.
- `index.tsx` reads URL params and passes them into `DataTable`.
- `useFieldFilter.ts` owns filter config and API filter mapping.
- `useColumns.tsx` owns table column definitions.
- `users.service.ts` calls `users.api.ts`.
- `users.api.ts` calls `httpPaginated()` for `/api/v1/users/search`.

#### Create and edit flow

- `Create.tsx` and `Edit.tsx` are thin wrappers.
- Both render `Manage.tsx` with a mode flag.
- `Manage.tsx` loads data for edit mode and submits create or update requests.
- `UserForm.tsx` owns form state, zod validation, and lookup UI.

#### Detail flow

- `Detail.tsx` loads a single record.
- Provides read-only display and delete action.

### Important Conventions

- Build the main project in TypeScript even if references are in JavaScript.
- Use interfaces for component props.
- Prefer shared components before creating a new abstraction.
- Use `search` for structured filters and `searchTerm` for free-text search.
- Keep backend field mapping near the module, not inside shared table code.
- Prefer the `useFieldFilter` pattern for advanced list filters.
- Show meaningful business fields like code and name rather than internal ids where possible.

### Where To Look First

- Start with `app/modules/Master/Users` when adding a new CRUD feature.
- Use `docs/search-guide.md` when building list filters or quick search.
- Use `docs/openapi.yaml` when matching backend payloads and endpoints.


## 2. How To Add A New CRUD Interaction

This guide explains how to add a new CRUD module in the main project by following the existing Users implementation.

### Recommended Order

1. Define API types.
2. Add raw API request functions.
3. Add service functions.
4. Create the module folder.
5. Add route wrapper files.
6. Register routes in `app/routes.ts`.
7. Build list, form, manage, and detail pages.
8. Add filters and lookup interactions if needed.
9. Validate with typecheck.

### Step 1: Define The Entity Contract

Add the entity types under `app/api/types/`.

Typical additions:

- `IAsset`
- `IAssetForCreate`
- `IAssetForUpdate`

Then re-export them from:

- `app/api/types/types.ts`
- `app/api/types.ts`

This keeps feature code importing from a stable barrel instead of deep paths.

### Step 2: Add Raw API Calls

Create `app/api/assets.api.ts` for a new `Asset` entity.

Typical functions:

```ts
export async function searchAssetsRequest(body: ISearchRequest): Promise<IPagedResult<IAsset>>
{
    return httpPaginated<IAsset>("/api/v1/assets/search", {
        method: "POST",
        body: JSON.stringify(body),
    });
}

export async function createAssetRequest(body: IAssetForCreate): Promise<IAsset>
{
    return http<IAsset>("/api/v1/assets", {
        method: "POST",
        body: JSON.stringify(body),
    });
}
```

Rules:

- Use `httpPaginated()` for search endpoints.
- Use `http()` for detail, create, update, and delete.
- Keep each function close to the backend endpoint contract.

### Step 3: Add Service Functions

Create `app/services/assets.service.ts`.

This file should wrap the API calls with UI-facing names:

- `searchAssets()`
- `getAssetById()`
- `createAsset()`
- `updateAsset()`
- `deleteAsset()`

The page layer should import services, not raw API files.

### Step 4: Create The Module Folder

Create a new module folder using the Users shape as the baseline.

Example:

```text
app/modules/Master/Assets/
|-- index.tsx
|-- Create.tsx
|-- Edit.tsx
|-- Detail.tsx
|-- Manage.tsx
|-- AssetForm.tsx
|-- useColumns.tsx
|-- useFieldFilter.ts
`-- helpers.ts
```

Purpose of each file:

- `index.tsx`: list page and DataTable integration.
- `Create.tsx`: wrapper that renders `Manage.tsx` in create mode.
- `Edit.tsx`: wrapper that renders `Manage.tsx` in edit mode.
- `Detail.tsx`: read-only record page and delete action.
- `Manage.tsx`: create and edit orchestration.
- `AssetForm.tsx`: form fields, zod validation, lookup dialogs.
- `useColumns.tsx`: table columns for the list page.
- `useFieldFilter.ts`: filter definitions, URL param mapping, API `search[]` translation.
- `helpers.ts`: payload mappers, labels, empty form state, formatting helpers.

### Step 5: Add Route Wrapper Files

Create route wrapper files under `app/routes/Master/Assets/`.

Example:

```text
app/routes/Master/Assets/
|-- master.assets.tsx
|-- master.assets.new.tsx
|-- master.assets.$id.tsx
`-- master.assets.$id.edit.tsx
```

These files should stay thin.

Example:

```tsx
import AssetsListPage from "~/modules/Master/Assets";

export default function MasterAssetsRoute()
{
    return <AssetsListPage />;
}
```

### Step 6: Register Routes

Add the new route entries to `app/routes.ts`.

Example:

```ts
route("master/assets", "routes/Master/Assets/master.assets.tsx"),
route("master/assets/new", "routes/Master/Assets/master.assets.new.tsx"),
route("master/assets/:id/edit", "routes/Master/Assets/master.assets.$id.edit.tsx"),
route("master/assets/:id", "routes/Master/Assets/master.assets.$id.tsx"),
```

If the feature should appear in navigation, add the nav item only after the route exists.

### Step 7: Build The List Page

The list page should follow the Users pattern.

Checklist:

- Read `page` and `search` from `useSearchParams()`.
- Use `buildListSearchParams()` and `parsePositiveIntegerParam()` from `app/lib/pageUtils.ts`.
- Use `DataTable` for pagination, sorting, quick search, and delete actions.
- Put filter ownership in `useFieldFilter.ts`.
- Convert module filter values into backend `search[]` conditions in the module layer.
- Keep free-text search in `searchTerm`.

Current pattern:

- `params.searchTerm` is the quick text input.
- `params.search` is the advanced filter record.
- `buildOrderBy()` translates table sorting to API `orderBy`.

### Step 8: Build The Form And Manage Pages

`Manage.tsx` should own mode-based orchestration.

Responsibilities:

- In create mode, submit `create<Entity>()`.
- In edit mode, load the selected entity and submit `update<Entity>()`.
- Redirect back to the list after success.
- Show loading and page-level errors.

`<Entity>Form.tsx` should own:

- form state
- zod validation
- field rendering
- lookup modal interactions
- inline field errors

Keep the form reusable for both create and edit.

### Step 9: Add Related Lookup Interactions

If the entity depends on another entity, follow the department lookup pattern used by `UserForm.tsx`.

Use:

- `ListPickerModal` for selecting related records.
- a search service for the related entity.
- label helpers to display `code` and `name` instead of only ids.

This keeps relation picking consistent across modules.

### Step 10: Add Advanced Filters

If the list page needs structured filters, create a `useFieldFilter.ts` hook.

The hook should own:

- filter field definitions for `DataTable`
- URL param names like `filterStatus` or `filterDepartment`
- normalization for filter values
- translation into backend `search[]`
- module-specific quick search field list like `"code,name"`

Keep shared table behavior generic and keep field mapping inside the module.

### Step 11: Add Delete Interaction

Use `ConfirmModal` in both list and detail pages.

List page:

- store selected id in local state
- confirm before delete
- refresh the table after success

Detail page:

- confirm before delete
- navigate back to the list after success

### Step 12: Validate

Run:

```bash
bun run typecheck
```

Then verify these flows manually:

1. Open list page.
2. Search by quick text.
3. Apply and clear filters.
4. Open detail page.
5. Create a new record.
6. Edit an existing record.
7. Delete a record.
8. Check pagination and sorting.

### Copy-From References In This Repo

Use these files as the baseline when adding a new CRUD module:

- `app/modules/Master/Users/index.tsx`
- `app/modules/Master/Users/Manage.tsx`
- `app/modules/Master/Users/UserForm.tsx`
- `app/modules/Master/Users/useColumns.tsx`
- `app/modules/Master/Users/useFieldFilter.ts`
- `app/api/users.api.ts`
- `app/services/users.service.ts`
- `app/routes/Master/Users/`

### Common Mistakes To Avoid

- Do not call raw `fetch()` from modules when `app/api/` already exists.
- Do not duplicate search parameter parsing in multiple pages.
- Do not move backend field-name mapping into `DataTable`.
- Do not use plain ids as the main visible identifier when code and name are available.
- Do not add feature-specific changes inside raw shadcn UI primitives.
- Do not copy reference-app JavaScript files directly into the main project without converting them to the current TypeScript pattern.

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
