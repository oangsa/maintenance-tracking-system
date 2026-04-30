# Task 03: Work Task CRUD Frontend

Owner
- Ploy

Main dependency
- This task depends on Phi's Work Order CRUD task because Work Tasks belong to Work Orders and need Work Order context in the UI.

Endpoints in scope
- `POST /api/v1/work-task/search`
- `POST /api/v1/work-task`
- `GET /api/v1/work-task/{id}`
- `PUT /api/v1/work-task/{id}`
- `DELETE /api/v1/work-task/{id}`
- `DELETE /api/v1/work-task/collection`

Why
- Work Task is part of the repair execution flow and it has no current frontend module.
- The current backend allows authenticated users to read Work Tasks, but manager or above is required for create, update, and delete.
- In the expected business flow, a Work Task acts as the description and execution note for one Work Order, not as a free-form set of many child tasks under the same order.

What to implement
- Add Work Task list and detail pages for authenticated users.
- Add manager-scoped create and edit flows that reuse one shared form component.
- Treat Work Task as the single task record that belongs to one Work Order.
- The Work Task form should focus on the task description, timing fields, and task note for that Work Order.
- Prefer Work Order-aware entry points or labels so the user can clearly tell which Repair Request Item -> Work Order this task belongs to.
- Keep assign, reassign, unassign, and assignment history out of this task.
- Do not turn this into a multi-row subtask planner for one Work Order.
- Show business labels from the related Work Order and upstream Repair Request Item instead of only foreign-key ids where possible.
- Keep route wrappers thin and module logic local.
- Use `zod` validation and current shared Maintain shells.

Suggested route shape
- `GET /work-tasks`
- `GET /work-tasks/:id`
- `GET /manager/work-tasks/new`
- `GET /manager/work-tasks/:id/edit`

Merge-safe ownership
- Ploy owns Work Task CRUD shell, form, list, detail, create, edit, and delete flow.
- Phi owns Work Task assignment actions, assignment history, and department-aware assignee lookup.
- Even though the `WorkTask` response includes assignee fields, assignment UX still belongs to Phi's task.
- Do not touch `/assign`, `/unassign`, or `/assignment-history` in this task.
- Avoid editing manager Repair Request detail TODO actions in this task.

Exact touchpoints
- Create `app/api/types/workTask.types.ts`
- Edit `app/api/types/types.ts`
- Create `app/api/workTasks.api.ts`
- Create `app/services/workTasks.service.ts`
- Create `app/modules/Feature/WorkTasks/`
    - `Create/index.tsx`
    - `Detail/index.tsx`
    - `Edit/index.tsx`
    - `form.tsx`
    - `hooks/helpers.ts`
    - `hooks/useColumns.tsx`
    - `hooks/useFormItem.tsx`
    - `index.tsx`
- Create route wrappers under `app/routes/Main/WorkTasks/` and `app/routes/Manager/WorkTasks/`
- Edit `app/routes.ts`
- Optional only if coordinated later: `app/components/Common/Sidebar/index.tsx`

Files to change
- `app/api/types/types.ts`
- `app/routes.ts`
- new Work Task api, service, module, and route-wrapper files

Acceptance criteria
- Authenticated users can open Work Task list and detail pages.
- Manager-scoped create and edit pages work and reuse the same form component.
- Delete flow follows the shared confirmation pattern.
- The UI treats Work Task as the one task record attached to a single Work Order.
- Related Work Order and upstream Repair Request Item data are displayed with business meaning, not only raw ids.
- No assignment actions are implemented in this task.

What is not in scope
- Work Task assignment, unassignment, or assignment history.
- Work Order Part CRUD.
- Global role-based navigation work.
