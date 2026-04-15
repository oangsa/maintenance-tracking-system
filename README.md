# Maintainance Tracking System Frontend

Frontend application for the main Maintainance Tracking System project.

## Stack

- Bun runtime
- React 19
- React Router 7
- TypeScript
- Tailwind CSS
- shadcn/ui components
- zod validation

## Main References

- Project overview and file structure: [docs/project-overview.md](./docs/project-overview.md)
- CRUD implementation guide: [docs/crud-guide.md](./docs/crud-guide.md)
- Search request contract: [docs/search-guide.md](./docs/search-guide.md)
- Backend contract source: [docs/openapi.yaml](./docs/openapi.yaml)

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
