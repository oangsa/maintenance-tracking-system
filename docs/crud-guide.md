# How To Add A New CRUD Interaction

This guide explains how to add a new CRUD module in the main project by following the existing Users implementation.

## Recommended Order

1. Define API types.
2. Add raw API request functions.
3. Add service functions.
4. Create the module folder.
5. Add route wrapper files.
6. Register routes in `app/routes.ts`.
7. Build list, form, manage, and detail pages.
8. Add filters and lookup interactions if needed.
9. Validate with typecheck.

## Step 1: Define The Entity Contract

Add the entity types under `app/api/types/`.

Typical additions:

- `IAsset`
- `IAssetForCreate`
- `IAssetForUpdate`

Then re-export them from:

- `app/api/types/types.ts`
- `app/api/types.ts`

This keeps feature code importing from a stable barrel instead of deep paths.

## Step 2: Add Raw API Calls

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

## Step 3: Add Service Functions

Create `app/services/assets.service.ts`.

This file should wrap the API calls with UI-facing names:

- `searchAssets()`
- `getAssetById()`
- `createAsset()`
- `updateAsset()`
- `deleteAsset()`

The page layer should import services, not raw API files.

## Step 4: Create The Module Folder

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

## Step 5: Add Route Wrapper Files

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

## Step 6: Register Routes

Add the new route entries to `app/routes.ts`.

Example:

```ts
route("master/assets", "routes/Master/Assets/master.assets.tsx"),
route("master/assets/new", "routes/Master/Assets/master.assets.new.tsx"),
route("master/assets/:id/edit", "routes/Master/Assets/master.assets.$id.edit.tsx"),
route("master/assets/:id", "routes/Master/Assets/master.assets.$id.tsx"),
```

If the feature should appear in navigation, add the nav item only after the route exists.

## Step 7: Build The List Page

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

## Step 8: Build The Form And Manage Pages

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

## Step 9: Add Related Lookup Interactions

If the entity depends on another entity, follow the department lookup pattern used by `UserForm.tsx`.

Use:

- `ListPickerModal` for selecting related records.
- a search service for the related entity.
- label helpers to display `code` and `name` instead of only ids.

This keeps relation picking consistent across modules.

## Step 10: Add Advanced Filters

If the list page needs structured filters, create a `useFieldFilter.ts` hook.

The hook should own:

- filter field definitions for `DataTable`
- URL param names like `filterStatus` or `filterDepartment`
- normalization for filter values
- translation into backend `search[]`
- module-specific quick search field list like `"code,name"`

Keep shared table behavior generic and keep field mapping inside the module.

## Step 11: Add Delete Interaction

Use `ConfirmModal` in both list and detail pages.

List page:

- store selected id in local state
- confirm before delete
- refresh the table after success

Detail page:

- confirm before delete
- navigate back to the list after success

## Step 12: Validate

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

## Copy-From References In This Repo

Use these files as the baseline when adding a new CRUD module:

- `app/modules/Master/Users/index.tsx`
- `app/modules/Master/Users/Manage.tsx`
- `app/modules/Master/Users/UserForm.tsx`
- `app/modules/Master/Users/useColumns.tsx`
- `app/modules/Master/Users/useFieldFilter.ts`
- `app/api/users.api.ts`
- `app/services/users.service.ts`
- `app/routes/Master/Users/`

## Common Mistakes To Avoid

- Do not call raw `fetch()` from modules when `app/api/` already exists.
- Do not duplicate search parameter parsing in multiple pages.
- Do not move backend field-name mapping into `DataTable`.
- Do not use plain ids as the main visible identifier when code and name are available.
- Do not add feature-specific changes inside raw shadcn UI primitives.
- Do not copy reference-app JavaScript files directly into the main project without converting them to the current TypeScript pattern.
