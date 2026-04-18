# Maintainance Tracking System Frontend

Frontend application for the main Maintenance Tracking System project.

## Current Scope

The current frontend includes these route groups and features:

- `auth/login`: login screen
- `repair-requests/*`: employee repair request list, create, and detail
- `manager/repair-requests/*`: manager repair request list and detail
- `master/users/*`: user CRUD
- `master/departments/*`: department CRUD

## Stack

- Bun runtime
- React 19
- React Router 7
- TypeScript
- Tailwind CSS
- shadcn/ui components
- zod validation

## Architecture At A Glance

- route registration lives in `app/routes.ts`
- route wrapper files live in `app/routes/` and stay thin
- feature page logic lives in `app/modules/`
- shared CRUD page wrappers live in `app/components/Maintain/`
- shared table, detail, picker, and line-item components live in `app/components/Common/`
- raw backend requests live in `app/api/`
- UI-facing request helpers live in `app/services/`

Current feature references:

- full CRUD reference: `app/modules/Master/Users`
- simpler CRUD reference: `app/modules/Master/Departments`
- line-item create/detail reference: `app/modules/Feature/RepairRequestForEmployee`
- read-only list/detail reference: `app/modules/Feature/RepairRequestForManager`

## Project Guides

- project overview and file structure: [docs/project-overview.md](./docs/project-overview.md)
- CRUD implementation guide: [docs/crud-guide.md](./docs/crud-guide.md)
- search and list integration guide: [docs/search-guide.md](./docs/search-guide.md)
- backend contract source: [docs/openapi.yaml](./docs/openapi.yaml)

## Development

```bash
bun install
bun run dev
```

The local development server runs on `http://localhost:5173` by default.

## Validation

```bash
bun run typecheck
bun run build
```

## Production Preview

```bash
bun run start
```

## Notes

- use the `~/` alias for project imports
- new module work should follow the nested `Create/index.tsx`, `Edit/index.tsx`, `Detail/index.tsx`, `form.tsx`, and `hooks/` layout
- shared Maintain components should stay generic; keep API loaders and mutations in the module files and pass them through props
