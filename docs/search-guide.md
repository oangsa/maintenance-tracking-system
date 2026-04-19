# Search & Filter Guide

All list/search endpoints (`POST /*/search`) accept a shared set of query parameters for filtering, searching, sorting, and pagination. This document explains how to use them correctly in the current frontend.

## Frontend Wiring Pattern

Current list pages usually follow this flow:

- `useFieldFilter()` owns filter metadata, URL param parsing, and `search[]` builders
- `useTableSearchParams()` centralizes page, search, and filter URL state
- `buildOrderBy()` from `app/lib/pageUtils.ts` maps UI sort choices to backend `orderBy` strings
- shared filter keys, labels, and common quick-search fields can live in `app/constants/fieldFilter.constants.ts`
- feature-specific field names can stay in module-local hooks when the endpoint behavior is unique
- `SEARCH_OPERATOR` from `app/constants/searchOperator.constant.ts` should be used instead of repeating raw strings such as `"EQUAL"`

Current repair-request examples:

- the employee list always adds `requester_id EQUAL currentUser.id`
- the manager list filters by `repair_request_items_department_id EQUAL currentUser.departmentId`
- manager detail line items use the separate `/items/search` endpoint and plain item field names such as `department_id`

## Request Body Structure

```json
{
  "pageNumber": 1,
  "pageSize": 10,
  "orderBy": "name asc",
  "deleted": false,
  "search": [...],
  "searchTerm": { "name": "...", "value": "..." }
}
```

## `search` — Precise Field Filter

`search` is an array of condition objects. All conditions are combined with `AND`.

Each condition object:

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | `string` | yes | The database column name to filter on |
| `condition` | `string` | yes | The comparison operator |
| `value` | `string` | yes | The value to compare against. Pass `""` for `ISNULL` and `ISNOTNULL` |

### Conditions

| Condition | SQL equivalent | Notes |
|---|---|---|
| `CONTAINS` | `ILIKE '%value%'` | Case-insensitive substring |
| `STARTWITH` | `ILIKE 'value%'` | Case-insensitive prefix |
| `ENDWITH` | `ILIKE '%value'` | Case-insensitive suffix |
| `EQUAL` | `= value` | Exact match |
| `NOTEQUAL` | `!= value` | |
| `GREATER` | `> value` | Auto-casts to number or date |
| `LESSER` | `< value` | Auto-casts to number or date |
| `GREATEROREQUAL` | `>= value` | Auto-casts to number or date |
| `LESSEROREQUAL` | `<= value` | Auto-casts to number or date |
| `ISNULL` | `IS NULL` | `value` is ignored but must still be sent |
| `ISNOTNULL` | `IS NOT NULL` | `value` is ignored but must still be sent |

### Example

Find all users with role `admin` whose name contains `John`:

```json
{
  "search": [
    { "name": "role", "condition": "EQUAL", "value": "admin" },
    { "name": "name", "condition": "CONTAINS", "value": "John" }
  ]
}
```

## `searchTerm` — Quick Multi-Field Text Search

`searchTerm` is a single object for a simple `ILIKE '%value%'` across one or more fields joined with `OR`.

| Field | Type | Description |
|---|---|---|
| `name` | `string` | Comma-separated list of field names to search across |
| `value` | `string` | The text to search for |

### Example

Search for `Pro` in both `name` and `department_name`:

```json
{
  "searchTerm": {
    "name": "name,department_name",
    "value": "Pro"
  }
}
```

### Difference From `search`

| | `search` | `searchTerm` |
|---|---|---|
| Multiple conditions? | Yes (`AND`) | Yes (`OR`) |
| Condition type | Any supported operator | Always `ILIKE '%value%'` |
| Multiple fields? | One field per object | Comma-separated in `name` |
| Use case | Precise filtering | Quick keyword search |

## How The Server Applies `search` And `searchTerm`

The API evaluates these fields in a predictable order:

1. Every object in `search` is combined with `AND`.
2. Every field listed in `searchTerm.name` is combined with `OR`.
3. If both `search` and `searchTerm` are sent, the final query becomes:

```text
(`search` result) AND (`searchTerm` result)
```

### Practical Meaning

- use `search` when you need exact or structured filtering
- use `searchTerm` when you need one keyword matched across several fields
- use both together when you want a strict filter plus a flexible keyword search

### Behavior Notes

- field names are normalized to lowercase before SQL is built
- `searchTerm` only performs case-insensitive partial matching with `ILIKE '%value%'`
- `searchTerm.name` accepts comma-separated field names and trims spaces around each one
- invalid `condition` values in `search` raise a bad request error
- `GREATER`, `LESSER`, `GREATEROREQUAL`, and `LESSEROREQUAL` try to parse number, date, or boolean values before building SQL

