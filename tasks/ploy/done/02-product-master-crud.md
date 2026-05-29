# Task 02: Product Master CRUD Frontend

Owner
- Ploy

Main dependency
- This task depends on Task 01 Product Type Master CRUD because Product forms need Product Type lookup and business labels.

Endpoints in scope
- `POST /api/v1/product/search`
- `POST /api/v1/product`
- `GET /api/v1/product/{id}`
- `PUT /api/v1/product/{id}`
- `DELETE /api/v1/product/{id}`
- `DELETE /api/v1/product/collection`

Why
- Product master data is admin-only and currently only has partial read support in the frontend.
- Repair Request and later Work Order flows need consistent product labels and lookup data.

What to implement
- Extend the current Product api and service coverage from read-only to full CRUD.
- Add Product master list, create, edit, detail, and delete pages.
- Use Product Type lookup in the shared Product form.
- Show `productTypeCode` and `productTypeName` in list and detail views instead of only `productTypeId`.
- Keep search simple and aligned with current repo style by using quick search on `code,name`.
- Reuse shared Maintain CRUD shells and `LookupField`.

Merge-safe ownership
- Ploy owns the Product master frontend module in this task.
- Do not edit Product Type module internals except consuming its service or lookup definition.
- Do not change Employee Repair Request product picker behavior in this task.
- Do not implement global role-based sidebar logic in this task.

Exact touchpoints
- Edit `app/api/products.api.ts`
- Edit `app/services/products.service.ts`
- Reuse `app/api/types/product.types.ts` and extend only if the OpenAPI contract requires more fields
- Create `app/components/Common/LookupField/lookups/productType.lookup.ts` if Task 01 does not already provide one
- Create `app/modules/Master/Products/`
    - `Create/index.tsx`
    - `Detail/index.tsx`
    - `Edit/index.tsx`
    - `form.tsx`
    - `hooks/helpers.ts`
    - `hooks/useColumns.tsx`
    - `hooks/useFormItem.tsx`
    - `index.tsx`
- Create `app/routes/Master/Products/`
    - `master.products.tsx`
    - `master.products.new.tsx`
    - `master.products.$id.tsx`
    - `master.products.$id.edit.tsx`
- Edit `app/routes.ts`
- Optional only if coordinated later: `app/components/Common/Sidebar/index.tsx`

Files to change
- `app/api/products.api.ts`
- `app/services/products.service.ts`
- `app/routes.ts`
- new Product lookup, module, and route-wrapper files

Acceptance criteria
- Product master pages support list, create, edit, detail, and delete.
- Product form uses Product Type lookup and stores `productTypeId` correctly.
- List and detail pages show product code, product name, and Product Type business labels.
- Quick search uses `searchTerm` with `code,name`.
- The implementation follows the same current pattern as `Departments` and `Users`.

What is not in scope
- Part master data.
- Repair Request product-line-item UX changes.
- Global role-based navigation work.
