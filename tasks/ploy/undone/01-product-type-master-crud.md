# Task 01: Product Type Master CRUD Frontend

Owner
- Ploy

Main dependency
- None.

Endpoints in scope
- `POST /api/v1/product-type/search`
- `POST /api/v1/product-type`
- `GET /api/v1/product-type/{id}`
- `PUT /api/v1/product-type/{id}`
- `DELETE /api/v1/product-type/{id}`
- `DELETE /api/v1/product-type/collection`

Why
- Product Type is admin-only master data and it does not exist in the current frontend.
- Product CRUD depends on this master data for display labels and lookup selection.
- Product Type is department-linked master data, so the frontend must not treat it as only code and name.

What to implement
- Add full Product Type master CRUD in the current frontend style.
- Follow the same nested module pattern used by `app/modules/Master/Departments` and `app/modules/Master/Users`.
- Use one shared `form.tsx` for create and edit.
- Use `zod` validation.
- Include Department selection in create and edit because `departmentId` is required by the schema.
- List page should support quick search by `code,name`.
- List and detail pages should show Department business values such as department code and department name, not only `departmentId`.
- Keep this task scoped to frontend CRUD only.

Merge-safe ownership
- Ploy owns the Product Type frontend module in this task.
- Do not edit Product master pages in this task.
- Reuse the existing Department service and lookup pattern instead of creating a custom department selector.
- Do not implement global role-based sidebar logic in this task.
- Avoid changing shared CRUD shells under `app/components/Maintain/` unless blocked by a real reusable requirement.

Exact touchpoints
- Create `app/api/types/productType.types.ts`
- Edit `app/api/types/types.ts`
- Create `app/api/productTypes.api.ts`
- Create `app/services/productTypes.service.ts`
- Create `app/components/Common/LookupField/lookups/productType.lookup.ts` only if Product task needs a reusable lookup later
- Create `app/modules/Master/ProductTypes/`
    - `Create/index.tsx`
    - `Detail/index.tsx`
    - `Edit/index.tsx`
    - `form.tsx`
    - `hooks/helpers.ts`
    - `hooks/useColumns.tsx`
    - `hooks/useFormItem.ts`
    - `index.tsx`
- Create `app/routes/Master/ProductTypes/`
    - `master.product-types.tsx`
    - `master.product-types.new.tsx`
    - `master.product-types.$id.tsx`
    - `master.product-types.$id.edit.tsx`
- Edit `app/routes.ts`
- Optional only if coordinated later: `app/components/Common/Sidebar/index.tsx`

Files to change
- `app/api/types/types.ts`
- `app/routes.ts`
- Department lookup or Department service consumers as needed
- new Product Type api, service, module, and route-wrapper files

Acceptance criteria
- Product Type list, create, edit, detail, and delete pages work in the same style as existing master modules.
- Quick search uses `searchTerm` with `code,name`.
- Create and edit reuse the same form component.
- Product Type form requires valid Department selection.
- Detail page shows code, name, department code, department name, and common audit fields.
- The work follows the TypeScript and formatting conventions already used in the repo.

What is not in scope
- Product CRUD.
- Product Type lookup wiring inside Product forms.
- Global role-based navigation work.
