# Task 03: Work Task Assignment Flow Frontend

Owner
- Phi

Main dependency
- This task depends on Phi's Work Order CRUD task and Ploy's Work Task CRUD task.

Endpoints in scope
- `GET /api/v1/work-task/{id}`
- `GET /api/v1/work-task/{id}/assignment-history`
- `POST /api/v1/work-task/{id}/assign`
- `POST /api/v1/users/search`
- current-user context from `app/providers/UserProvider.tsx`

Why
- Work Task assignment has stricter department and role rules than plain Work Task CRUD.
- The backend allows manager or above to assign and reassign Work Tasks, but the assignee must stay inside the Work Order department.
- The JWT does not carry department directly, so frontend assignment logic must rely on current user context and Work Order data.
- In the expected business flow, Work Task Assignment is the transaction table that records who is responsible for the one task attached to a Work Order.
- The current assignment history contract already exposes `assignedAt` and `unassignedAt`, so `unassignedAt` should be treated as the flag that tells whether an assignment has already been changed or closed.
- Assignment belongs after Work Task in the documented flow, so the manager assignment action should live under the Manager Work Order detail page, not under Repair Request and not as a standalone assignment CRUD page.
- The current assign request only accepts `assigneeId`; assignment notes are not part of the current API/schema. Do not add a note field unless the backend contract is changed first.

What to implement
- Add manager-facing assign and reassign actions to the Manager Work Order detail page.
- Show the assignment action only when the Work Order already has a Work Task.
- Keep the existing task action behavior:
    - show `Create Task` when `workTaskId` is empty.
    - show `Update Task` when `workTaskId` exists.
    - show `Assign Technician` when `workTaskId` exists and there is no active assignee.
    - show `Reassign Technician` when `workTaskId` exists and there is an active assignee.
- Use a custom assignment modal instead of a generic detail/edit page because the assignment flow needs context, current assignee display, department-aware user selection, and reassignment confirmation text.
- Add assignment history display inside Manager Work Order detail, near the existing Work Task detail section.
- Treat Work Task Assignment history as a transactional table for responsibility changes, not as generic comments or audit text.
- Show the current responsible person from the active assignment state for this Work Task and Work Order.
- Use `unassignedAt` to distinguish active responsibility from past responsibility.
- Build a department-aware assignee picker that filters candidate users by the Work Order's `repairRequestItemId` department chain.
- Prevent `admin` from being offered as an assignee in the picker.
- Allow self-assignment only when the selected user is the current user and the department matches.
- Keep the user lookup logic close to the Work Order detail assignment flow because the filter depends on the target Work Order.
- Submit assignment with `POST /api/v1/work-task/{id}/assign` using only `{ assigneeId }`.
- Do not add assignment note input. The existing `note` field belongs to Work Task, not Work Task Assignment.

Merge-safe ownership
- Phi owns Work Task assignment actions and assignment history in this task.
- Ploy owns the base Work Task CRUD shell and forms.
- Do not refactor Work Task create, edit, list, or detail shells unless the assignment flow truly needs a small integration point.
- Do not move department-aware user filtering into a generic global user lookup without strong reason.
- Do not move assignment into Repair Request detail. Repair Request detail may create or view a Work Order, but assigning responsibility happens after the Work Task exists.

Exact touchpoints
- Edit Manager Work Order detail
    - likely `app/modules/Feature/manager/WorkOrders/Detail/index.tsx`
    - add the conditional assignment button beside or near the existing `Create Task` / `Update Task` action area
    - keep the Work Task detail section as the single source of displayed task data
- Create a custom assignment modal near the Manager Work Order detail feature
    - suggested path: `app/modules/Feature/manager/WorkOrders/Detail/AssignmentModal.tsx`
    - use shadcn components and the existing `ListPickerModal` pattern for user lookup where useful
    - include current assignee context and clear submit/cancel states
- Create assignment-focused hooks under `app/modules/Feature/manager/WorkOrders/hooks/` as needed
- Create or extend `app/api/workTasks.api.ts`
- Create or extend `app/services/workTasks.service.ts`
- Create or extend Work Task assignment types in `app/api/types/workTask.types.ts`
- Reuse `app/services/users.service.ts`
- Reuse `app/providers/UserProvider.tsx`
- Add department-aware lookup request code near the Work Order detail assignment UI instead of inside generic shared CRUD shells

Files to change
- Manager Work Order detail files
- Work Task api and service files
- Work Task types
- optional new assignment hooks or modal helpers under the Manager Work Order module

Acceptance criteria
- Manager Work Order detail does not show assignment controls until `workTaskId` exists.
- Manager Work Order detail shows `Create Task` before task creation and `Update Task` after task creation.
- Manager Work Order detail shows `Assign Technician` when the Work Task has no active assignee.
- Manager Work Order detail shows `Reassign Technician` when the Work Task already has an active assignee.
- The custom assignment modal submits only `assigneeId` to the assign endpoint.
- No assignment note input is shown unless the backend API/schema is updated first.
- Assignment history can be viewed from Manager Work Order detail.
- Assignment history is presented as responsibility transactions for one Work Task attached to one Work Order.
- The UI clearly distinguishes the active assignment from reassigned or closed rows by using `unassignedAt`.
- Assignee options are department-aware and exclude `admin`.
- Self-assignment works only when department rules allow it.
- The implementation keeps assignment-specific logic near the Manager Work Order detail feature.

What is not in scope
- Base Work Task CRUD implementation.
- Adding assignment note/reason fields to the backend contract.
- Explicit Unassign button or unassign flow.
- Moving assignment to Repair Request detail.
- Work Order Part CRUD.
- Global role-based navigation work.
