# Plant Lab Laboratory — Inventory Frontend

Production-grade React + TypeScript frontend for the Plant Lab Laboratory inventory management system. Pairs with the Laravel backend in `../backend/` (Core + Inventory modules).

## Stack

- **Build:** Vite 7 + SWC
- **UI:** React 18 + TypeScript (strict)
- **Components:** shadcn-ui (Radix primitives) + Tailwind CSS
- **Data:** TanStack Query 5 + Axios (proxied to Laravel at `/api`)
- **Routing:** React Router 6 (lazy-loaded routes)
- **Forms:** React Hook Form + Zod
- **Charts:** Recharts
- **Tables:** TanStack Table 8 + Virtual

## Scope

This project covers the inventory management surface only:

- Plant species, plant stock, varieties, and samples
- Chemicals (with batches & expiry tracking)
- Equipment (with maintenance records)
- Transactions & borrow records
- User management, achievements, documents, activity log
- Reports (inventory, chemical usage, expired items, borrowed items, user activity)
- Role & permission administration

Earlier features for Business (clients/contracts/payments/lab services) and Research (experiments/protocols/lab notebooks/growth analysis) have been removed since the backend does not implement them.

## Project layout

```
src/
  app/             # Application shell — router only
  components/ui/   # shadcn primitives
  core/            # Cross-cutting infrastructure
    api/           # Axios client, TanStack Query setup, query keys
    auth/          # AuthContext, ProtectedRoute, PermissionGate
    layouts/       # AppLayout, Sidebar, TopNav, MobileBottomNav
    theme/         # Theme provider & tokens
  features/
    admin/         # Role / Permission / Activity Log management
    inventory/     # Plants, chemicals, equipment, transactions, etc.
    reports/       # Inventory analytics reports
  shared/          # Reusable components, hooks, types, utilities
  hooks/           # use-mobile, use-toast
  lib/             # shadcn `cn()` helper
  pages/           # NotFound only
  styles/          # Global styles
```

## Getting started

```bash
npm install
npm run dev          # http://localhost:8081 (proxies /api → http://127.0.0.1:8000)
```

Make sure the Laravel backend is running on port 8000 (`php artisan serve` in `../backend/`).

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build |
| `npm run build:dev` | Dev-mode build |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint |
| `npm run lint:a11y` | Targeted accessibility lint |
| `npm test` | Vitest |
| `npm run test:watch` | Vitest watch mode |
| `npm run generate` | Scaffold a component |

## Environment

Copy `.env.example` to `.env` and adjust if needed. The dev proxy in `vite.config.ts` forwards `/api` to `http://127.0.0.1:8000`.

## Backend alignment

| Frontend area | Backend module |
|---|---|
| `core/auth/` | `Modules/Core/` (Sanctum auth, roles, permissions, policies) |
| `features/admin/` | `Modules/Core/` (roles, permissions, activity log) |
| `features/inventory/` | `Modules/Inventory/` (plants, chemicals, equipment, transactions, borrow records) |
| `features/reports/` | `Modules/Inventory/Controllers/ReportController` + `Inventory/Services/Reports/*` |

All snake_case API payloads pass through `shared/lib/api-mappers.ts` for camelCase conversion before reaching the UI.
