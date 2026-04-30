# Task 02: Part Master CRUD Frontend

Owner
- Phi

Main dependency
- None.

Endpoints in scope
- `POST /api/v1/part/search`
- `POST /api/v1/part`
- `GET /api/v1/part/{id}`
- `PUT /api/v1/part/{id}`
- `DELETE /api/v1/part/{id}`
- `DELETE /api/v1/part/collection`

Why
- Part is restricted admin-only master data and it does not exist in the current frontend.
- Work Order Part and Inventory Move flows both need shared Part labels and read support.

What to implement
- Add full Part master CRUD in the current frontend style.
- Use one shared form component for create and edit.
- Show business fields such as part code and part name instead of only ids.
- If the API returns stock-related read fields such as `totalStock`, show them clearly in list or detail views as read-only business information.
- Add a reusable generic Part lookup definition only for unrestricted Part searching.
- Keep department-aware Part scoping out of the generic shared lookup.

Merge-safe ownership
- Phi owns the Part master frontend module and the generic shared Part lookup in this task.
- Ploy owns Work Order Part module-specific scoped Part selection.
- Chompu owns Inventory Move pages that consume Part lookup data.
- Do not implement stock intent shortcut flows in this task.

Exact touchpoints
- Create `app/api/types/part.types.ts`
- Edit `app/api/types/types.ts`
- Create `app/api/parts.api.ts`
- Create `app/services/parts.service.ts`
- Create `app/components/Common/LookupField/lookups/part.lookup.ts`
- Edit `app/constants/lookupQuery.constants.ts`
- Edit `app/constants/lookupColumn.constants.ts`
- Create `app/modules/Master/Parts/`
    - `Create/index.tsx`
    - `Detail/index.tsx`
    - `Edit/index.tsx`
    - `form.tsx`
    - `hooks/helpers.ts`
    - `hooks/useColumns.tsx`
    - `hooks/useFormItem.tsx`
    - `index.tsx`
- Create `app/routes/Master/Parts/`
    - `master.parts.tsx`
    - `master.parts.new.tsx`
    - `master.parts.$id.tsx`
    - `master.parts.$id.edit.tsx`
- Edit `app/routes.ts`

Files to change
- `app/api/types/types.ts`
- `app/constants/lookupQuery.constants.ts`
- `app/constants/lookupColumn.constants.ts`
- `app/routes.ts`
- new Part api, service, lookup, module, and route-wrapper files

Acceptance criteria
- Part master list, create, edit, detail, and delete flows exist.
- Generic Part lookup works for unrestricted Part selection use cases.
- Part pages display code, name, and useful read-only business fields.
- The shared lookup does not bake in Work Order department rules.

What is not in scope
- Work Order Part feature-local Part scoping.
- Inventory Move transaction UX.
- Stock intent shortcut actions.
- Global role-based navigation work.
