# Task 04: Work Order Part CRUD Frontend

Owner
- Ploy

Main dependency
- This task depends on Phi's Part Master CRUD task and Phi's Work Order CRUD task because Work Order Part belongs to a Work Order and needs Part master data.

Endpoints in scope
- `POST /api/v1/work-order-part/search`
- `POST /api/v1/work-order-part`
- `GET /api/v1/work-order-part/{id}`
- `PUT /api/v1/work-order-part/{id}`
- `DELETE /api/v1/work-order-part/{id}`
- `DELETE /api/v1/work-order-part/collection`

Why
- Work Order Part is the repair execution record for actual part usage.
- The backend currently allows any authenticated user to list, view, create, update, and delete Work Order Parts.
- In the intended frontend flow, Work Order Part should live under the employee feature because the employee who is responsible for the assigned work is the one who orders or records the part usage.
- The frontend still needs to preserve department-aware part selection rules when this record is created from a Work Order context.
- Work Order Part also links planned usage to the actual inventory transaction through `inventoryMoveItemId`.

What to implement
- Build this inside the employee feature area, not as a generic global feature.
- The employee list page should show only Work Orders that belong to the current user through the active task assignment relationship.
- Treat the ownership rule as current user id = active `work_task_assignment.assigneeId` for the Work Task that belongs to the Work Order.
- When the employee opens one Work Order, the detail page should show:
    - Work Order data (PHI)
    - the single Work Task as the execution description (PHI)
    - the Work Order Part area where the employee can add or manage ordered/used parts inside that Work Order
- Keep the department-aware part lookup logic close to this module or form.
- Use the selected Work Order -> Repair Request Item chain to determine the department context when filtering selectable parts.
- If the required department context cannot be resolved, block selection with a clear message instead of falling back to a global unrestricted picker.
- Treat `inventoryMoveItemId` as an important linkage field between Work Order Part and the actual stock transaction, even if some flows may keep it read-only.

Suggested route shape
- `GET /employee/work-orders`
- `GET /employee/work-orders/:id`
- Work Order Part create or update actions should happen inside the employee Work Order detail flow instead of a detached global Work Order Part page

Merge-safe ownership
- Ploy owns the Work Order Part frontend module in this task.
- Do not push department-aware part scoping into a generic shared Part lookup if the filter depends on Work Task or Work Order context.
- Phi owns the generic Part master module.
- Phi owns the manager-side task assignment flow.
- Do not redesign manager assignment flows in this task.

Exact touchpoints
- Create `app/api/types/workOrderPart.types.ts`
- Edit `app/api/types/types.ts`
- Create `app/api/workOrderParts.api.ts`
- Create `app/services/workOrderParts.service.ts`
- Create employee-facing Work Order feature files under `app/modules/Feature/employee/WorkOrders/` or another employee feature path that matches the repo convention
    - employee Work Order list page
    - employee Work Order detail page
    - embedded Work Order Part create or edit flow
    - any supporting hooks, helpers, or local form pieces
- Reuse the existing Work Order Part api and service layer from this employee feature flow
- Create employee route wrappers under `app/routes/Main/` or `app/routes/employee/` using the repo's route-wrapper convention
- Edit `app/routes.ts`

Files to change
- `app/api/types/types.ts`
- `app/routes.ts`
- new Work Order Part api, service, employee Work Order module, and route-wrapper files

Acceptance criteria
- Employee Work Order list only shows Work Orders assigned to the current user through the active Work Task assignment.
- Employee Work Order detail shows Work Order data and the single Work Task description for that Work Order.
- Work Order Part ordering or usage happens inside the employee Work Order detail flow.
- Part selection is department-aware based on Work Order -> Repair Request Item context.
- The module uses business labels for Part, Work Order, Work Task, and related parent records.
- The task description does not incorrectly model Work Task as the parent of Work Order Part.
- The UI accounts for the `inventoryMoveItemId` linkage as part of the record shape.
- The form follows the current shared CRUD architecture and TypeScript conventions.

What is not in scope
- Generic Part master CRUD.
- Work Task assignment actions.
- Global role-based navigation work.
