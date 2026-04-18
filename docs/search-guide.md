# Search And List Guide

This guide explains how list pages in the current frontend map URL state and table state to the backend `POST */search` contract.

It covers two things:

- the backend request body shape used by search endpoints
- the current frontend pattern used by `Users`, `Departments`, and both repair-request modules

## Current Frontend List Flow

The current list flow is:

1. the route wrapper renders the module `index.tsx`
2. the module reads `useSearchParams()`
3. optional `useFieldFilter()` owns filter metadata, default values, and backend `search[]` mapping
4. `useTableSearchParams()` keeps `page`, `search`, and module filter params in sync with the URL
5. the module defines a local `fetchData(params)` function
6. `fetchData()` maps `DataTable` params to the backend request body
7. the module renders `app/components/Maintain/Table`

Current mapping from `DataTable` fetch params to backend request body:

| DataTable param | Backend request field | Notes |
|---|---|---|
| `params.page` | `pageNumber` | 1-based |
| `params.limit` | `pageSize` | page size |
| `params.sortBy` + `params.sortDir` | `orderBy` | usually via `buildOrderBy()` |
| `params.searchTerm` | `searchTerm.value` | quick text search |
| module search fields | `searchTerm.name` | comma-separated backend fields |
| `params.search` | `search` | structured filters from `useFieldFilter()` |

## Shared Request Body Shape

```json
{
  "pageNumber": 1,
  "pageSize": 10,
  "orderBy": "name asc",
  "deleted": false,
  "search": [
    { "name": "role", "condition": "EQUAL", "value": "employee" }
  ],
  "searchTerm": {
    "name": "name,email",
    "value": "john"
  }
}
```

## URL Parameter Conventions In This Frontend

Current list pages use these URL conventions:

- `page`: current page number
- `search`: quick search text
- `filter*`: module-specific filter params such as `filterRole`, `filterDepartment`, or `filterPriority`

The shared hook `app/components/Maintain/Table/useSearchParams.ts` writes these values back to the URL.

## `search` — Structured Filters

`search` is an array of condition objects. Each object targets one backend field.

| Field | Type | Description |
|---|---|---|
| `name` | `string` | backend field name, usually `snake_case` |
| `condition` | `string` | comparison operator |
| `value` | `string` | value to compare |

Supported operators used by the current project:

| Condition | Meaning |
|---|---|
| `CONTAINS` | case-insensitive substring match |
| `STARTWITH` | case-insensitive prefix match |
| `ENDWITH` | case-insensitive suffix match |
| `EQUAL` | exact match |
| `NOTEQUAL` | not equal |
| `GREATER` | greater than |
| `LESSER` | less than |
| `GREATEROREQUAL` | greater than or equal |
| `LESSEROREQUAL` | less than or equal |
| `ISNULL` | is null |
| `ISNOTNULL` | is not null |

Example:

```json
{
  "search": [
    { "name": "role", "condition": "EQUAL", "value": "manager" },
    { "name": "department_id", "condition": "EQUAL", "value": "2" }
  ]
}
```

## `searchTerm` — Quick Text Search

`searchTerm` is a single object for quick free-text matching across one or more fields.

| Field | Type | Description |
|---|---|---|
| `name` | `string` | comma-separated backend field names |
| `value` | `string` | the search text |

Example:

```json
{
  "searchTerm": {
    "name": "name,email",
    "value": "john"
  }
}
```

## `orderBy`

`orderBy` is a string such as:

```text
name asc
created_at desc
order_sequence asc, id desc
```

The frontend normally builds this with `buildOrderBy(sortBy, sortDir, fallback)` from `app/lib/pageUtils.ts`.

## How `search` And `searchTerm` Combine

The backend applies them in this shape:

```text
(`search` conditions joined by AND) AND (`searchTerm` fields joined by OR)
```

Practical meaning:

- use `search` for exact or structured filters
- use `searchTerm` for a single keyword across several fields
- use both when you need strict filters plus flexible quick search

## Current Project Patterns

### Users

- endpoint: `POST /api/v1/users/search`
- quick search fields: `name,email`
- advanced filters: `role`, `department_id`
- current URL filter params: `filterRole`, `filterDepartment`

### Departments

- endpoint: `POST /api/v1/department/search`
- quick search fields: `code,name`
- no advanced filter hook today

### Employee Repair Requests

- endpoint: `POST /api/v1/repair-requests/search`
- quick search fields: `request_no`
- current advanced filter: `priority`
- module always adds `requester_id EQUAL currentUser.id` to the structured filters

### Manager Repair Requests

