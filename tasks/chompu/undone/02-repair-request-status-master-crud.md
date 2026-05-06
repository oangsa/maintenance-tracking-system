# Task 02: Repair Request Status Master CRUD Frontend

Owner
- Chompu

Main dependency
- None.

Endpoints in scope
- `POST /api/v1/repair-status/search`
- `POST /api/v1/repair-status`
- `GET /api/v1/repair-status/{id}`
- `PUT /api/v1/repair-status/{id}`
- `DELETE /api/v1/repair-status/{id}`
- `DELETE /api/v1/repair-status/collection`

Why
- Repair Request Item Status is already implemented, so this task should move to the missing Repair Request Status master-data area instead of duplicating finished work.
- The frontend already has read support for Repair Status lookup usage, but it does not yet have the full master CRUD surface.
- Repair Request flows depend on stable Repair Request Status labels and admin maintenance screens.

What to implement
- Extend the current Repair Status api and service coverage from read-only to full CRUD.
- Add Repair Request Status master list, create, edit, detail, and delete pages.
- Show business labels such as `code` and `name` in list and detail views.
- Keep search simple and aligned with the current repo style by using quick search on `code,name`.
- Reuse the shared Maintain CRUD shells and a single shared form for create and edit.
- Follow the current TypeScript module layout used by `Departments` and `Users`.

Suggested route shape
- `GET /master/repair-statuses`
- `GET /master/repair-statuses/new`
- `GET /master/repair-statuses/:id/edit`
- `GET /master/repair-statuses/:id`

Merge-safe ownership
- Chompu owns the Repair Request Status master frontend module in this task.
- Do not rework the existing Repair Request Item Status module in this task.
- Do not rename the backend `repair-status` resource or change its public API shape.
- Avoid broad shared CRUD-shell refactors unless there is a real reusable bug to fix.

Exact touchpoints
- Extend `app/api/types/repairStatus.types.ts` with create and update contracts if needed by the OpenAPI spec
- Edit `app/api/types/types.ts`
- Edit `app/api/repairStatuses.api.ts`
- Edit `app/services/repairStatuses.service.ts`
- Create `app/modules/Master/RepairStatuses/`
    - `Create/index.tsx`
    - `Detail/index.tsx`
    - `Edit/index.tsx`
    - `form.tsx`
    - `hooks/helpers.ts`
    - `hooks/useColumns.tsx`
    - `hooks/useFormItem.tsx` if useful
    - `index.tsx`
- Create `app/routes/Master/RepairStatuses/`
    - `master.repair-statuses.tsx`
    - `master.repair-statuses.new.tsx`
    - `master.repair-statuses.$id.tsx`
    - `master.repair-statuses.$id.edit.tsx`
- Edit `app/routes.ts`
- Reuse shared patterns from:
    - `app/modules/Master/Departments`
    - `app/modules/Master/Users`

Files to change
- `app/api/types/types.ts`
- `app/api/repairStatuses.api.ts`
- `app/services/repairStatuses.service.ts`
- `app/routes.ts`
- new Repair Request Status module and route-wrapper files

Acceptance criteria
- Repair Request Status master pages support list, create, edit, detail, and delete.
- Quick search uses `searchTerm` with `code,name`.
- Create and edit reuse the same form component.
- List and detail pages show Repair Request Status business labels instead of internal ids.
- The implementation follows the same current pattern as `Departments` and `Users`.
- The task wording and touchpoints no longer refer to Repair Request Item Status as the target module.

What is not in scope
- Repair Request Item Status CRUD work.
- Inventory Move screens.
- Generic status systems outside `repair-status`.
- Global role-based navigation work.
