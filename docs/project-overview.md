# Main Project Overview

This document describes the main frontend project in `maintainance-tracking-system`, its current folder structure, and how the application is organized.

## Purpose

The main project is the TypeScript frontend for the Maintainance Tracking System. It uses React Router for route composition, a shared API layer for backend communication, shadcn-based UI primitives, and module folders to keep each CRUD area self-contained.

## Current Project Structure

```text
maintainance-tracking-system/
|-- app/
|   |-- api/
|   |   |-- http.ts
|   |   |-- auth.api.ts
|   |   |-- departments.api.ts
|   |   |-- users.api.ts
|   |   `-- types/
|   |-- components/
|   |   |-- Common/
|   |   `-- ui/
|   |-- constants/
|   |-- hooks/
|   |-- layouts/
|   |   `-- LayoutMain.tsx
|   |-- lib/
|   |   `-- pageUtils.ts
|   |-- modules/
|   |   |-- Master/
|   |   |   `-- Users/
|   |   `-- auth/
|   |-- routes/
|   |   `-- Master/
|   |       `-- Users/
|   |-- services/
|   |   |-- auth.service.ts
|   |   |-- departments.service.ts
|   |   `-- users.service.ts
|   |-- app.css
|   |-- root.tsx
|   `-- routes.ts
|-- docs/
|   |-- crud-guide.md
|   |-- openapi.yaml
|   |-- project-overview.md
|   `-- search-guide.md
|-- public/
|-- components.json
|-- package.json
|-- react-router.config.ts
|-- tsconfig.json
`-- vite.config.ts
```

## Layer Responsibilities

### `app/root.tsx`

- Application root.
- Loads global styles.
- Starts shared providers.
- Initializes auth service.

### `app/routes.ts`

- Central route definition file.
- Maps URL paths to route wrapper files.
- Keeps route registration separate from module implementation.

### `app/routes/`

- Thin route wrappers only.
- Each route file should import a module page and return it.
- Do not place business logic here.

### `app/layouts/`

- Shared application shells.
- `LayoutMain.tsx` handles authenticated layout, sidebar, header, and current-user display.

### `app/modules/`

- Feature folders.
- Each CRUD area should live in its own module folder.
- The current reference implementation is `app/modules/Master/Users`.

Recommended module shape:

```text
app/modules/Master/Entity/
|-- index.tsx
|-- Create.tsx
|-- Edit.tsx
|-- Detail.tsx
|-- Manage.tsx
|-- EntityForm.tsx
|-- useColumns.tsx
|-- useFieldFilter.ts
`-- helpers.ts
```

### `app/components/Common/`

- Reusable application-level components.
- Important shared pieces already in use:
  - `DataTable` for paginated list pages.
  - `ListPickerModal` for lookup relationships.
  - `Modal` and `ConfirmModal` for confirmations.
  - `Loading` for loading states.

### `app/components/ui/`

- Raw shadcn UI primitives.
- Treat these as base components.
- Do not rewrite them for feature-specific behavior.

### `app/api/`

- Raw backend request layer.
- One file per backend resource.
- Uses shared `http()` and `httpPaginated()` helpers.
- Should stay close to backend endpoints and request/response contracts.

### `app/services/`

- Thin orchestration layer on top of `app/api/`.
- Modules should import services, not raw HTTP helpers.
- Good place for request composition and UI-facing helper functions.

### `app/api/types/` and `app/api/types.ts`

- Shared API types and barrel exports.
- Add new entity contracts here before wiring new CRUD pages.

### `app/lib/`

- Shared frontend helpers.
- `pageUtils.ts` currently contains shared list URL and sorting utilities.

### `docs/`

- Main project reference material.
- Use this folder for internal implementation guides and API interaction notes.

## Current Implemented Feature Flow

The `Users` module is the best reference for new CRUD work.

### List flow

- Route file renders `UsersListPage`.
- `index.tsx` reads URL params and passes them into `DataTable`.
- `useFieldFilter.ts` owns filter config and API filter mapping.
- `useColumns.tsx` owns table column definitions.
- `users.service.ts` calls `users.api.ts`.
- `users.api.ts` calls `httpPaginated()` for `/api/v1/users/search`.

### Create and edit flow

- `Create.tsx` and `Edit.tsx` are thin wrappers.
- Both render `Manage.tsx` with a mode flag.
- `Manage.tsx` loads data for edit mode and submits create or update requests.
- `UserForm.tsx` owns form state, zod validation, and lookup UI.

### Detail flow

- `Detail.tsx` loads a single record.
- Provides read-only display and delete action.

## Important Conventions

- Build the main project in TypeScript even if references are in JavaScript.
- Use interfaces for component props.
- Prefer shared components before creating a new abstraction.
- Use `search` for structured filters and `searchTerm` for free-text search.
- Keep backend field mapping near the module, not inside shared table code.
- Prefer the `useFieldFilter` pattern for advanced list filters.
- Show meaningful business fields like code and name rather than internal ids where possible.

## Where To Look First

- Start with `app/modules/Master/Users` when adding a new CRUD feature.
- Use `docs/search-guide.md` when building list filters or quick search.
- Use `docs/openapi.yaml` when matching backend payloads and endpoints.
