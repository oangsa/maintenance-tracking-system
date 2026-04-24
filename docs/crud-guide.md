# CRUD Guide

This guide explains how to add or refactor a module so it matches the current project standard.

The main references are `app/modules/Master/Users` for the full CRUD pattern and `app/modules/Master/Departments` for a simpler variant.

## Current Standard

Current modules should follow these rules:

- use nested page-entry folders such as `Create/index.tsx`, `Edit/index.tsx`, and `Detail/index.tsx`
- keep a shared `form.tsx` for create and edit when both flows exist
- keep module-local hooks for columns, filters, form metadata, and detail-side item loading
- use `app/components/Maintain/Create`, `Edit`, `Detail`, and `Table` as the shared page shells
- use `app/components/Common/Form` plus `hooks/useFormItem.ts(x)` when the fields fit the shared renderer
- use `app/components/Common/LookupField` for lookup controls before building one-off picker wiring in each form
- keep reusable zod schemas in `app/schemas/`
- use `app/providers/UserProvider.tsx` for current-user access instead of duplicating auth restoration logic in each page
- keep API logic inside module entry pages and pass it into shared components through props

Important: some older feature folders still contain flat files such as `Create.tsx` or `Detail.tsx`. Those are legacy leftovers. Do not copy that structure for new work.

## Recommended Order

1. Define API types.
2. Add raw API request functions.
3. Add service functions.
4. Create the module folder.
5. Add route wrapper files.
6. Register routes in `app/routes.ts`.
7. Build the list page.
8. Build the shared form and validation schema.
9. Build the create and edit entry pages.
10. Build the detail page and any secondary item loading.
11. Validate with typecheck and manual checks.

## Step 1: Define The Entity Contract

Add entity types under `app/api/types/`.

Typical additions:

- `IAsset`
- `IAssetForCreate`
- `IAssetForUpdate`

Then re-export them from:

- `app/api/types/types.ts`
- `app/api/types.ts`

This keeps feature code importing from the shared barrel instead of deep paths.

## Step 2: Add Raw API Calls

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

## Step 3: Add Service Functions

Create `app/services/assets.service.ts`.

This file should wrap the API calls with UI-facing names such as:

- `searchAssets()`
- `getAssetById()`
- `createAsset()`
- `updateAsset()`
- `deleteAsset()`

Modules should import services, not raw API files.

## Step 4: Create The Module Folder

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
|   |-- useFieldFilter.ts
|   `-- useFormItem.tsx
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
- `hooks/useFormItem.tsx`: typed form metadata for `app/components/Common/Form`
- `hooks/useLineItem.ts`: optional detail-page item loader when the page uses a secondary `/items/search` endpoint

Variations:

- omit `hooks/useFieldFilter.ts` when the entity only needs quick search
- omit `hooks/useFormItem.tsx` when the form is too custom for `app/components/Common/Form`
- omit `Create/`, `Edit/`, and `form.tsx` for a read-only module
- add `hooks/useLineItem.ts` for read-only or detail modules that load item collections separately from the main detail record
- keep shared cross-feature helpers outside the module when more than one feature reuses them

If multiple related modules need the same helper, place it in a shared helper-only folder. The current repair-request example is `app/modules/Feature/RepairRequests/detailLineItemColumns.tsx`.

## Step 5: Add Route Wrapper Files

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

## Step 6: Register Routes

Add the route entries to `app/routes.ts`.

Example:

```ts
route("master/assets", "routes/Master/Assets/master.assets.tsx"),
route("master/assets/new", "routes/Master/Assets/master.assets.new.tsx"),
route("master/assets/:id/edit", "routes/Master/Assets/master.assets.$id.edit.tsx"),
route("master/assets/:id", "routes/Master/Assets/master.assets.$id.tsx"),
```

If the feature should appear in navigation, add the nav item only after the route exists.

## Step 7: Build The List Page

The list page lives in `index.tsx` and should follow the current `Users` or `Departments` pattern.

Responsibilities:

- read URL state with `useSearchParams()`
- define columns in `hooks/useColumns.tsx`
- optionally define filters in `hooks/useFieldFilter.ts`
- keep repeated filter labels, param keys, and shared search field names in `app/constants/fieldFilter.constants.ts` when more than one module reuses them
- use `SEARCH_OPERATOR` constants instead of repeating raw operator strings such as `"EQUAL"`
- use `app/components/Maintain/Table`
- use `app/components/Maintain/Table/useSearchParams`
- keep the local `fetchData()` function inside the module file
- pass delete behavior through `deleteConfig` when delete is allowed

Typical structure:

```tsx
import React from "react";
import { useSearchParams } from "react-router";
import type { IFetchParams, IFetchResult } from "~/components/Common/DataTable";
import Table from "~/components/Maintain/Table";
import useTableSearchParams from "~/components/Maintain/Table/useSearchParams";
import { buildOrderBy } from "~/lib/pageUtils";
import { deleteAssets, searchAssets } from "~/services/assets.service";
import useColumns, { type IAssetTableRow } from "./hooks/useColumns";
import useFieldFilter from "./hooks/useFieldFilter";