### Execution Example

This request means:

- `role` must equal `employee`
- and either `name` or `email` must contain `john`

```json
{
  "search": [
    { "name": "role", "condition": "EQUAL", "value": "employee" }
  ],
  "searchTerm": {
    "name": "name,email",
    "value": "john"
  }
}
```

## Special Case: Repair Request Item Search

`POST /api/v1/repair-requests/search` supports searching not only repair request header fields, but also joined requested-item fields.

To target requested-item fields, prefix the field name with `repair_request_items_`.

Supported item-search fields:

| Input field name | Meaning |
|---|---|
| `repair_request_items_department_id` | Requested item department numeric ID |
| `repair_request_items_department_code` | Requested item department code |
| `repair_request_items_department_name` | Requested item department name |
| `repair_request_items_product_code` | Requested item product code |
| `repair_request_items_product_name` | Requested item product name |
| `repair_request_items_repair_status_code` | Requested item status code |
| `repair_request_items_repair_status_name` | Requested item status name |
| `repair_request_items_description` | Requested item description |
| `repair_request_items_quantity` | Requested item quantity |

This prefix works in both `search` and `searchTerm`.

Use `repair_request_items_department_code` when filtering by a business code such as `P001`. Use `repair_request_items_department_id` when filtering by the numeric foreign-key ID.

### How Repair Request Item Matching Works

- header-level repair request filters still work normally
- item-level prefixed filters are evaluated in an `EXISTS` subquery
- a repair request is returned when at least one requested item matches the item-side conditions
- if both header fields and item fields are sent, both sides must match
- this also applies to `searchTerm`: header fields are grouped together, item fields are grouped together, and the two groups are combined with `AND`

### Example: Filter By Header Field And Item Field

```json
{
  "pageNumber": 1,
  "pageSize": 10,
  "search": [
    { "name": "priority", "condition": "EQUAL", "value": "urgent" },
    { "name": "repair_request_items_product_name", "condition": "CONTAINS", "value": "motor" }
  ]
}
```

### Example: Combine Header And Item Keyword Search

```json
{
  "pageNumber": 1,
  "pageSize": 10,
  "searchTerm": {
    "name": "request_no,requester_name,repair_request_items_product_name",
    "value": "john"
  }
}
```

## Repair Request Item Detail Search

`POST /api/v1/repair-requests/{id}/items/search` is a different endpoint from `POST /api/v1/repair-requests/search`.

Use it when a detail page needs the actual line items for one repair request instead of filtering repair request headers.

Current frontend usage:

- `app/modules/Feature/employee/RepairRequests/hooks/useLineItem.ts` loads all submitted items for the selected repair request
- `app/modules/Feature/manager/RepairRequests/hooks/useLineItem.ts` loads the same endpoint but adds `department_id EQUAL currentUser.departmentId` so managers only receive their own department's items

Important:

- use plain item field names such as `department_id` on the item-search endpoint
- use `repair_request_items_*` prefixed names only on `POST /api/v1/repair-requests/search`

### Item Detail Search Fields

| Input field name | Response key | Notes |
|---|---|---|
| `id` | `id` | |
| `repair_request_id` | `repairRequestId` | |
| `product_id` | `productId` | |
| `product_code` | `productCode` | |
| `product_name` | `productName` | |
| `description` | `description` | |
| `quantity` | `quantity` | |
| `repair_status_id` | `repairStatusId` | |
| `repair_status_code` | `repairStatusCode` | |
| `repair_status_name` | `repairStatusName` | |
| `department_id` | `departmentId` | |

### Example: Load All Employee Detail Items

```json
{
  "pageNumber": 1,
  "pageSize": 100,
  "orderBy": "id asc",
  "deleted": false
}
```

### Example: Load Manager Detail Items For One Department

```json
{
  "pageNumber": 1,
  "pageSize": 100,
  "orderBy": "id asc",
  "deleted": false,
  "search": [
    { "name": "department_id", "condition": "EQUAL", "value": "7" }
  ]
}
```

## `orderBy`

`orderBy` is a space-separated field and direction, optionally comma-separated for multiple sorts.

```text
"orderBy": "name asc"
"orderBy": "created_at desc"
"orderBy": "order_sequence asc, id desc"
```

Default direction is `ASC` when not specified.

## Field Name Reference

Important:

- the API response uses `camelCase` keys such as `departmentName`
- the `search`, `searchTerm`, and `orderBy` inputs use the flat SQL column name, usually `snake_case`

### Users (`POST /api/v1/users/search`)

