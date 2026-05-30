# Task 04: Work Order Part Frontend Real Implementation

Owner
- Ploy

Main dependencies
- Phi's Part Master CRUD, because this task needs real Part lookup data.
- Phi's Work Order CRUD, because Work Order Part is managed from a Work Order detail page.
- The employee Work Order list/detail shell, if it is still being finished by another task.

Read first
- `docs/repair-workflow.md`
- `docs/crud-guide.md`
- `docs/search-guide.md`
- `docs/openapi.yaml`
- `docs/databaseSchema.md`
- Current workbench shell reference:
    - `app/modules/Feature/employee/WorkOrders/Detail/WorkOrderWorkbench.tsx`
    - `app/modules/Feature/employee/WorkOrders/Detail/WorkOrderPartLineItemsEditor.tsx`
    - `app/modules/Feature/employee/WorkOrders/Detail/hooks/useWorkOrderPartLineItemColumn.tsx`

Important note
- The current `WorkOrderWorkbench` should stay as a real-data shell until the API-backed Work Order Part behavior is wired.
- Do not add temporary sample rows, generated IDs, frontend-only state mutations, or placeholder audit values.
- This task is for Work Order Part. Do not redesign the manager assignment flow, Part Master CRUD, or a global Work Order Part CRUD page.

Business flow
- Repair Request -> Repair Request Item -> Work Order -> Work Task -> Work Task Assignment -> Work Order Part -> Inventory Move Item
- Work Order Part belongs to the Work Order execution flow.
- The employee manages Work Order Parts inside the assigned Work Order detail page.
- Work Task is the single execution description for a Work Order. Do not model Work Task as the parent of Work Order Part.
- The active assignee is the `work_task_assignment` row where `unassigned_at` is empty.
- `inventoryMoveItemId` links a Work Order Part to the actual stock movement after consumption.

Endpoints in scope
- `POST /api/v1/work-order-part/search`
- `POST /api/v1/work-order-part`
- `GET /api/v1/work-order-part/{id}`
- `PUT /api/v1/work-order-part/{id}`
- `DELETE /api/v1/work-order-part/{id}`
- `DELETE /api/v1/work-order-part/collection`
- `POST /api/v1/part/{id}/consume-stock`, only for the Consume Part action

Real employee flow to implement
- Employee opens `/work-orders`.
- The list shows only Work Orders assigned to the current user through the active Work Task assignment.
- Employee opens `/work-orders/:id`.
- The detail page shows:
    - Work Order information
    - Repair Request / Repair Request Item business labels
    - the single Work Task description and assignment information
    - Work Order Parts for that Work Order
- The Work Order Part area loads real rows from `POST /api/v1/work-order-part/search` filtered by `work_order_id`.
- The employee can manage parts only when:
    - the Work Order has a Work Task
    - the current user is the active assignee
    - the Work Order is not final
    - the Work Task has started
    - the Work Task has not ended
- If any rule fails, show the parts read-only and disable create, update, delete, and consume actions.

Temporary behavior not allowed
- Do not add generated Work Order Part rows.
- Do not hardcode Part labels.
- Do not implement create, delete, or consume behavior by only calling `setParts()`.
- Do not generate `inventoryMoveItemId` on the frontend.
- Do not generate `createdBy` / `updatedBy` values on the frontend.
- Do not add copy that says the page is sample-only or not connected to backend APIs.
- Replace the numeric Part Id input with a real Part picker that shows Part code, name, product type, and stock where available.
- Wire Work Order Part actions through real API/service calls.
- Do not implement Work Task start/finish inside this task unless the required real API/service work is already available and explicitly part of the current Work Order task. It can stay as a separate handoff.

Work Order Part API and service layer
- Create `app/api/types/workOrderPart.types.ts`.
- Export the new types from:
    - `app/api/types/types.ts`
    - `app/api/types.ts`
- Create `app/api/workOrderParts.api.ts`.
- Create `app/services/workOrderParts.service.ts`.
- Add these contracts:
    - `IWorkOrderPart`
    - `IWorkOrderPartForCreate`
    - `IWorkOrderPartForUpdate`
- Match `docs/openapi.yaml`:
    - `IWorkOrderPart.workOrderId`
    - `IWorkOrderPart.partId`
    - `IWorkOrderPart.partCode`
    - `IWorkOrderPart.partName`
    - `IWorkOrderPart.quantity`
    - `IWorkOrderPart.note`
    - `IWorkOrderPart.inventoryMoveItemId`
    - common audit fields
- Use `httpPaginated()` for search.
- Use `http()` for create, detail, update, delete, and collection delete.
- Add a Part stock consume API/service wrapper if it does not already exist:
    - API endpoint: `POST /api/v1/part/{id}/consume-stock`
    - body: `{ quantity, note?, workOrderPartId? }`
    - after consuming, reload Work Order Parts because the endpoint returns Part data, not the updated Work Order Part row.