- endpoint: `POST /api/v1/repair-requests/search`
- quick search fields: `request_no,requester_name`
- current advanced filter: `priority`

### Product Lookup

- endpoint: `POST /api/v1/product/search`
- quick search fields: `code,name`
- exact code resolution in the repair-request form uses `search` with `EQUAL`

### Repair Status Lookup

- endpoint: `POST /api/v1/repair-status/search`
- current create flow orders by `order_sequence asc` to resolve the initial status

## Current Endpoint Reference

| Resource | Search endpoint |
|---|---|
| Users | `POST /api/v1/users/search` |
| Departments | `POST /api/v1/department/search` |
| Products | `POST /api/v1/product/search` |
| Repair statuses | `POST /api/v1/repair-status/search` |
| Repair requests | `POST /api/v1/repair-requests/search` |
| Repair request items | `POST /api/v1/repair-requests/{id}/items/search` |

## Field Name Reference

Important:

- API responses use `camelCase`
- `search`, `searchTerm.name`, and `orderBy` use backend field names, usually `snake_case`

### Users

| Input field name | Response key | Notes |
|---|---|---|
| `id` | `id` | |
| `name` | `name` | |
| `email` | `email` | |
| `role` | `role` | `admin`, `manager`, `employee` |
| `department_id` | `departmentId` | |
| `department_code` | `departmentCode` | joined field |
| `department_name` | `departmentName` | joined field |
| `created_at` | `createdAt` | |
| `updated_at` | `updatedAt` | |
| `created_by` | `createdBy` | |
| `updated_by` | `updatedBy` | |

### Departments

| Input field name | Response key | Notes |
|---|---|---|
| `id` | `id` | |
| `code` | `code` | |
| `name` | `name` | |
| `created_at` | `createdAt` | |
| `updated_at` | `updatedAt` | |
| `created_by` | `createdBy` | |
| `updated_by` | `updatedBy` | |

### Products

| Input field name | Response key | Notes |
|---|---|---|
| `id` | `id` | |
| `code` | `code` | |
| `name` | `name` | |
| `product_type_id` | `productTypeId` | |
| `product_type_code` | `productTypeCode` | joined field |
| `product_type_name` | `productTypeName` | joined field |
| `created_at` | `createdAt` | |
| `updated_at` | `updatedAt` | |
| `created_by` | `createdBy` | |
| `updated_by` | `updatedBy` | |

### Repair Statuses

| Input field name | Response key | Notes |
|---|---|---|
| `id` | `id` | |
| `code` | `code` | |
| `name` | `name` | |
| `order_sequence` | `orderSequence` | |
| `is_final` | `isFinal` | boolean |
| `created_at` | `createdAt` | |
| `updated_at` | `updatedAt` | |
| `created_by` | `createdBy` | |
| `updated_by` | `updatedBy` | |

### Repair Requests

| Input field name | Response key | Notes |
|---|---|---|
| `id` | `id` | |
| `request_no` | `requestNo` | |
| `requester_id` | `requesterId` | |
| `requester_name` | `requesterName` | joined field |
| `requester_email` | `requesterEmail` | joined field |
| `priority` | `priority` | `low`, `medium`, `high`, `urgent` |
| `requested_at` | `requestedAt` | |
| `current_status_id` | `currentStatusId` | |
| `current_status_code` | `currentStatusCode` | joined field |
| `current_status_name` | `currentStatusName` | joined field |
| `created_at` | `createdAt` | |
| `updated_at` | `updatedAt` | |
| `created_by` | `createdBy` | |
| `updated_by` | `updatedBy` | |

### Repair Request Items

Use the dedicated endpoint `POST /api/v1/repair-requests/{id}/items/search` when you need paginated or filtered item lists.

| Input field name | Response key | Notes |
|---|---|---|
| `id` | `id` | |
| `repair_request_id` | `repairRequestId` | |
| `product_id` | `productId` | |
| `product_code` | `productCode` | |
| `product_name` | `productName` | |
| `description` | `description` | |
| `quantity` | `quantity` | |
| `repair_status_id` | `repairStatusId` | nullable |
| `repair_status_code` | `repairStatusCode` | nullable |
| `repair_status_name` | `repairStatusName` | nullable |
| `department_id` | `departmentId` | |

## Current Recommendation For Repair Request Item Search

For new frontend work:

- use `GET /api/v1/repair-requests/{id}` when the detail payload already includes the items you need
- use `POST /api/v1/repair-requests/{id}/items/search` when the item list needs pagination, filtering, or independent searching
- do not build new frontend code around the older mixed header-plus-item search pattern unless the backend contract explicitly requires it
