# Task 02: Repair Request Item Status Master Table Alignment

Owner
- Chompu

Main dependency
- None.

Endpoints in scope
- `POST /api/v1/repair-request-item-status/search`
- `POST /api/v1/repair-request-item-status`
- `GET /api/v1/repair-request-item-status/{id}`
- `PUT /api/v1/repair-request-item-status/{id}`
- `DELETE /api/v1/repair-request-item-status/{id}`
- `DELETE /api/v1/repair-request-item-status/collection`

Why
- Repair Request Item Status is the current backend endpoint that matches the Item Status master-data area.
- The frontend already has a working master module for this area, so this task should use the current implementation instead of rebuilding it from scratch.
- Chompu should own this master-table area alongside Inventory Move responsibilities.

What to implement
- Review the current Repair Request Item Status master table and align it with the current project standard where needed.
- Keep the existing endpoint names and current route shape.
- Reuse the current module, service, api, and route-wrapper files as the starting point.
- Confirm the list page uses current search behavior correctly for `code,name`.
- Confirm create and edit reuse the same shared form component.
- Confirm detail, delete, and route wiring follow the same shared Maintain pattern as the other master modules.
- Only refactor where needed to match the current repo style or fix obvious inconsistencies.

Merge-safe ownership
- Chompu owns the Repair Request Item Status master-table area in this task.
- Do not rename the backend resource to a different public endpoint name.
- Do not rebuild this feature in a brand-new module when the current one already exists.
- Avoid broad shared CRUD-shell refactors unless there is a real reusable bug to fix.

Exact touchpoints
- Review and update existing files only as needed:
    - `app/api/repairRequestItemStatus.api.ts`
    - `app/services/repairRequestItemStatus.service.ts`
    - `app/modules/Master/RepairRequestItemStatus/index.tsx`
    - `app/modules/Master/RepairRequestItemStatus/Create/index.tsx`
    - `app/modules/Master/RepairRequestItemStatus/Edit/index.tsx`
    - `app/modules/Master/RepairRequestItemStatus/Detail/index.tsx`
    - `app/modules/Master/RepairRequestItemStatus/form.tsx`
    - `app/modules/Master/RepairRequestItemStatus/hooks/helpers.ts`
    - `app/modules/Master/RepairRequestItemStatus/hooks/useColumns.tsx`
    - `app/modules/Master/RepairRequestItemStatus/hooks/useFormItem.ts`
    - `app/routes/Master/RepairRequestItemStatus/`
    - `app/routes.ts`
- Reuse shared patterns from:
    - `app/modules/Master/Departments`
    - `app/modules/Master/Users`

Files to change
- existing Repair Request Item Status api, service, module, route-wrapper, and route registration files as needed

Acceptance criteria
- The current Repair Request Item Status master table is aligned with the repo's present CRUD style.
- Quick search behavior is correct for the existing endpoint.
- Create and edit reuse the same form component.
- Detail and delete flows behave consistently with other master modules.
- No unnecessary rebuild is introduced when the current feature already exists.

What is not in scope
- Inventory Move screens.
- Generic status systems outside `repair-request-item-status`.
- Global role-based navigation work.
