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
- shared config-driven form rendering lives in `app/components/Common/Form/`
- shared table, detail, picker, and line-item components live in `app/components/Common/`
- shared form and filter metadata lives in `app/constants/`
- raw backend requests live in `app/api/`
- UI-facing request helpers live in `app/services/`

Current feature references:

- full CRUD reference: `app/modules/Master/Users`
- simpler CRUD reference: `app/modules/Master/Departments`
- line-item create/detail reference: `app/modules/Feature/RepairRequestForEmployee`
- read-only list/detail reference: `app/modules/Feature/RepairRequestForManager`
- detail line-item hook references: `app/modules/Feature/RepairRequestForEmployee/hooks/useLineItem.ts` and `app/modules/Feature/RepairRequestForManager/hooks/useLineItem.ts`

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
- config-driven forms should use `app/components/Common/Form`, module-local `hooks/useFormItem.ts(x)`, and shared metadata from `app/constants/formItem.constants.ts`
- shared list filter metadata should live in `app/constants/fieldFilter.constants.ts`
- detail pages that load secondary item collections should keep that request logic in module-local `hooks/useLineItem.ts`
- shared Maintain components should stay generic; keep API loaders and mutations in the module files and pass them through props