| Input field name | Response key | Notes |
|---|---|---|
| `id` | `id` | |
| `name` | `name` | |
| `email` | `email` | |
| `role` | `role` | `admin`, `manager`, `employee` |
| `created_at` | `createdAt` | |
| `updated_at` | `updatedAt` | |
| `created_by` | `createdBy` | |
| `updated_by` | `updatedBy` | |
| `deleted` | _(not returned)_ | Use `deleted: true` instead |
| `department_id` | `departmentId` | |
| `department_name` | `departmentName` | Joined from `department` |
| `department_code` | `departmentCode` | Joined from `department` |

### Departments (`POST /api/v1/department/search`)

| Input field name | Response key | Notes |
|---|---|---|
| `id` | `id` | |
| `code` | `code` | |
| `name` | `name` | |
| `created_at` | `createdAt` | |
| `updated_at` | `updatedAt` | |
| `created_by` | `createdBy` | |
| `updated_by` | `updatedBy` | |

### Products (`POST /api/v1/product/search`)

| Input field name | Response key | Notes |
|---|---|---|
| `id` | `id` | |
| `code` | `code` | |
| `name` | `name` | |
| `product_type_id` | `productTypeId` | |
| `product_type_code` | `productTypeCode` | Joined from `product_type` |
| `product_type_name` | `productTypeName` | Joined from `product_type` |
| `created_at` | `createdAt` | |
| `updated_at` | `updatedAt` | |
| `created_by` | `createdBy` | |
| `updated_by` | `updatedBy` | |

### Repair Statuses (`POST /api/v1/repair-status/search`)

| Input field name | Response key | Notes |
|---|---|---|
| `id` | `id` | |
| `code` | `code` | |
| `name` | `name` | |
| `order_sequence` | `orderSequence` | |
| `is_final` | `isFinal` | `true` or `false` |
| `created_at` | `createdAt` | |
| `updated_at` | `updatedAt` | |
| `created_by` | `createdBy` | |
| `updated_by` | `updatedBy` | |

### Repair Requests (`POST /api/v1/repair-requests/search`)

| Input field name | Response key | Notes |
|---|---|---|
| `id` | `id` | |
| `request_no` | `requestNo` | |
| `requester_id` | `requesterId` | |
| `priority` | `priority` | `low`, `medium`, `high`, `urgent` |
| `requested_at` | `requestedAt` | |
| `current_status_id` | `currentStatusId` | |
| `created_at` | `createdAt` | |
| `updated_at` | `updatedAt` | |
| `created_by` | `createdBy` | |
| `updated_by` | `updatedBy` | |
| `current_status_code` | `currentStatusCode` | Joined repair status |
| `current_status_name` | `currentStatusName` | Joined repair status |
| `requester_email` | `requesterEmail` | Joined users |
| `requester_name` | `requesterName` | Joined users |
| `repair_request_items_department_id` | _(item search only)_ | Requested item department numeric ID |
| `repair_request_items_department_code` | _(item search only)_ | Requested item department code |
| `repair_request_items_department_name` | _(item search only)_ | Requested item department name |
| `repair_request_items_product_code` | _(item search only)_ | Requested item product code |
| `repair_request_items_product_name` | _(item search only)_ | Requested item product name |
| `repair_request_items_repair_status_code` | _(item search only)_ | Requested item status code |
| `repair_request_items_repair_status_name` | _(item search only)_ | Requested item status name |
| `repair_request_items_description` | _(item search only)_ | Requested item description |
| `repair_request_items_quantity` | _(item search only)_ | Requested item quantity |

For additional backend search resources that are not yet wrapped in the current frontend, check `docs/openapi.yaml`.

## Complete Examples

### Find non-final repair statuses ordered by sequence

```json
{
  "pageNumber": 1,
  "pageSize": 20,
  "orderBy": "order_sequence asc",
  "search": [
    { "name": "is_final", "condition": "EQUAL", "value": "false" }
  ]
}
```

### Search products by name or product type name

```json
{
  "pageNumber": 1,
  "pageSize": 10,
  "searchTerm": {
    "name": "name,product_type_name",
    "value": "motor"
  }
}
```

### Find urgent repair requests from a specific requester

```json
{
  "pageNumber": 1,
  "pageSize": 10,
  "orderBy": "requested_at desc",
  "search": [
    { "name": "priority", "condition": "EQUAL", "value": "urgent" },
    { "name": "requester_email", "condition": "EQUAL", "value": "john@example.com" }
  ]
}
```

### Combine `search` and `searchTerm`

Both can be used together. They are combined with `AND`.

```json
{
  "pageNumber": 1,
  "pageSize": 10,
  "search": [
    { "name": "role", "condition": "EQUAL", "value": "employee" }
  ],
  "searchTerm": {
    "name": "name,email",
    "value": "john"
  }
}
```

This finds employees whose name or email contains `john`.
