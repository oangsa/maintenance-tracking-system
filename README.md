# Maintainance Tracking System Frontend

Frontend application for the Maintenance Tracking System project.

## Current Scope

The current route surface includes:

- `/`: authenticated home page
- `/auth/login`: login screen
- `/repair-requests/*`: employee repair request list, create, and detail
- `/manager/repair-requests/*`: manager repair request list and detail
- `/master/users/*`: user CRUD
- `/master/departments/*`: department CRUD
- `/test`: lightweight sandbox route currently kept for manual UI checks

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
- `app/root.tsx` initializes auth, global providers, and wraps the route outlet in `app/providers/UserProvider.tsx`
- `app/routes/layout.tsx` maps the authenticated shell to `app/layouts/LayoutMain.tsx`
- route wrapper files live in `app/routes/` and stay thin
- feature page logic lives in `app/modules/`
- employee repair-request pages live in `app/modules/Feature/employee/RepairRequests/`
- manager repair-request pages live in `app/modules/Feature/manager/RepairRequests/`
- shared repair-request line-item helpers live in `app/modules/Feature/RepairRequests/`
- shared CRUD page wrappers live in `app/components/Maintain/`
- shared config-driven form rendering lives in `app/components/Common/Form/`
- shared tables, detail sections, pickers, and line-item components live in `app/components/Common/`
- shared form and filter metadata lives in `app/constants/`
- reusable zod schemas live in `app/schemas/`
- raw backend requests live in `app/api/`
- UI-facing request helpers live in `app/services/`

## Current Reference Modules

- full CRUD reference: `app/modules/Master/Users`
- simpler CRUD reference: `app/modules/Master/Departments`
- employee repair request reference: `app/modules/Feature/employee/RepairRequests`
- manager repair request reference: `app/modules/Feature/manager/RepairRequests`
- shared repair request detail column reference: `app/modules/Feature/RepairRequests/detailLineItemColumns.tsx`

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
- route-wired modules should follow the nested `Create/index.tsx`, `Edit/index.tsx`, `Detail/index.tsx`, `form.tsx`, and `hooks/` layout
- some feature folders still contain legacy flat files such as `Create.tsx` or `Detail.tsx`; do not copy those for new work
- config-driven forms should use `app/components/Common/Form`, module-local `hooks/useFormItem.ts(x)`, and schemas from `app/schemas/`
- shared list filter metadata should live in `app/constants/fieldFilter.constants.ts` when the same labels or field names are reused
- detail pages that load secondary item collections should keep that request logic in module-local `hooks/useLineItem.ts`
- shared Maintain components should stay generic; keep API loaders and mutations in the module files and pass them through props