export default function AssetsListPage()
{
    const [searchParams, setSearchParams] = useSearchParams();
    const columns = useColumns();
    const {
        buildFilterParams,
        buildFilterSearch,
        currentFilters,
        currentFiltersRecord,
        fieldFilters,
        normalizeFilters,
        searchTerm,
    } = useFieldFilter({ searchParams });
    const {
        currentPage,
        currentSearch,
        handleCurrentPageChange,
        handleFilterChange,
        handleSearchChange,
    } = useTableSearchParams({
        buildFilterParams,
        currentFilters,
        normalizeFilters,
        searchParams,
        setSearchParams,
    });

    const fetchData = React.useCallback(async (params: IFetchParams): Promise<IFetchResult<IAssetTableRow>> =>
    {
        const response = await searchAssets({
            deleted: false,
            orderBy: buildOrderBy(params.sortBy, params.sortDir, "code asc"),
            pageNumber: params.page,
            pageSize: params.limit,
            search: buildFilterSearch(params.search),
            searchTerm: params.searchTerm
                ? {
                    name: searchTerm,
                    value: params.searchTerm,
                }
                : undefined,
        });

        return {
            currentPage: response.pagination.currentPage,
            data: response.data as IAssetTableRow[],
            hasNext: response.pagination.hasNext,
            hasPrevious: response.pagination.hasPrevious,
            pageItemCount: response.pagination.pageSize,
            total: response.pagination.totalCount,
            totalPages: response.pagination.totalPages,
        };
    }, [buildFilterSearch, searchTerm]);

    return (
        <Table<IAssetTableRow>
            basePath="/master/assets"
            columns={columns}
            currentPageValue={currentPage}
            deleteConfig={{
                confirmMessage: "Are you sure you want to delete this asset?",
                confirmTitle: "Delete Asset",
                invalidIdMessage: "The selected asset has an invalid id and cannot be deleted.",
                onDelete: deleteAssets,
                submitErrorMessage: "Unable to delete the selected asset.",
            }}
            fetchData={fetchData}
            filterFields={fieldFilters}
            filterValues={currentFiltersRecord}
            itemKey="id"
            onCurrentPageChange={handleCurrentPageChange}
            onFilterChange={handleFilterChange}
            onSearchChange={handleSearchChange}
            searchValue={currentSearch}
            title="Assets"
        />
    );
}
```

## Step 8: Build The Shared Form And Validation Schema

The shared form lives in `form.tsx` and should be reusable for create and edit.

Typical responsibilities:

- local form state
- zod validation
- field rendering through `app/components/Common/Form` when the fields fit the shared renderer
- lookup or line-item UI when needed
- inline field errors

Recommended structure:

- keep reusable zod schemas in `app/schemas/<entity>FormSchema.ts`
- keep typed form metadata in `hooks/useFormItem.ts(x)`
- keep repeated form labels, placeholders, field types, spans, and layout values in `app/constants/formItem.constants.ts`
- keep lookup definitions under `app/components/Common/LookupField/lookups/` when the lookup should be reused
- use `buildLookupPayload()` plus lookup constants from `app/constants/lookupQuery.constants.ts` for consistent lookup search payloads
- keep shared field rendering and styles in `app/components/Common/Form`
- keep submit state, validation mapping, and line-item orchestration inside `form.tsx`

Typical props shape:

```ts
interface IAssetFormProps
{
    mode: "create" | "edit";
    initialValues: IAssetFormValues;
    loading?: boolean;
    submitting?: boolean;
    onCancel: () => void;
    onSubmit: (values: IAssetFormValues) => void | Promise<void>;
}
```

Keep page-level API work out of `form.tsx`. For lookups, prefer `LookupField` + shared lookup definitions.

## Step 9: Build Create And Edit Entry Pages

Create and edit entry pages should stay thin.

Important rule:

- API-related functions must stay in the module entry file and be passed into the shared Maintain component through props

Create example:

```tsx
import { useNavigate } from "react-router";
import Create from "~/components/Maintain/Create";
import { createAsset } from "~/services/assets.service";
import AssetForm from "../form";
import { buildCreatePayload, createEmptyAssetFormValues } from "../hooks/helpers";

