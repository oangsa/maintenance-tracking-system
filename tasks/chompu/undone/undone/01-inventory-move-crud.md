# Task 01: Inventory Move CRUD Frontend

Owner
- Chompu

Main dependency
- This task depends on Phi's Part Master CRUD task for clean Part labels and reusable Part lookup support.

Endpoints in scope
- `POST /api/v1/inventory-move/search`
- `POST /api/v1/inventory-move`
- `GET /api/v1/inventory-move/{id}`
- `DELETE /api/v1/inventory-move/{id}`
- `POST /api/v1/inventory-move/{id}/reverse`
- `DELETE /api/v1/inventory-move/collection`

Why
- Inventory Move is the stock source of truth and it does not exist in the current frontend.
- The backend already models transaction-based line items where each item must use exactly one direction: `quantityIn` or `quantityOut`.
- Manager or above owns the full inventory movement flow.
- Stock correction should follow transaction history rules, not direct stock mutation.

What to implement
- Add manager-scoped Inventory Move list, detail, create, delete, and reverse flows.
- Use `LineItemsEditor` for Inventory Move items instead of inventing a separate grid abstraction.
- Build an Inventory Move create form for transaction entry.
- Add `zod` validation to enforce the transaction rule that each line item chooses exactly one direction.
- Show Part code and Part name in list, detail, and line-item views instead of only `partId`.
- Keep reverse as a clear user action from detail, with confirmation and request payload handling that matches the backend contract.
- In the task wording and UI behavior, treat Inventory Move as transaction history first.
- Prefer explaining reverse or compensating transactions as the normal correction path instead of implying direct stock patching.
- Do not implement in-place edit for Inventory Move records.

Suggested route shape
- `GET /manager/inventory-moves`
- `GET /manager/inventory-moves/new`
- `GET /manager/inventory-moves/:id`

Merge-safe ownership
- Chompu owns the Inventory Move frontend module in this task.
- Phi owns the Part master module and generic Part lookup.
- Do not implement Part stock intent shortcut pages in this task.
- Avoid changing raw shared shadcn primitives.

Exact touchpoints
- Create `app/api/types/inventoryMove.types.ts`
- Edit `app/api/types/types.ts`
- Create `app/api/inventoryMoves.api.ts`
- Create `app/services/inventoryMoves.service.ts`
- Create `app/modules/Feature/InventoryMoves/`
    - `Create/index.tsx`
    - `Detail/index.tsx`
    - `Edit/index.tsx`
    - `form.tsx`
    - `hooks/helpers.ts`
    - `hooks/useColumns.tsx`
    - `hooks/useFormItem.tsx` if useful
    - `index.tsx`
- Create route wrappers under `app/routes/Manager/InventoryMoves/`
- Edit `app/routes.ts`
- Reuse `app/components/Common/LineItemsEditor`
- Reuse generic Part lookup support from Phi's task, or perform Part search locally if the shared lookup is not ready yet

Files to change
- `app/api/types/types.ts`
- `app/routes.ts`
- new Inventory Move api, service, module, and route-wrapper files

Acceptance criteria
- Inventory Move list, detail, create, delete, and reverse flows exist.
- Inventory Move line items use `LineItemsEditor`.
- Validation blocks line items that try to send both `quantityIn` and `quantityOut`, or neither.
- Part labels are shown with business meaning.
- Reverse is a clear and separate user action in the UI.
- The screen copy and flow do not imply that part stock is stored directly on Part or edited outside inventory transactions.
- No Inventory Move edit page or in-place update UX is introduced.

What is not in scope
- Part stock intent shortcut endpoints.
- Inventory Move update UI.
- Generic Part master CRUD.
- Global role-based navigation work.