Work Order Part UI behavior
- Keep Work Order Parts embedded in the employee Work Order detail page.
- Do not add a detached global Work Order Part menu or full global CRUD route.
- Use shared components where they fit:
    - `LineItemsEditor` for the Work Order Part rows
    - `LookupField` / `ListPickerModal` for Part selection
    - shared `Modal` / `ConfirmModal` for confirmation flows
    - shadcn UI primitives for buttons, inputs, badges, and form controls
- Use zod validation for create/update forms.
- Use interfaces for every component prop object.
- Show business labels:
    - Part code and name
    - Work Order request number / sequence
    - Work Task description / assignee name
    - Inventory Move Item linkage when present
- Do not show only running IDs when a code/name is available.

Create Part usage
- Create payload:
    - `workOrderId`
    - `partId`
    - `quantity`
    - `note`
- Validate quantity as a positive integer.
- The selected Part must come from the department-aware picker.
- After create succeeds, close the modal and reload Work Order Parts from the backend.
- Do not append a local generated row as the source of truth.

Update Part usage
- Allow updating only planned rows where `inventoryMoveItemId` is empty.
- Update payload:
    - `quantity`
    - `note`
- Do not allow changing Part after the row is consumed.
- After update succeeds, reload Work Order Parts.

Delete planned Part usage
- Allow delete only for planned rows where `inventoryMoveItemId` is empty.
- Confirm before deleting.
- Call `DELETE /api/v1/work-order-part/{id}`.
- After delete succeeds, reload Work Order Parts.
- Do not allow deleting consumed rows from this screen.

Consume Part
- Consume is a real stock action, not a local state-only change.
- Allow consume only for planned rows where `inventoryMoveItemId` is empty.
- Confirm before consuming.
- Call `POST /api/v1/part/{partId}/consume-stock`.
- Send:
    - `quantity`: the Work Order Part quantity
    - `workOrderPartId`: the Work Order Part id
    - `note`: a useful note if the UI captures one
- After consume succeeds, reload Work Order Parts so the row reflects the real `inventoryMoveItemId`.
- If the backend reports insufficient stock or validation errors, show a meaningful page/modal error.

Department-aware Part selection
- Part selection must be scoped by the Work Order's Repair Request Item department context.
- Resolve the department from the Work Order -> Repair Request Item chain.
- If the Work Order detail response does not contain enough department data, load the needed Repair Request Item detail/search data before opening the picker.
- If the department cannot be resolved, block Part selection with a clear message.
- Do not fall back to an unrestricted global Part picker.
- Prefer a hidden backend `search[]` filter on the Part lookup when the backend supports a department field through Product Type.
- If the current backend does not expose a searchable field that can restrict Part by Repair Request Item department, document the backend gap in the task result and keep the picker blocked instead of showing unrestricted Parts.

Suggested route shape
- `GET /work-orders`
- `GET /work-orders/:id`
- Work Order Part create/update/delete/consume actions happen inside `/work-orders/:id`.

Exact touchpoints
- `app/api/types/workOrderPart.types.ts`
- `app/api/types/types.ts`
- `app/api/types.ts`
- `app/api/workOrderParts.api.ts`
- `app/services/workOrderParts.service.ts`
- `app/api/parts.api.ts`, only if adding the consume-stock wrapper
- `app/services/parts.service.ts`, only if adding the consume-stock wrapper
- `app/modules/Feature/employee/WorkOrders/Detail/`
- `app/modules/Feature/employee/WorkOrders/`
- employee route wrappers under the existing route convention
- `app/routes.ts`, only if the employee Work Order routes are not already registered

Acceptance criteria
- No sample Work Order Part rows exist in the employee Work Order detail flow.
- No frontend-generated `inventoryMoveItemId`, Part labels, audit values, or sample-only copy exists.
- Employee Work Order list is scoped to the current active assignee.
- Employee Work Order detail rejects Work Orders assigned to another user.
- Work Order Parts load from `POST /api/v1/work-order-part/search` by `work_order_id`.
- Create, update, delete, and consume actions call real services and refresh backend data.
- Consumed rows are read-only and show their `inventoryMoveItemId`.
- Planned rows can be updated, deleted, or consumed when the employee is allowed to manage the Work Order.
- Part picker is department-aware or blocked with a clear error if department filtering cannot be guaranteed.
- The implementation follows the current TypeScript, zod, shadcn, Tailwind, and shared component conventions.
- `bun run typecheck` passes.

Out of scope
- Generic Part Master CRUD.
- Global Work Order Part CRUD pages.
- Manager Work Task assignment or reassignment flows.
- Raw shadcn UI component changes.
- Changes inside `client/src` or `example/src`.
- Full Work Task start/finish implementation, unless that work has already been explicitly assigned to this task.