export default function CreateAssetPage()
{
    const navigate = useNavigate();

    async function handleSubmit(values: ReturnType<typeof createEmptyAssetFormValues>)
    {
        await createAsset(buildCreatePayload(values));
        navigate("/master/assets", { replace: true });
    }

    return (
        <Create
            backHref="/master/assets"
            backLabel="Back to Assets"
            Form={AssetForm}
            formProps={{ mode: "create" } as const}
            initialValues={createEmptyAssetFormValues()}
            onCancel={() => navigate("/master/assets")}
            onSubmit={handleSubmit}
            submitErrorMessage="Unable to create the asset."
            title="Create Asset"
        />
    );
}
```

Edit example:

```tsx
import { useNavigate, useParams } from "react-router";
import Edit from "~/components/Maintain/Edit";
import { getAssetById, updateAsset } from "~/services/assets.service";
import AssetForm from "../form";
import { buildUpdatePayload, mapAssetToFormValues } from "../hooks/helpers";

export default function EditAssetPage()
{
    const navigate = useNavigate();
    const params = useParams();

    return (
        <Edit
            backHref="/master/assets"
            backLabel="Back to Assets"
            Form={AssetForm}
            formProps={{ mode: "edit" } as const}
            id={params.id}
            invalidIdMessage="The requested asset id is invalid."
            loadData={getAssetById}
            loadErrorMessage="Unable to load the selected asset."
            loadingMessage="Loading asset..."
            mapDataToInitialValues={mapAssetToFormValues}
            notFoundMessage="Asset not found."
            onCancel={() => navigate("/master/assets")}
            onSubmit={async ({ id, values }) =>
            {
                await updateAsset(id, buildUpdatePayload(values));
                navigate("/master/assets", { replace: true });
            }}
            submitErrorMessage="Unable to update the asset."
            title="Edit Asset"
        />
    );
}
```

## Step 10: Build The Detail Page And Any Secondary Item Loading

The detail page should use `app/components/Maintain/Detail`.

Responsibilities that stay in the module file:

- record loader passed through `loadData`
- delete confirmation flow
- `actions` rendering
- `buildSections` mapping
- extra content such as `LineItemsEditor` below the detail sections

If the detail page needs a secondary collection such as line items, keep the async state in `hooks/useLineItem.ts` instead of embedding it directly in the page component or shared Maintain layer.

## Step 11: Handle Lookup, Line-Item, And Auth-Aware Cases

Use the existing shared components instead of building custom solutions first.

Lookup guidance:

- use `LookupField` for form lookup controls and let it open `ListPickerModal`
- place reusable lookup definitions in `app/components/Common/LookupField/lookups/`
- use `LOOKUP_COLUMNS`, `LOOKUP_ORDER_BY`, and `buildLookupPayload()` to keep lookup behavior consistent
- show business labels such as `code` and `name`, not only ids

Line-item guidance:

- use `LineItemsEditor` for editable row collections
- provide the line-item columns from the feature module or a shared helper folder
- use the read-only mode for detail pages when the collection should not be edited
- if the detail page loads line items from `/api/v1/repair-requests/{id}/items/search`, keep that request and its loading state in `hooks/useLineItem.ts`

Auth-aware guidance:

- consume `useUserContext()` when a page needs the current user, department, or route-gating state
- keep current-user restoration in `UserProvider`; do not duplicate `ensureCurrentUser()` effects in each module
- keep feature-specific checks in the page, for example requester ownership or manager department restrictions

## Step 12: Validate

Run:

```bash
bun run typecheck
```

Then manually verify the flows that apply to the module:

1. open the list page
2. search by quick text
3. apply and clear filters when filters exist
4. open the detail page
5. create a new record when create exists
6. edit an existing record when edit exists
7. delete a record when delete exists
8. check pagination and sorting

## Copy-From References In This Repo

Use these files as the baseline:

- `app/modules/Master/Users/index.tsx`
- `app/modules/Master/Users/Create/index.tsx`
- `app/modules/Master/Users/Edit/index.tsx`
- `app/modules/Master/Users/Detail/index.tsx`
- `app/modules/Master/Users/form.tsx`
- `app/modules/Master/Users/hooks/useFormItem.tsx`
- `app/modules/Master/Users/hooks/helpers.ts`
- `app/modules/Master/Users/hooks/useColumns.tsx`
- `app/modules/Master/Users/hooks/useFieldFilter.ts`
- `app/modules/Master/RepairRequestItemStatus/index.tsx`
- `app/modules/Master/RepairRequestItemStatus/form.tsx`
- `app/modules/Master/RepairRequestItemStatus/hooks/useFormItem.tsx`
- `app/modules/Master/Departments/index.tsx`
- `app/modules/Master/Departments/form.tsx`
- `app/components/Common/Form/index.tsx`
- `app/components/Common/LookupField/index.tsx`
- `app/components/Common/LookupField/lookups/department.lookup.ts`
- `app/constants/formItem.constants.ts`
- `app/constants/fieldFilter.constants.ts`
- `app/constants/lookupColumn.constants.ts`
- `app/constants/lookupQuery.constants.ts`
- `app/schemas/userFormSchema.ts`
- `app/schemas/departmentFormSchema.ts`
- `app/schemas/repairRequestItemStatusFormSchema.ts`
- `app/modules/Feature/employee/RepairRequests/form.tsx`
- `app/modules/Feature/employee/RepairRequests/hooks/useLineItem.ts`
- `app/modules/Feature/manager/RepairRequests/Detail/index.tsx`
- `app/modules/Feature/manager/RepairRequests/hooks/useLineItem.ts`
- `app/modules/Feature/RepairRequests/detailLineItemColumns.tsx`
- `app/providers/UserProvider.tsx`
- `app/api/users.api.ts`
- `app/services/users.service.ts`

## Common Mistakes To Avoid

- do not call raw `fetch()` from modules when `app/api/` already exists
- do not reintroduce the older flat `Create.tsx`, `Edit.tsx`, `Detail.tsx`, or `Manage.tsx` structure for new work
- do not move API loaders or mutations into shared Maintain components
- do not duplicate auth restoration logic in multiple feature pages when `UserProvider` already owns that behavior
- do not duplicate search parameter parsing in multiple pages when `useTableSearchParams()` already covers it
- do not duplicate filter labels, search field names, or param keys inline when the same values already live in shared constants
- do not duplicate lookup columns or lookup search payload defaults inline when `lookupColumn.constants.ts` and `lookupQuery.constants.ts` already cover them
- do not move backend field-name mapping into `DataTable`
- do not keep detail-page item search logic inline when the module already uses the `hooks/useLineItem.ts` pattern
- do not show plain ids when code and name are available
- do not put feature-specific logic inside raw shadcn UI primitives
- do not copy JavaScript reference code directly without converting it to the current TypeScript pattern
