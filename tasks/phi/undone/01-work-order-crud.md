# Task 01: Work Order CRUD Frontend

Owner
- Phi

Main dependency
- None.

Endpoints in scope
- `POST /api/v1/work-order/search`
- `POST /api/v1/work-order`
- `GET /api/v1/work-order/{id}`
- `PUT /api/v1/work-order/{id}`
- `DELETE /api/v1/work-order/{id}`
- `DELETE /api/v1/work-order/collection`
- `POST /api/v1/repair-requests/{id}/work-orders/search`

Why
- Work Order is a core execution record and it has no current standalone frontend module.
- Manager Repair Request detail already has TODO placeholders for opening Work Order flows.
- Work Task assignment later depends on Work Order data, especially `repairRequestItemId`.
- In the current data model, Work Order is created from a Repair Request Item context and should be treated as one Work Order per Repair Request Item.
- The employee and manager views of Work Orders need different access constraints.

What to implement
- Add employee and manager Work Order list and detail pages with different visibility rules.
- Add manager-scoped create and edit flows with one shared form component.
- Reuse the current frontend CRUD pattern instead of inventing a custom flow.
- Treat `repairRequestItemId` as the main parent context of a Work Order, not as an optional side field.
- Make the UI clearly show which Repair Request Item the Work Order belongs to.
- Prefer create flows that start from a selected Repair Request Item or an existing Repair Request detail context.
- Use related Repair Request and Repair Request Item business labels where possible instead of only raw ids.
- Wire the current manager Repair Request detail TODO actions into real Work Order navigation.
- For employee view:
    - show only Work Orders that belong to the current user through the active Work Task assignment
    - clicking into a row should open the employee-facing Work Order detail flow
- For manager view:
    - show Work Orders for the manager's department
    - clicking into a row should open a manager-facing Work Order detail flow
    - the detail flow should include a button to assign the task to a user
    - assignee selection can use a lookup table or LoV pattern
- Keep this task focused on Work Order CRUD and Work Order discovery from Repair Requests.

Suggested route shape
- `GET /work-orders`
- `GET /work-orders/:id`
- `GET /manager/work-orders/new`
- `GET /manager/work-orders/:id/edit`

Important flow note
- The UI should respect the current one-Work-Order-per-Repair-Request-Item model.
- Do not design Work Order create as a detached generic record that ignores `repairRequestItemId`.

Access note
- Employee Work Order list should be filtered by active assignment ownership.
- Manager Work Order list should be filtered by department ownership.

Merge-safe ownership
- Phi owns the Work Order frontend module in this task.
- Ploy owns Work Task CRUD and Work Order Part CRUD.
- Implement the manager-side entry point or button that starts task assignment from Work Order detail.
- The deeper assignment flow and transaction history still belong to Phi's Work Task assignment task.
- Avoid broad shared sidebar changes unless coordinated separately.

Exact touchpoints
- Expand `app/api/types/workOrder.types.ts` with the fields required by OpenAPI and form payloads
- Edit `app/api/types/types.ts`
- Create `app/api/workOrders.api.ts`
- Create `app/services/workOrders.service.ts`
- Create `app/modules/Feature/WorkOrders/`
    - manager create page
    - manager edit page
    - manager list and detail pages
    - employee list and detail pages
    - hooks, helpers, and columns needed for each view
    - any assignment-entry button wiring that belongs on manager detail
- Create route wrappers under employee and manager route groups using the repo's route-wrapper convention
- Edit `app/routes.ts`
- Edit `app/modules/Feature/manager/RepairRequests/Detail/index.tsx`
- Reuse or extend `app/api/repairRequests.api.ts` and `app/services/repairRequests.service.ts` only if needed for repair-request-specific Work Order listing

Files to change
- `app/api/types/workOrder.types.ts`
- `app/api/types/types.ts`
- `app/routes.ts`
- `app/modules/Feature/manager/RepairRequests/Detail/index.tsx`
- new Work Order api, service, module, and route-wrapper files

Acceptance criteria
- Employee Work Order list only shows Work Orders whose active task assignment belongs to the current user.
- Manager Work Order list only shows Work Orders for the manager's department.
- Work Order list, detail, create, edit, and delete flows exist in the repo's current style where allowed by the view.
- Manager Repair Request detail no longer has placeholder navigation for Work Orders.
- Work Order screens display business meaning for the linked Repair Request Item instead of only ids.
- Work Order create flow clearly anchors the record to a Repair Request Item.
- The task brief and UI do not imply many Work Orders for one Repair Request Item unless the backend behavior changes later.
- Manager Work Order detail includes a clear task-assignment action entry point such as a button that opens user selection.
- The module is ready for Work Task CRUD and assignment tasks to build on top of it.

What is not in scope
- Work Task CRUD.
- Work Task assignment actions.
- Work Order Part CRUD.
- Global role-based navigation work.
