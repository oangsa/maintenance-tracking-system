# Task 03: Work Task Assignment Flow Frontend

Owner
- Phi

Main dependency
- This task depends on Phi's Work Order CRUD task and Ploy's Work Task CRUD task.

Endpoints in scope
- `GET /api/v1/work-task/{id}`
- `GET /api/v1/work-task/{id}/assignment-history`
- `POST /api/v1/work-task/{id}/assign`
- `POST /api/v1/work-task/{id}/unassign`
- `POST /api/v1/users/search`
- current-user context from `app/providers/UserProvider.tsx`

Why
- Work Task assignment has stricter department and role rules than plain Work Task CRUD.
- The backend allows manager or above to assign, reassign, unassign, and delete Work Tasks, but the assignee must stay inside the Work Order department.
- The JWT does not carry department directly, so frontend assignment logic must rely on current user context and Work Order data.
- In the expected business flow, Work Task Assignment is the transaction table that records who is responsible for the one task attached to a Work Order.
- The current assignment history contract already exposes `assignedAt` and `unassignedAt`, so `unassignedAt` should be treated as the flag that tells whether an assignment has already been changed or closed.

What to implement
- Add manager-facing assign, reassign, and unassign actions to the Work Task UX.
- Add assignment history display in Work Task detail.
- Treat Work Task Assignment history as a transactional table for responsibility changes, not as generic comments or audit text.
- Show the current responsible person from the active assignment state for this Work Task and Work Order.
- Use `unassignedAt` to distinguish active responsibility from past responsibility.
- Build a department-aware assignee picker that filters candidate users by the Work Order's `repairRequestItemId` department chain.
- Prevent `admin` from being offered as an assignee in the picker.
- Allow self-assignment only when the selected user is the current user and the department matches.
- Keep the user lookup logic close to the Work Task assignment flow because the filter depends on the target Work Order.

Merge-safe ownership
- Phi owns Work Task assignment actions and assignment history in this task.
- Ploy owns the base Work Task CRUD shell and forms.
- Do not refactor Work Task create, edit, list, or detail shells unless the assignment flow truly needs a small integration point.
- Do not move department-aware user filtering into a generic global user lookup without strong reason.

Exact touchpoints
- Edit the Work Task module created in Ploy's task
    - likely `app/modules/Feature/WorkTasks/Detail/index.tsx`
    - and any local hooks that support task actions
- Create assignment-focused hooks under `app/modules/Feature/WorkTasks/hooks/` as needed
- Create or extend `app/api/workTasks.api.ts`
- Create or extend `app/services/workTasks.service.ts`
- Reuse `app/services/users.service.ts`
- Reuse `app/providers/UserProvider.tsx`
- Add department-aware lookup request code near the Work Task assignment UI instead of inside generic shared CRUD shells

Files to change
- Work Task module files from Task 03 by Ploy
- Work Task api and service files
- optional new assignment hooks or modal helpers under the Work Task module

Acceptance criteria
- Manager-facing Work Task screens allow assign, reassign, and unassign.
- Assignment history can be viewed from Work Task detail.
- Assignment history is presented as responsibility transactions for one Work Task attached to one Work Order.
- The UI clearly distinguishes the active assignment from reassigned or closed rows by using `unassignedAt`.
- Assignee options are department-aware and exclude `admin`.
- Self-assignment works only when department rules allow it.
- The implementation keeps assignment-specific logic near the Work Task feature.

What is not in scope
- Base Work Task CRUD implementation.
- Work Order Part CRUD.
- Global role-based navigation work.
