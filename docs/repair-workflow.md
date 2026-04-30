# Repair Workflow

This document summarizes the current business flow from Repair Request until Work Order Part.

## Main Flow

```text
Repair Request
    ->
Repair Request Item
    ->
Work Order
    ->
Work Task
    ->
Work Task Assignment
    ->
Work Order Part
    ->
Inventory Move Item
```

## Meaning of Each Step

### 1. Repair Request

- This is the request header created by the requester.
- It contains overall request information such as requester, priority, and current status.

### 2. Repair Request Item

- This is the actual requested line item under the Repair Request.
- Department context starts here.
- The Repair Request can have multiple items.

### 3. Work Order

- One Work Order is created from one Repair Request Item.
- Treat Work Order as the execution record for that one item.
- Work Order should always stay clearly linked to its parent Repair Request Item.

## 4. Work Task

- One Work Task belongs to one Work Order.
- Work Task acts as the task description or execution detail for that Work Order.
- It is not a multi-subtask board.

## 5. Work Task Assignment

- `work_task_assignment` is the source of truth for responsibility history.
- It records who is responsible for the Work Task.
- Assignment history is append-only.
- The current active assignee is the row where `unassigned_at` is still empty.
- Reassignment creates a new row and closes the previous active row.

## 6. Work Order Part

- Work Order Part is the part ordering or part usage record inside the Work Order flow.
- This is where the responsible employee records the parts needed or used for the work.
- Work Order Part belongs to the Work Order flow, not directly to the Repair Request header.

## 7. Inventory Move Item

- `inventory_move_item` is the stock source of truth.
- Stock is not stored directly on Part.
- Any real stock increase or decrease must come from inventory transactions.
- `work_order_part.inventory_move_item_id` links the Work Order Part record to the actual stock movement.

## Frontend View Rules

### Employee View

- Employee sees Work Orders assigned to them through the active Work Task Assignment.
- The employee Work Order list should only show Work Orders where the current user is the active assignee.
- When the employee opens a Work Order:
    - show Work Order data
    - show the single Work Task as the work description
    - allow Work Order Part actions inside that detail flow

### Manager View

- Manager sees Work Orders for their department.
- Manager can open Work Order detail and assign the Work Task to a user.
- Assignee selection can use lookup table or LoV behavior.

## Important Rules

- One Repair Request Item -> one Work Order
- One Work Order -> one Work Task
- One Work Task -> many Work Task Assignment history rows over time
- Current assignee = assignment row with `unassigned_at IS NULL`
- Work Order Part can link to one Inventory Move Item for actual stock movement
- Inventory history is the source of truth for stock, not Part master data
