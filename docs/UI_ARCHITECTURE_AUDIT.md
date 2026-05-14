# UI Architecture Audit — Full System Analysis & Refactor Blueprint

**Date:** March 4, 2026  
**Auditor Role:** Senior UI/UX Architect, Design System Engineer, Frontend Performance Specialist  
**Scope:** Entire inventory module frontend — 30+ pages, all shared components, design tokens, layout system, Tailwind config, CSS custom properties  
**Source Audit:** `UI_AUDIT_INVENTORY.md` (30 documented flaws) + full codebase structural analysis

---

## 1. Executive Summary

### UI Maturity Score: 4.2 / 10

The system is split into two incompatible architectural generations. The "modern" tier (≈12 pages) demonstrates competent component-driven architecture with hooks, config-driven renderers, and shared abstractions. The "legacy" tier (≈12 pages + 6 reports) was built with ad-hoc inline state, inconsistent styling, missing UI states, and zero reuse of established patterns. The result is a product that looks like two different applications stitched together.

| Dimension                      | Score    | Assessment                                                                                                       |
| ------------------------------ | -------- | ---------------------------------------------------------------------------------------------------------------- |
| **Overall UI Maturity**        | 4.2 / 10 | Two-tier system with no governance                                                                               |
| **UX Consistency**             | 3.0 / 10 | 4 loading patterns, 4 error patterns, 3 table wrappers, 3 search layouts                                         |
| **Design System Completeness** | 5.0 / 10 | Tokens exist but are not enforced; CSS has 200+ custom utility classes that bypass Tailwind                      |
| **Responsive Quality**         | 3.5 / 10 | Tables overflow on mobile; cards with forced `aspect-square`; dashboard requires 1280px for columns              |
| **Accessibility (WCAG 2.2)**   | 3.0 / 10 | Missing aria-labels, non-focusable interactive cards, no skip-link in legacy pages, no focus trapping in dialogs |
| **Scalability**                | 4.0 / 10 | Modern tier is extensible; legacy tier requires full rewrite to scale                                            |
| **Performance (UI layer)**     | 5.5 / 10 | No skeleton loaders, premature empty states flash, no virtualization on long lists                               |
| **Technical Debt**             | High     | 2 fully non-functional pages, 1 page rendering raw JSON, unused shared `<Pagination>` component                  |

### Main Systemic Weaknesses

1. **No component governance** — Shared components exist (`EmptyState`, `LoadingState`, `Pagination`, `SearchFilter`, `PageHeader`) but nothing enforces their use. Legacy pages ignore them.
2. **Two incompatible page architectures** — Modern pages use `useXxxView()` hook pattern with zero inline state. Legacy pages use raw `useState` + `useForm` + inline mutations.
3. **CSS bloat** — `index.css` contains 850+ lines of custom `@layer components` utilities (`.minimal-card`, `.data-table`, `.status-pill`, `.icon-badge-*`, `.minimal-badge-*`) that duplicate what Tailwind already provides and are inconsistently used.
4. **No view-state machine** — Each page implements its own `isLoading && / isError && / !hasResults &&` chain, leading to race conditions (FLAW-23: empty state appears during loading).
5. **Responsive strategy is breakpoint-last** — Dashboard needs `xl` (1280px) for 2-col. Tables have no `overflow-x-auto`. Cards enforce `aspect-square` on all viewports.

### Risk Level: **HIGH**

Every new page added to the system will either follow the modern pattern (if the developer reads the right examples) or fall into the legacy pattern (if they copy the wrong examples). Without governance, entropy will increase faster than feature velocity.

---

## 2. Root Cause Analysis

### RCA-01 · Component State Architecture Divergence

| Attribute             | Detail                                                                                                                                                                                                                                 |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Category**          | State Management / Architecture                                                                                                                                                                                                        |
| **Root Cause**        | Two different developers (or two different phases) built pages with different philosophies. Modern pages extract all state into `useXxxView()` custom hooks. Legacy pages inline `useState`, `useForm`, `useQuery` mutations directly. |
| **Impact**            | Critical — makes maintenance unpredictable; new developers don't know which pattern to follow                                                                                                                                          |
| **Architectural Why** | No Architecture Decision Record (ADR) exists. No linter rule enforces hook extraction. No template/generator scaffolds new pages.                                                                                                      |

**Affected Flaws:** FLAW-01, FLAW-02

---

### RCA-02 · Missing View State Machine

| Attribute             | Detail                                                                                                                                                                                         |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Category**          | State Management / UX                                                                                                                                                                          |
| **Root Cause**        | Each page independently chains conditional rendering: `isLoading ? ... : isError ? ... : !hasResults ? ... : <Content>`. Some pages omit one or more states. Some check states in wrong order. |
| **Impact**            | High — users see "No results found" during loading (FLAW-23), see empty table on API failure (FLAW-12), get no feedback at all on some pages                                                   |
| **Architectural Why** | No `<AsyncContent>` or `<QueryBoundary>` wrapper component exists to standardize the `loading → error → empty → data` state machine. Each page hand-codes it.                                  |

**Affected Flaws:** FLAW-11, FLAW-12, FLAW-13, FLAW-22, FLAW-23

---

### RCA-03 · Component API Polymorphism Without Constraint

| Attribute             | Detail                                                                                                                                                                                                                                             |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Category**          | Components / Design Consistency                                                                                                                                                                                                                    |
| **Root Cause**        | `PageHeader` accepts both `icon={Wrench}` (component ref) and `icon={<Wrench className="h-6 w-6" />}` (JSX element) via runtime detection. Also accepts `description` OR `subtitle`. This flexibility means every caller uses a different variant. |
| **Impact**            | High — page headers render at different sizes (20px vs 24px icons), different alignment, different spacing. The component appears polymorphic but is actually uncontrolled.                                                                        |
| **Architectural Why** | Component was designed for backward compatibility instead of migration. The "legacy" API should have been deprecated and removed, not kept alongside the new API.                                                                                  |

**Affected Flaws:** FLAW-10, FLAW-17

---

### RCA-04 · CSS Architecture Split (Tailwind vs Custom Utilities)

| Attribute             | Detail                                                                                                                                                                                                                                                                                                                 |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Category**          | Layout / Styling / Performance                                                                                                                                                                                                                                                                                         |
| **Root Cause**        | `index.css` defines 200+ custom utility classes (`.minimal-card`, `.data-table`, `.status-pill`, `.icon-badge-*`, `.minimal-badge-*`, `.minimal-input`, `.section-header`, `.empty-state`). Many duplicate existing Tailwind utilities or shadcn/ui components. Some are used by 1–2 pages. Others aren't used at all. |
| **Impact**            | Medium — CSS bundle bloat, naming confusion (is the canonical card `.minimal-card` or `Card` from shadcn?), developers unsure which system to use                                                                                                                                                                      |
| **Architectural Why** | The CSS layer was written as a "design system" attempt before shadcn/ui components were adopted. Neither system was deprecated. They now coexist, creating a dual-source-of-truth.                                                                                                                                     |

**Affected Flaws:** FLAW-14 (3 table wrapper patterns), FLAW-18 (4 button size patterns)

---

### RCA-05 · Responsive Strategy: Desktop-First With Insufficient Breakpoints

| Attribute             | Detail                                                                                                                                                            |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Category**          | Responsiveness / Layout                                                                                                                                           |
| **Root Cause**        | Grid layouts jump from `grid-cols-1` directly to `xl:grid-cols-2` (1280px). Tables have no responsive column strategy. Cards enforce `aspect-square` universally. |
| **Impact**            | High — entire tablet range (768px–1279px) gets the mobile layout. Tables overflow. Cards are excessively tall on phones.                                          |
| **Architectural Why** | No mobile-first design spec. No defined breakpoint strategy document. Developers default to desktop-first and add mobile breakpoints reactively.                  |

**Affected Flaws:** FLAW-05, FLAW-06, FLAW-07, FLAW-08, FLAW-09

---

### RCA-06 · Abandoned Shared Components

| Attribute             | Detail                                                                                                                                                                                                                                                                                                                                 |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Category**          | Components / Consistency                                                                                                                                                                                                                                                                                                               |
| **Root Cause**        | Shared `<Pagination>` component with `usePagination` hook exists and is fully implemented. Zero pages use it. Shared `<LoadingState>` with skeleton/spinner/text variants exists. One page uses it. Shared `<Skeletons>` with `CardSkeleton`, `TableSkeleton`, `DashboardSkeleton` exist. Zero pages use them in the inventory module. |
| **Impact**            | High — well-built infrastructure goes unused while every page reinvents the wheel                                                                                                                                                                                                                                                      |
| **Architectural Why** | Components were built speculatively without enforcing adoption. No PR review checklist requires their use. No linter rule flags inline alternatives.                                                                                                                                                                                   |

**Affected Flaws:** FLAW-11, FLAW-16, FLAW-22

---

### RCA-07 · Missing Data Formatting Layer

| Attribute             | Detail                                                                                                                                                                                                                                                                           |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Category**          | Components / Data Display                                                                                                                                                                                                                                                        |
| **Root Cause**        | Modern pages define per-page formatting helpers (`formatDisplayDate`, `formatEnumLabel`, `formatDate`, `formatTimestamp`). These are not shared — they're defined inside each `useXxxView.ts` file. Legacy pages don't format at all, rendering raw ISO strings and enum values. |
| **Impact**            | Medium — dates appear as `2025-03-15T10:00:00.000000Z` on some pages, `Mar 15, 2025` on others. Enum values appear as `transaction_count` on some pages, `Transaction Count` on others.                                                                                          |
| **Architectural Why** | No global formatting utility library exists (no `@/lib/formatters`). Each hook file reinvents formatting. Legacy pages skip it entirely.                                                                                                                                         |

**Affected Flaws:** FLAW-19, FLAW-20, FLAW-03

---

### RCA-08 · No Navigation Graph for Secondary Pages

| Attribute             | Detail                                                                                                                                                                                                                                         |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Category**          | Navigation / UX                                                                                                                                                                                                                                |
| **Root Cause**        | Detail pages use the `DetailLayout` framework which provides back navigation. Standalone secondary pages (MaintenanceRecords, ChemicalBatches, OverdueBorrows, PendingApprovals, etc.) have no concept of "parent page" or breadcrumb context. |
| **Impact**            | High — 11 pages are navigation dead-ends. Users must use browser back or sidebar.                                                                                                                                                              |
| **Architectural Why** | No route-level breadcrumb config exists. No `<SecondaryPageLayout>` wrapper provides consistent back navigation. The `DetailLayout` pattern was built only for entity detail pages, not for general secondary pages.                           |

**Affected Flaws:** FLAW-21, FLAW-25, FLAW-26

---

### RCA-09 · Accessibility as Afterthought

| Attribute             | Detail                                                                                                                                                                                                                                    |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Category**          | Accessibility                                                                                                                                                                                                                             |
| **Root Cause**        | The `ProductCard` component correctly implements `role="button"`, `tabIndex={0}`, and keyboard event handling. But this pattern was never propagated to other clickable surfaces (report dashboard cards, table rows, icon-only buttons). |
| **Impact**            | Medium — keyboard-only and screen reader users cannot navigate report cards, cannot identify icon-only action buttons, cannot operate some interactive elements                                                                           |
| **Architectural Why** | No accessibility linting (`eslint-plugin-jsx-a11y`) is configured. No accessibility review gate exists in PR workflow. The `ProductCard` implementation was a one-off effort, not a system-wide standard.                                 |

**Affected Flaws:** FLAW-27, FLAW-29

---

## 3. Design System Gaps

### 3.1 Missing Tokens

| Token Category       | Current State                                                                                                                 | Gap                                                                                                                                                                                                         |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Spacing scale**    | Tailwind default + 2 custom values (`18: 4.5rem`, `22: 5.5rem`). CSS also defines `--spacing: 0.25rem` but it's not used.     | No semantic spacing tokens (e.g., `page-padding`, `section-gap`, `card-padding`, `table-cell-padding`). Pages use arbitrary values: `p-4`, `p-5`, `p-6`, `py-2`, `py-3` across components.                  |
| **Color semantics**  | Good foundation: `primary`, `secondary`, `destructive`, `warning`, `success`, `muted` with foregrounds. Chart colors defined. | Missing: `info` semantic color. Status badge colors are hardcoded per-page (e.g., `STATUS_COLORS` map in `usePlantSamplesView`, `statusBadgeClass` in `useEquipmentView`). No unified status palette token. |
| **Typography scale** | Well-defined in Tailwind config: `xs` through `4xl` with line-heights and letter-spacing. Base set to 14px.                   | Scale is defined but not enforced. Dashboard uses `text-3xl` while all other pages use `text-2xl` for h1. No `display` or `caption` categories.                                                             |
| **Border radius**    | Full scale defined: `sm(4px)` → `full(9999px)`.                                                                               | Pages mix `rounded-lg`, `rounded-xl`, `rounded-2xl` without semantic meaning. Cards use `rounded-xl`, some table wrappers use `rounded-lg`, others use `rounded-xl`.                                        |
| **Shadows**          | Comprehensive: 8 levels from `2xs` to `2xl` + `hover`.                                                                        | Well-defined but inconsistently applied. Cards use `shadow-md hover:shadow-lg`. Some elements use no shadow. No rules on which depth = which elevation level.                                               |
| **Transitions**      | `--transition-snap` and `--transition-duration: 150ms` defined.                                                               | Transition tokens exist but aren't used by Tailwind classes. Pages use inline `transition-all`, `transition-shadow`, `transition-colors` with default Tailwind durations, not the custom token.             |

### 3.2 Inconsistent Component Variants

| Component          | Variants That Exist                                                                                                                        | Gap                                                                                                                 |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| **PageHeader**     | Two incompatible APIs (icon-as-component vs icon-as-JSX, description vs subtitle). Dashboard has its own local copy with different sizing. | Must consolidate to single API. Remove legacy JSX-element icon support.                                             |
| **Table Wrapper**  | Three patterns: `rounded-xl overflow-hidden border-border/40`, `border rounded-lg overflow-hidden`, `mt-6 rounded-lg border`.              | Must be a single `<DataTableWrapper>` component.                                                                    |
| **Action Buttons** | Four size patterns: `h-7 w-7 p-0`, `h-7 w-7` (size="icon"), `h-9 w-9 p-0`, default `h-10 w-10`.                                            | Must define `size="icon-sm"` (28px) and `size="icon"` (36px) as the only two options.                               |
| **Status Badges**  | CSS `.status-pill` + `.status-seed/seedling/growing/harvested/failed`. Plus inline Tailwind badges. Plus `<Badge>` from shadcn.            | Must use only `<Badge variant="...">`. Remove all `.status-*` CSS classes.                                          |
| **Cards**          | `<Card>` from shadcn, `<ProductCard>` custom, `.minimal-card` CSS class, `.minimal-card-bordered`, `.minimal-card-accent`.                 | Must use only `<Card>` and `<ProductCard>`. Remove all `.minimal-card-*` CSS classes or extract into Card variants. |

### 3.3 Missing UI States

| State                    | Coverage                                                                                                                                 | Gap                                                                                                                                                                 |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Loading (page-level)** | `<LoadingState>` exists but used by 1/24 pages. `<CardSkeleton>`, `<TableSkeleton>`, `<DashboardSkeleton>` exist but used by 0/24 pages. | Must enforce: every page wraps async content in `<AsyncContent>` which renders skeletons during load.                                                               |
| **Loading (inline)**     | Dialog submit buttons show "Saving…" / "Approving…" text on some pages, nothing on others.                                               | Must standardize: all mutation buttons show spinner + disabled state during pending.                                                                                |
| **Error (page-level)**   | Four different patterns exist. Some pages show nothing on error.                                                                         | Must enforce: every async page uses `<AsyncContent>` which renders error state on failure.                                                                          |
| **Empty**                | `<EmptyState>` component exists but isn't always used. Some pages show it prematurely during loading.                                    | Must enforce: `<EmptyState>` is only rendered when `isLoading === false && isError === false && data.length === 0`.                                                 |
| **Hover**                | `ProductCard` has hover shadow transition. `Sidebar` items have hover background. Interactive table rows have `clickable-row` hover.     | Inconsistent. Some table rows are clickable with no hover indication. Report dashboard cards have `hover:shadow-md` but no cursor feedback beyond `cursor-pointer`. |
| **Focus**                | `ProductCard` is keyboard-focusable. Skip link exists in `AppLayout`. Dialog focus trapping handled by Radix.                            | Icon-only buttons in tables have no visible focus ring. Report cards are not focusable. No focus-visible styles customized beyond browser defaults.                 |
| **Disabled**             | Pagination buttons correctly use `disabled` prop.                                                                                        | Other buttons (e.g., "Add Chemical") don't disable during mutations. No visual disabled state defined for cards or table rows.                                      |

### 3.4 Proposed Design Token Structure

```
tokens/
├── colors.ts         # Semantic: primary, secondary, destructive, warning, success, info, muted
│                       Status: active, inactive, pending, approved, rejected, expired, overdue
│                       Chart: chart-1 through chart-8
├── spacing.ts        # page-x, page-y, section-gap, card-padding, table-cell-x, table-cell-y
│                       Compact: card-padding-compact, table-cell-x-compact
├── typography.ts     # display, h1, h2, h3, h4, body, body-sm, caption, mono, label
│                       With size + weight + line-height + letter-spacing as composites
├── radius.ts         # none, sm, md, lg, xl, full (map to element types: input, card, badge, button)
├── shadows.ts        # card, card-hover, dropdown, modal, toast (semantic names, not arbitrary levels)
├── transitions.ts    # fast (100ms), default (150ms), slow (300ms) with easing
├── breakpoints.ts    # mobile (0), tablet (640), desktop (1024), wide (1280)
└── z-index.ts        # dropdown(50), modal(100), toast(200), overlay(300)
```

### 3.5 Tailwind Config Restructuring

```ts
// Proposed theme extension:
theme: {
  extend: {
    spacing: {
      'page-x': '1.5rem',        // 24px — main content horizontal padding
      'page-y': '1.5rem',        // 24px — main content vertical padding
      'section': '1.5rem',       // 24px — gap between page sections
      'card': '1.25rem',         // 20px — card internal padding
      'card-compact': '1rem',    // 16px — compact card padding
      'cell-x': '1rem',          // 16px — table cell horizontal
      'cell-y': '0.75rem',       // 12px — table cell vertical
    },
    // ... rest of existing config remains
  }
}
```

### 3.6 Naming Conventions

| Layer            | Convention                                                                                                 | Example                                         |
| ---------------- | ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| Components       | PascalCase, role-descriptive                                                                               | `DataTableWrapper`, `AsyncContent`, `PageShell` |
| Hooks            | `use` prefix + PascalCase                                                                                  | `useEquipmentView`, `useAsyncQuery`             |
| CSS tokens       | kebab-case with semantic prefix                                                                            | `--color-status-active`, `--spacing-section`    |
| Files            | PascalCase for components, camelCase for hooks/utils                                                       | `DataTableWrapper.tsx`, `useFormatters.ts`      |
| Tailwind classes | Standard Tailwind, avoid custom `@layer components` utilities for things covered by component abstractions | Use `<Card>` not `.minimal-card`                |

---

## 4. Refactor Strategy (Phased Plan)

### Phase 1 — Critical Stabilization (Week 1–2)

**Goal:** Stop active UX damage. Fix broken pages, prevent data loss, eliminate scroll-breaking table overflows.

| #   | Action                                                                                                                                                                                                   | Layer             | Risk   | Effort | Impact                                          |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | ------ | ------ | ----------------------------------------------- |
| 1.1 | **Delete `Plants.tsx`** — it's a dead mock. Either remove the route or replace with a redirect to PlantSpecies/PlantStock.                                                                               | Pages             | Low    | Low    | Critical — removes a broken page                |
| 1.2 | **Wire `UserProfile.tsx` to real API** — Replace `currentUser` mock import with `useAuth()` hook. Replace `useState` achievements with React Query mutations.                                            | Pages, Services   | Medium | Medium | Critical — enables real user data               |
| 1.3 | **Fix `InventoryReportPage` JSON rendering** — Replace `JSON.stringify(value)` with proper value rendering: numbers as formatted numbers, objects as key-value grids.                                    | Pages             | Low    | Low    | High — stops broken UI                          |
| 1.4 | **Add `overflow-x-auto` to ALL table wrappers** — Create a `<DataTableWrapper>` component that wraps all tables with consistent borders, radius, and `overflow-x-auto`. Replace all 3 existing patterns. | Components, Pages | Low    | Medium | High — fixes mobile table overflow for 11 pages |
| 1.5 | **Fix item name display** — In `OverdueBorrows`, `PendingApprovals`, `BorrowedItemsReportPage`, resolve the item name via the nested `item` relationship instead of showing `"equipment #12"`.           | Pages             | Low    | Low    | High — users can identify items                 |
| 1.6 | **Fix premature empty state** — In `Chemicals`, `PlantSamples`, `PlantVarieties`, `PlantStock`, gate `<EmptyState>` behind `!isLoading && !isError`.                                                     | Pages             | Low    | Low    | Medium — eliminates loading flash               |

---

### Phase 2 — System Standardization (Week 3–5)

**Goal:** Unify all 24 pages onto a single component architecture. Eliminate the modern/legacy split.

| #   | Action                                                                                                                                                                                                                                                                   | Layer             | Risk   | Effort | Impact                                             |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------- | ------ | ------ | -------------------------------------------------- |
| 2.1 | **Create `<AsyncContent>` boundary component** — Accepts `isLoading`, `isError`, `isEmpty`, `skeleton`, `errorFallback`, `emptyFallback`, `children`. Every page wraps its async area in this. Eliminates all 4 loading/error/empty pattern variants.                    | Components        | Low    | Medium | High — fixes FLAW-11, 12, 13, 22, 23 in one shot   |
| 2.2 | **Consolidate `PageHeader` API** — Remove JSX-element icon support. Remove `subtitle` alias. Single API: `icon: LucideIcon`, `title: string`, `description?: string`, `actions?: ReactNode`. Delete dashboard's local `PageHeader` copy.                                 | Components, Pages | Medium | Medium | High — fixes FLAW-10, 17 across all pages          |
| 2.3 | **Enforce `<Pagination>` usage** — Replace all inline `<footer>` pagination with the shared `<Pagination>` component on Equipment, BorrowRecords, Transactions, Users. Add it to pages that currently lack pagination.                                                   | Components, Pages | Low    | Medium | Medium — fixes FLAW-16                             |
| 2.4 | **Enforce `<SearchFilter>` composition** — Remove the custom wrapper patterns in PlantSamples and PlantVarieties. All pages use `<SearchFilter>` with children for filters/toggles.                                                                                      | Pages             | Low    | Low    | Medium — fixes FLAW-15                             |
| 2.5 | **Create `@/lib/formatters.ts`** — Single shared module: `formatDate()`, `formatDateTime()`, `formatEnumLabel()`, `formatCurrency()`, `formatQuantity()`, `formatRelativeTime()`. Remove all per-hook duplications. Apply to all legacy pages.                           | Utils, Pages      | Low    | Medium | Medium — fixes FLAW-19, 20                         |
| 2.6 | **Create `<SecondaryPageShell>` layout** — For pages that aren't entity details but need breadcrumbs/back-navigation: MaintenanceRecords, ChemicalBatches, OverdueBorrows, PendingApprovals, all reports. Provides: breadcrumb, page header, optional actions.           | Components, Pages | Low    | Medium | High — fixes FLAW-21                               |
| 2.7 | **Migrate legacy pages to `useXxxView()` pattern** — Create view hooks for: MaintenanceRecords, ChemicalBatches, Achievements, OverdueBorrows, PendingApprovals, UserDocuments. Move all inline state, queries, mutations into hooks. Pages become pure declarative JSX. | Pages, Hooks      | Medium | High   | High — eliminates the modern/legacy split entirely |
| 2.8 | **Standardize action button sizing** — Define two sizes: `icon-sm` (28px, for dense tables) and `icon` (36px, for cards/spacious contexts). Update all pages. Add `aria-label` to every icon-only button.                                                                | Components, Pages | Low    | Medium | Medium — fixes FLAW-18, 27                         |

---

### Phase 3 — Scalability & Performance (Week 6–8)

**Goal:** Optimize rendering, reduce duplication, prepare for 100+ pages.

| #   | Action                                                                                                                                                                                                                                                                                                                                                                                                                                     | Layer       | Risk   | Effort | Impact                                        |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------- | ------ | ------ | --------------------------------------------- |
| 3.1 | **CSS Pruning** — Audit all `@layer components` custom classes in `index.css`. Remove `.minimal-card`, `.minimal-card-bordered`, `.minimal-card-accent`, `.data-table`, `.minimal-input`, `.minimal-badge-*`, `.icon-badge-*`, `.empty-state`, `.section-header`, `.section-title` if they're only used by 0–2 components. Replace usages with Tailwind utilities or shadcn components. Target: reduce `index.css` from 850 to <200 lines. | CSS         | Medium | Medium | Medium — reduces bundle, eliminates confusion |
| 3.2 | **Extract `<DataTable>` composite component** — A composable table component that wraps `<DataTableWrapper>` + `<Table>` + `<AsyncContent>` + `<Pagination>`. Accepts column definitions, sort config, data, loading/error states. Based on TanStack Table or custom. Eliminates repeated table boilerplate across 15+ pages.                                                                                                              | Components  | Medium | High   | High — dramatic reduction in per-page code    |
| 3.3 | **Create `<ListPage>` page template** — A higher-order component or composition root template that provides: `PageHeader` → `QuickStats` → `SearchFilter` → `ViewToggle` → `AsyncContent (grid or table)` → `Pagination`. Most inventory list pages become <50 lines.                                                                                                                                                                      | Components  | Medium | High   | High — scalability enabler                    |
| 3.4 | **Add skeleton loaders for grid views** — Use existing `<CardSkeleton>` in a grid layout during loading. Create `<ProductCardSkeleton>` that matches `ProductCard`'s layout.                                                                                                                                                                                                                                                               | Components  | Low    | Low    | Medium — eliminates layout shift              |
| 3.5 | **Virtual scrolling for long lists** — Add `react-virtual` (or `@tanstack/react-virtual`) for tables/grids with 100+ items. Prevents DOM bloat on large datasets.                                                                                                                                                                                                                                                                          | Performance | Medium | Medium | Medium — performance at scale                 |
| 3.6 | **Code-split report pages** — Lazy-load all 5 report pages + ReportsDashboard via `React.lazy()` + `Suspense`. These are infrequently accessed and should not be in the main bundle.                                                                                                                                                                                                                                                       | Performance | Low    | Low    | Low — bundle optimization                     |
| 3.7 | **Create page scaffolding generator** — CLI script or template that generates a new page with correct structure: `useXxxView.ts` hook + `Xxx.tsx` page + `<AsyncContent>` + `<PageHeader>` + `<SearchFilter>` + `<Pagination>`. Prevents future legacy-pattern pages.                                                                                                                                                                      | Tooling     | Low    | Medium | High — governance by automation               |

---

### Phase 4 — Enterprise Hardening (Week 9–12)

**Goal:** WCAG 2.2 AA compliance, responsive perfection, micro-interactions, design polish.

| #    | Action                                                                                                                                                                                                                                                        | Layer           | Risk   | Effort | Impact                                     |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | ------ | ------ | ------------------------------------------ |
| 4.1  | **Install `eslint-plugin-jsx-a11y`** — Configure as `error` for: `aria-role`, `role-has-required-aria-props`, `interactive-supports-focus`, `click-events-have-key-events`, `anchor-is-valid`, `label-has-associated-control`.                                | Tooling         | Low    | Low    | High — automated accessibility enforcement |
| 4.2  | **Responsive column strategy for tables** — Create a `<ResponsiveTable>` component or CSS utility that hides non-essential columns below `lg`. BorrowRecords 10 columns → show 5 on mobile + expandable row.                                                  | Components      | Medium | High   | High — fixes FLAW-06, 07                   |
| 4.3  | **Remove `aspect-square` from ProductCard** — Replace with `min-h-[280px]` or `aspect-[4/5]` on mobile, `aspect-square` on `md+`. Let cards breathe on small screens.                                                                                         | Components      | Low    | Low    | Medium — fixes FLAW-08                     |
| 4.4  | **Dashboard breakpoint fix** — Change `xl:grid-cols-2` to `lg:grid-cols-2` (1024px). Tablets get 2-col dashboard. Add `md:grid-cols-2` (768px) for insight sidebar.                                                                                           | Pages           | Low    | Low    | Medium — fixes FLAW-09                     |
| 4.5  | **Focus visible styles** — Add Tailwind `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2` to all interactive elements. Ensure focus ring is visible in both light and dark modes.                                                    | CSS, Components | Low    | Medium | High — WCAG 2.4.7                          |
| 4.6  | **Dialog focus trapping audit** — Verify all `<Dialog>` instances properly trap focus. Ensure ESC closes. Ensure focus returns to trigger element on close. (Radix handles most of this, but custom dialogs need verification.)                               | Components      | Low    | Low    | Medium — WCAG 2.4.3                        |
| 4.7  | **Color contrast audit** — Run axe-core on all pages. Fix any `muted-foreground` text that fails 4.5:1 contrast against its background. Common issue: `text-muted-foreground/50` and `text-muted-foreground/70` opacity modifiers likely fail contrast.       | CSS             | Low    | Medium | High — WCAG 1.4.3                          |
| 4.8  | **Announce dynamic content** — Add `aria-live="polite"` to: pagination status messages, loading indicators, toast notifications, async content regions.                                                                                                       | Components      | Low    | Low    | Medium — WCAG 4.1.3                        |
| 4.9  | **Micro-interactions** — Add `transition-transform` scale-up on card hover (currently only on image, not full card). Add subtle `transition-colors` on table row hover. Add `animate-pulse` on skeleton loaders. Add brief flash on successful toast overlay. | CSS             | Low    | Low    | Low — polish                               |
| 4.10 | **Dark mode audit** — Verify all hardcoded colors (e.g., `bg-blue-50 dark:bg-blue-950/30`, `bg-emerald-50 dark:bg-emerald-950/30`) have proper dark variants. Audit `STATUS_COLORS` maps for dark mode coverage.                                              | CSS             | Low    | Medium | Medium — dark mode quality                 |

---

## 5. Component Architecture Redesign

### 5.1 Global Layout Structure

```
<AppLayout>
  ├── <SkipLink />
  ├── <CommandPalette />
  ├── <TopNav />
  ├── <div class="flex">
  │   ├── <Sidebar />
  │   └── <main id="main-content">
  │       └── <PageTransition>
  │           └── {children}     ← Page content injected here
  │       </PageTransition>
  │   </main>
  ├── <MobileBottomNav />
  └── <Toaster />
</AppLayout>
```

**Rules:**

- All pages MUST be wrapped in `<AppLayout>`. No exceptions.
- `main` has `p-4 sm:p-6` padding. Pages MUST NOT add their own outer padding.
- Pages render a `<div className="space-y-6">` as their root element for vertical rhythm.

### 5.2 Page Type Hierarchy

```
Page Types:
├── ListPage          — Entity listing (Equipment, Chemicals, PlantSpecies, etc.)
│   Structure: PageHeader → QuickStats? → SearchFilter → AsyncContent(Grid|Table) → Pagination
│
├── DetailPage        — Entity detail view (ChemicalDetail, EquipmentDetail, etc.)
│   Structure: DetailLayout(Header → Hero? → KpiStrip → Alerts? → SectionGrid)
│
├── SecondaryPage     — Functional pages (MaintenanceRecords, BorrowRecords, Approvals, etc.)
│   Structure: SecondaryPageShell(Breadcrumb → PageHeader → Content)
│
├── ReportPage        — Data reports (InventoryReport, ChemicalUsage, etc.)
│   Structure: SecondaryPageShell(Breadcrumb → PageHeader → ExportAction → ReportContent)
│
├── DashboardPage     — Dashboard views
│   Structure: PageHeader → Tabs → WidgetGrid
│
└── FormPage          — Full-page forms (rare)
    Structure: PageHeader → FormCard → FormActions
```

### 5.3 Form System Standard

```tsx
// All forms use react-hook-form + zod + shadcn Form components:

<Dialog>
  <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>{isEditing ? "Edit " : "Add "}{entityName}</DialogTitle>
      <DialogDescription>{contextMessage}</DialogDescription>
    </DialogHeader>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
        <FormField ... />        {/* Each field uses FormField wrapper */}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {isPending ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  </DialogContent>
</Dialog>
```

**Rules:**

- Max dialog width: `max-w-lg` for simple forms, `max-w-2xl` for complex forms.
- Always show spinner in submit button during `isPending`.
- Always disable submit button during `isPending`.
- Required fields marked with `*` in label.
- Validation errors shown below each field via `<FormFieldError>`.
- All dates use `<Calendar>` date picker, not raw `<Input type="date">`.

### 5.4 Table System Standard

```tsx
<DataTableWrapper>
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>...</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <AsyncContent
        isLoading={isLoading}
        isError={isError}
        isEmpty={items.length === 0}
        skeleton={<TableRowSkeleton columns={n} rows={5} />}
        errorFallback={<TableCell colSpan={n}>Failed to load.</TableCell>}
        emptyFallback={<TableCell colSpan={n}><EmptyState ... /></TableCell>}
      >
        {items.map(item => <TableRow key={item.id}>...</TableRow>)}
      </AsyncContent>
    </TableBody>
  </Table>
</DataTableWrapper>
```

**`<DataTableWrapper>` definition:**

```tsx
const DataTableWrapper = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "rounded-xl border border-border/40 overflow-x-auto",
      className,
    )}
  >
    {children}
  </div>
);
```

**Rules:**

- Every table uses `<DataTableWrapper>`. No inline border/radius wrappers.
- Clickable rows use `className="cursor-pointer"` + `onClick` + `hover:bg-muted/50` transition.
- Action columns: right-aligned, use `size="icon-sm"` buttons (28px) with `aria-label`.
- Mono-spaced IDs use `className="font-mono text-xs text-muted-foreground"`.
- Dates always formatted via `formatDate()` or `formatDateTime()`.
- Enum values always formatted via `formatEnumLabel()`.

### 5.5 Button System Hierarchy

| Variant             | Usage                                                                     | Example                                    |
| ------------------- | ------------------------------------------------------------------------- | ------------------------------------------ |
| `default` (primary) | Primary action per page. Max 1 per visible section.                       | "Add Chemical", "Save", "Approve"          |
| `outline`           | Secondary actions.                                                        | "Export CSV", "Cancel", pagination buttons |
| `ghost`             | Tertiary / inline actions. Icon-only table row actions.                   | Edit icon, Delete icon                     |
| `destructive`       | Dangerous actions. Only inside confirmation dialogs or as reject buttons. | "Delete", "Reject"                         |
| `link`              | Navigation actions inline in text.                                        | "View all"                                 |

**Size rules:**
| Size | Dimensions | Usage |
|---|---|---|
| `default` | h-10 px-4 | Standard buttons (page actions, dialog footers) |
| `sm` | h-9 px-3 | Compact contexts (pagination, inline actions) |
| `icon` | h-9 w-9 | Icon-only buttons in spacious contexts (cards, toolbars) |
| `icon-sm` | h-7 w-7 | Icon-only buttons in dense contexts (table rows) |

### 5.6 Modal Architecture

**Levels:**

1. **Dialog** — Form modals (CRUD operations). Uses `<Dialog>` from shadcn. Max `max-w-lg`.
2. **AlertDialog** — Confirmation modals (delete, destructive actions). Uses `<AlertDialog>` or `<ConfirmDialog>`.
3. **Sheet** — Side panels for detail views or complex forms. Uses `<Sheet>` from shadcn. Only on desktop.
4. **Drawer** — Bottom-up panels on mobile. Uses `<Drawer>` from shadcn.

**Rules:**

- Never nest modals.
- Always trap focus inside modals.
- ESC always closes.
- Click outside always closes (unless destructive action in progress).
- Return focus to trigger element on close.

### 5.7 Alert / Notification System

| Type             | Component                                       | Usage                                                              |
| ---------------- | ----------------------------------------------- | ------------------------------------------------------------------ |
| **Toast**        | `<Sonner>` (already configured)                 | Success/error feedback for mutations. Auto-dismiss 5s.             |
| **Inline Alert** | `<Alert>` from shadcn or custom `<SafetyAlert>` | Persistent warnings on pages (expired chemicals, overdue borrows). |
| **Banner**       | Custom `<Banner>`                               | System-wide announcements (maintenance downtime). Dismissible.     |

**Rules:**

- Success toasts: 3 seconds, green checkmark.
- Error toasts: 5 seconds, red icon, include error message from API if available.
- Never use `toast()` for loading state — use inline loading indicators instead.
- Destructive toasts (delete confirmations): include "Undo" action for 5s.

### 5.8 Error State Standard

```tsx
// Page-level error:
<AsyncContent
  isError={true}
  errorFallback={
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="p-4 bg-destructive/10 rounded-xl mb-4">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>
      <h3 className="text-sm font-medium text-foreground mb-1">
        Failed to load data
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        Something went wrong. Please try again.
      </p>
      <Button variant="outline" onClick={refetch}>
        <RefreshCw className="h-4 w-4 mr-2" /> Retry
      </Button>
    </div>
  }
/>
```

**Rules:**

- Always include a "Retry" button for network errors.
- Always show the error message from the API response if available.
- Never show empty table/grid on error — always show the error state.
- Never silently fail.

### 5.9 Loading State Standard

| Context       | Component                                                        | Behavior                                               |
| ------------- | ---------------------------------------------------------------- | ------------------------------------------------------ |
| Page (list)   | `<AsyncContent>` with `<CardSkeleton>` grid or `<TableSkeleton>` | Matches same layout as final content. No layout shift. |
| Page (detail) | `<DetailSkeleton>` (already exists)                              | Full detail page skeleton.                             |
| Dialog        | `<Loader2 className="animate-spin" />` in submit button          | Button shows spinner + "Saving…"                       |
| Inline data   | `<Skeleton>` from shadcn                                         | Individual shimmer blocks.                             |

### 5.10 Empty State Standard

```tsx
<EmptyState
  icon={Package} // ALWAYS provide an icon
  title="No equipment found" // ALWAYS provide a title
  description="Try adjusting..." // ALWAYS provide a description
  actionLabel="Add Equipment" // Optional CTA
  actionIcon={Plus} // Optional CTA icon
  onAction={() => openCreateForm()} // Optional CTA handler
/>
```

**Rules:**

- Always pass `icon` — never render `<EmptyState>` without one.
- Always differentiate between "no data exists" and "no search results".
- "No data exists" → show CTA to create first item.
- "No search results" → show suggestion to clear filters.

---

## 6. Accessibility Compliance Plan (WCAG 2.2 AA Target)

### 6.1 Contrast Fixes

| Issue                             | Selector                                      | Fix                                                                                                                                                   |
| --------------------------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `text-muted-foreground/50`        | All pages                                     | Remove `/50` opacity. Use `text-muted-foreground` at full opacity. Verify `--muted-foreground` passes 4.5:1 against both `--background` and `--card`. |
| `text-muted-foreground/70`        | ProductCard, QuickStats, multiple meta labels | Replace with `text-muted-foreground`. Or define a `--muted-foreground-light` that passes 4.5:1.                                                       |
| Badge text on colored backgrounds | Status badges with custom per-page color maps | Ensure all status color combinations pass 4.5:1. Test in both light and dark mode.                                                                    |

### 6.2 Keyboard Navigation Rules

| Element                   | Required Behavior                                                                                                                                                   |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| All clickable cards       | `tabIndex={0}`, `role="button"`, `onKeyDown` for Enter/Space. Already done in `ProductCard`. Must be replicated in report dashboard cards, user profile cards, etc. |
| Table rows with `onClick` | Add `tabIndex={0}`, `role="row"` (already implicit), `onKeyDown` for Enter.                                                                                         |
| Icon-only buttons         | MUST have `aria-label`. E.g., `aria-label="Edit Aspirin"` (include entity name).                                                                                    |
| Sidebar navigation        | Arrow key navigation between items. Home/End for first/last.                                                                                                        |
| Dialogs                   | Focus trapped. Tab cycles within dialog. ESC closes. (Radix handles this.)                                                                                          |

### 6.3 Focus Management Strategy

1. **Global skip link** — Already exists in `<AppLayout>`: `<a href="#main-content" className="skip-link">`. Verify it works.
2. **Focus restoration** — When dialog closes, focus returns to the button that opened it. (Radix handles this automatically.)
3. **Route change** — On route navigation, focus moves to `#main-content`. Implement via `useEffect` in `<PageTransition>`.
4. **Dynamic content** — When async content loads, don't steal focus. Use `aria-live="polite"` on the content region.

### 6.4 ARIA Structure Requirements

| Component            | Required ARIA                                                                                                |
| -------------------- | ------------------------------------------------------------------------------------------------------------ |
| `<DataTableWrapper>` | `role="region"`, `aria-label="Equipment list"`                                                               |
| `<Pagination>`       | `nav` element with `aria-label="Pagination"`. Current page: `aria-current="page"`.                           |
| `<SearchFilter>`     | `<Input>` has `role="searchbox"`, `aria-label="Search [entity type]"`.                                       |
| `<AsyncContent>`     | `aria-live="polite"`, `aria-busy={isLoading}` on the content region.                                         |
| `<EmptyState>`       | `role="status"`, `aria-live="polite"`. (Already implemented.)                                                |
| `<Toast>`            | `role="alert"`, `aria-live="assertive"` for errors, `aria-live="polite"` for success. (Sonner handles this.) |

### 6.5 Form Accessibility Fixes

| Fix                | Detail                                                                                                                                                                                                                     |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Label association  | Every `<Input>` must have an associated `<Label htmlFor={id}>`. Many forms use `<Label>Name</Label><Input />` without `htmlFor`/`id` binding.                                                                              |
| Error announcement | Form validation errors must be announced by screen readers. Use `aria-invalid="true"` + `aria-describedby` pointing to the error message element. React Hook Form + shadcn `<FormField>` handles this when used correctly. |
| Required fields    | Use `aria-required="true"` on required inputs. Display `*` in label text.                                                                                                                                                  |

---

## 7. Responsive & Adaptive Strategy

### 7.1 Breakpoint Standardization

| Token | Width  | Usage                                                                           |
| ----- | ------ | ------------------------------------------------------------------------------- |
| `sm`  | 640px  | Phone landscape / small tablet. Search bar stacks → row.                        |
| `md`  | 768px  | Tablet portrait. Grid goes to 2 columns.                                        |
| `lg`  | 1024px | Desktop. Sidebar visible. Grid goes to 3 columns. Dashboard gets 2-col widgets. |
| `xl`  | 1280px | Wide desktop. Grid goes to 4 columns.                                           |

**Critical fix:** Dashboard widgets change from `xl:grid-cols-2` → `lg:grid-cols-2`.

### 7.2 Mobile-First Restructuring Plan

| Component                      | Current                                        | Fix                                                                                                                         |
| ------------------------------ | ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **ProductCard** grid           | `grid-cols-1 md:2 lg:3 xl:4` + `aspect-square` | Remove `aspect-square` on `<sm`. Use `aspect-[4/5]` on mobile, `aspect-square` on `md+`.                                    |
| **Dashboard** widgets          | `grid-cols-1 xl:grid-cols-2`                   | `grid-cols-1 lg:grid-cols-2`                                                                                                |
| **Tables**                     | No overflow handling                           | `<DataTableWrapper>` with `overflow-x-auto`. Hide low-priority columns below `lg` using `className="hidden lg:table-cell"`. |
| **BorrowTable** 10 cols        | All visible always                             | Hide Type, Borrowed, Returned below `lg`. Show 6 essential columns on mobile.                                               |
| **SearchFilter + filters**     | Stacks at `sm`                                 | Already correct. Maintain.                                                                                                  |
| **PageHeader + action button** | Stacks at `sm`                                 | Already correct. Maintain.                                                                                                  |
| **QuickStats**                 | `flex-row gap-4` with no wrap                  | Add `flex-wrap`. On mobile, show 2-per-row: `grid grid-cols-2 lg:grid-cols-4`.                                              |

### 7.3 Layout Shift Fixes

| Issue                           | Fix                                                               |
| ------------------------------- | ----------------------------------------------------------------- |
| Grid loading → content jump     | Show `<CardSkeleton>` grid with same column count during loading. |
| Table loading → content jump    | Show `<TableSkeleton>` with same column count during loading.     |
| Dashboard loading → widget jump | Use `<DashboardSkeleton>` (already exists).                       |
| QuickStats loading → flash      | Show `<Skeleton>` blocks matching stat card dimensions.           |

### 7.4 Container Rules

- Max content width: `1400px` (already set via Tailwind `container`).
- Main content area: `flex-1 min-w-0` (already set in `AppLayout`).
- Page-level padding: `p-4 sm:p-6` (already set in `AppLayout`).
- Section spacing: `space-y-6` as the standard vertical rhythm.

---

## 8. Visual Hierarchy Correction Plan

### 8.1 Typography Scale

| Level      | Size                 | Weight | Tracking | Usage                                     |
| ---------- | -------------------- | ------ | -------- | ----------------------------------------- |
| Display    | 30px / 38px (`4xl`)  | 600    | -0.02em  | Landing pages only. Never in app.         |
| H1         | 20px / 30px (`2xl`)  | 500    | -0.02em  | Page titles. ONE per page.                |
| H2         | 18px / 28px (`xl`)   | 600    | -0.015em | Section headings within cards.            |
| H3         | 16px / 24px (`lg`)   | 500    | -0.01em  | Sub-section headings, card titles.        |
| H4         | 14px / 22px (`base`) | 500    | 0        | Inline section labels.                    |
| Body       | 14px / 22px (`base`) | 400    | -0.006em | Default text.                             |
| Body Small | 13px / 20px (`sm`)   | 400    | 0        | Table cells, secondary info.              |
| Caption    | 12px / 18px (`xs`)   | 400    | 0        | Metadata, timestamps, IDs.                |
| Mono       | 12px / 18px (`xs`)   | 400    | 0        | Code, IDs, technical values. `font-mono`. |

**Key fix:** Dashboard local `PageHeader` uses `text-3xl` (24px). Must be `text-2xl` (20px) to match all other pages.

### 8.2 Heading System Rules

1. Every page has exactly ONE `<h1>` (the `PageHeader` title).
2. Card titles use `<h3>` or `<h4>`, never `<h2>`.
3. Section headings inside cards use `<h2>`.
4. Never skip heading levels (h1 → h3 without h2).
5. Never use heading tags for styling — use utility classes for visual size, semantic tags for structure.

### 8.3 Spacing Rhythm Rules

| Context                    | Token         | Value     |
| -------------------------- | ------------- | --------- |
| Between page sections      | `space-y-6`   | 24px      |
| Between items in a section | `space-y-4`   | 16px      |
| Card internal padding      | `p-5`         | 20px      |
| Table cell horizontal      | `px-4`        | 16px      |
| Table cell vertical        | `py-3`        | 12px      |
| Form field gap             | `space-y-4`   | 16px      |
| Button group gap           | `gap-2`       | 8px       |
| Badge padding              | `px-2 py-0.5` | 8px × 2px |

### 8.4 Card Design Normalization

| Property   | Standard                                                                         |
| ---------- | -------------------------------------------------------------------------------- |
| Background | `bg-card`                                                                        |
| Border     | `border-2 border-border/60` (ProductCard) or `border border-border` (info cards) |
| Radius     | `rounded-xl`                                                                     |
| Shadow     | `shadow-md` at rest, `shadow-lg` on hover                                        |
| Padding    | `p-5` content area                                                               |
| Transition | `transition-all` with `hover:shadow-lg`                                          |

**Remove:** `.minimal-card`, `.minimal-card-bordered`, `.minimal-card-accent` CSS classes.  
**Use:** `<Card>` from shadcn for info/stat cards. `<ProductCard>` for entity cards with images.

### 8.5 Depth & Shadow Consistency

| Elevation Level | Shadow Token  | Usage                             |
| --------------- | ------------- | --------------------------------- |
| 0 — Flat        | `shadow-none` | Inline elements, table cells      |
| 1 — Raised      | `shadow-sm`   | Input fields, small badges        |
| 2 — Card        | `shadow-md`   | Cards, stat boxes, page sections  |
| 3 — Card Hover  | `shadow-lg`   | Card hover state                  |
| 4 — Dropdown    | `shadow-lg`   | Dropdowns, popovers, select menus |
| 5 — Modal       | `shadow-xl`   | Dialogs, sheets                   |
| 6 — Toast       | `shadow-2xl`  | Toast notifications               |

### 8.6 Density Standards

| Density         | Context                                      | Rules                                                 |
| --------------- | -------------------------------------------- | ----------------------------------------------------- |
| **Comfortable** | Default for all pages                        | `p-5` cards, `py-3` table cells, `space-y-6` sections |
| **Compact**     | Data-heavy tables (>8 columns), mobile views | `p-4` cards, `py-2` table cells, `space-y-4` sections |

---

## 9. Performance Optimization (UI Layer)

### 9.1 Reduce DOM Depth

| Issue                         | Current                                                            | Fix                                                                                           |
| ----------------------------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| ProductCard nested divs       | 6 levels of nesting                                                | Flatten to 4. Remove unnecessary wrapper `<div>` around image area and content area.          |
| Equipment card action overlay | Extra `<div className="absolute bottom-5">` layer overlapping card | Move edit/delete buttons into ProductCard's built-in footer slot instead of absolute overlay. |
| SearchFilter wrapping         | Some pages double-wrap in extra flex container                     | Use `<SearchFilter>` as-is with children. Remove wrapper `<div>`.                             |

### 9.2 Eliminate Redundant Wrappers

| Pattern                                                                       | Frequency         | Fix                                                                                                                                                 |
| ----------------------------------------------------------------------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `<AppLayout><div className="space-y-6 animate-fade-in">...</div></AppLayout>` | Every modern page | The `animate-fade-in` and `space-y-6` should be part of `<PageTransition>` or `AppLayout`. Pages should not need to add their own root wrapper div. |
| `<div className="flex items-center gap-1">` around 2 buttons                  | 10+ pages         | Buttons already handle spacing when adjacent. Remove wrapping div.                                                                                  |

### 9.3 Optimize Re-renders

| Issue                                                          | Fix                                                                                                                                                                            |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `useChemicalsView()` returns a flat object with 15+ properties | Memoize individual derived values. Split into `useChemicalsData()` (API) + `useChemicalsUI()` (local state). Prevents re-render of entire page when only search query changes. |
| `view.filteredItems` recomputed on every render in some hooks  | Ensure `useMemo` wraps filter operations.                                                                                                                                      |
| Dialog forms re-render parent page on every keystroke          | Ensure `<Dialog>` content is its own component with its own state, not inline in the page. (Already done in modern pages; verify legacy pages.)                                |

### 9.4 Remove Style Duplication

| Duplication                                                             | Count                                        | Fix                                                                                |
| ----------------------------------------------------------------------- | -------------------------------------------- | ---------------------------------------------------------------------------------- |
| `formatEnumLabel()` function                                            | Defined in 8 different `useXxxView.ts` files | Extract to `@/lib/formatters.ts`. Single import everywhere.                        |
| `statusBadgeClass()` / `conditionBadgeClass()`                          | Per-entity color maps in each hook file      | Centralize in `@/lib/status-styles.ts`. Map status strings to badge variant props. |
| Table wrapper class strings                                             | 3 different patterns hardcoded in JSX        | Single `<DataTableWrapper>` component.                                             |
| `"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"` | Repeated in 6 pages                          | Extract as `<EntityGrid>` component or Tailwind class group.                       |

### 9.5 CSS Pruning Targets

Classes in `index.css` to evaluate for removal:

| Class                                                                                     | Lines     | Used By                                               | Recommendation                                   |
| ----------------------------------------------------------------------------------------- | --------- | ----------------------------------------------------- | ------------------------------------------------ |
| `.minimal-card` + `.minimal-card-bordered` + `.minimal-card-accent`                       | ~15 lines | Dashboard widgets only?                               | Replace with `<Card>` variants. Delete.          |
| `.data-table` + related                                                                   | ~25 lines | Unknown — possibly 0 pages (all use shadcn `<Table>`) | Delete if unused.                                |
| `.icon-badge` + `.icon-badge-primary` + `.icon-badge-destructive` + `.icon-badge-warning` | ~16 lines | Detail page sections?                                 | Evaluate. If <3 usages, inline and delete.       |
| `.minimal-badge-*`                                                                        | ~16 lines | Unknown                                               | If shadcn `<Badge>` covers all variants, delete. |
| `.minimal-input`                                                                          | ~4 lines  | None — all forms use shadcn `<Input>`                 | Delete.                                          |
| `.section-header` + `.section-title`                                                      | ~8 lines  | Unknown                                               | Delete if unused.                                |
| `.empty-state`                                                                            | ~4 lines  | None — all pages use `<EmptyState>` component         | Delete.                                          |

**Target:** Reduce `index.css` from ~850 lines to <250 lines.

### 9.6 Component Extraction Strategy

| Current Inline Code                                                                       | Extracted Component                                              | Impact           |
| ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ---------------- |
| Status filter `<Select>...<SelectItem>` repeated in 5 pages                               | `<StatusSelect statuses={[...]} value={v} onChange={fn} />`      | -50 lines total  |
| Grid `{items.map(item => <ProductCard ...>)}` repeated in 6 pages                         | `<EntityGrid items={items} renderCard={fn} />`                   | -100 lines total |
| Footer pagination `<Button>Previous</Button>...<Button>Next</Button>` repeated in 4 pages | Use existing `<Pagination>` component                            | -80 lines total  |
| Form dialog boilerplate repeated in every page                                            | `<EntityFormDialog form={form} onSubmit={fn} fields={config} />` | -200 lines total |

---

## 10. Final UI Architecture Blueprint

### 10.1 Folder Structure

```
src/
├── app/                          # App-level concerns
│   ├── routes.tsx                # Route definitions
│   ├── providers.tsx             # Theme, Query, Auth providers
│   └── App.tsx                   # Root component
│
├── components/                   # Shared UI components
│   ├── ui/                       # shadcn/ui primitives (button, input, dialog, etc.)
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── table.tsx
│   │   └── ...
│   │
│   ├── composed/                 # Application-level composite components
│   │   ├── AsyncContent.tsx      # Loading/error/empty boundary
│   │   ├── DataTableWrapper.tsx  # Table container with overflow + border
│   │   ├── EntityGrid.tsx        # Product card grid layout
│   │   ├── EntityFormDialog.tsx  # Standardized CRUD form dialog
│   │   ├── StatusSelect.tsx      # Reusable status filter dropdown
│   │   ├── PageShell.tsx         # Root page wrapper (spacing + animation)
│   │   └── SecondaryPageShell.tsx # Breadcrumb + header for secondary pages
│   │
│   ├── shared/                   # Business-aware shared components
│   │   ├── PageHeader.tsx        # [CONSOLIDATED] Single API only
│   │   ├── SearchFilter.tsx      # Search bar + filter children
│   │   ├── ViewToggle.tsx        # Grid/List toggle
│   │   ├── QuickStats.tsx        # Stat cards row
│   │   ├── Pagination.tsx        # [ENFORCE USAGE] Shared pagination
│   │   ├── ConfirmDialog.tsx     # Delete/destructive confirmation
│   │   ├── EmptyState.tsx        # [ENFORCE: always with icon]
│   │   ├── PermissionGate.tsx    # RBAC visibility wrapper
│   │   ├── ImageWithFallback.tsx # Image with error fallback
│   │   └── HierarchyBreadcrumb.tsx
│   │
│   ├── detail/                   # Detail page framework
│   │   ├── DetailLayout.tsx      # Config-driven detail page shell
│   │   ├── DetailPageShell.tsx   # Skeleton + NotFound shells
│   │   └── detail-types.ts       # Shared detail type definitions
│   │
│   ├── layout/                   # App chrome
│   │   ├── AppLayout.tsx         # Main layout shell
│   │   ├── TopNav.tsx
│   │   ├── Sidebar.tsx
│   │   └── MobileBottomNav.tsx
│   │
│   └── feedback/                 # State feedback components
│       ├── LoadingState.tsx       # Spinner / skeleton / text loading
│       ├── Skeletons.tsx          # Card / Table / Dashboard skeletons
│       └── ErrorBoundary.tsx      # React error boundary
│
├── hooks/                        # Shared hooks
│   ├── useKeyboardShortcuts.ts
│   ├── useMediaQuery.ts          # [NEW] Responsive breakpoint hook
│   └── useDebounce.ts
│
├── lib/                          # Pure utility functions
│   ├── utils.ts                  # cn() and general utils
│   ├── formatters.ts             # [NEW] formatDate, formatEnum, formatCurrency
│   ├── status-styles.ts          # [NEW] Centralized status → badge variant maps
│   └── api.ts                    # Axios instance
│
├── services/                     # API service hooks (React Query)
│   ├── chemicalService.ts
│   ├── equipmentService.ts
│   └── ...
│
├── types/                        # TypeScript type definitions
│   ├── index.ts                  # Entity types
│   └── schemas.ts                # Zod validation schemas
│
├── pages/                        # Page components
│   └── inventory/
│       ├── Dashboard.tsx
│       ├── Chemicals.tsx
│       ├── Equipment.tsx
│       ├── useChemicalsView.ts   # Page-specific view model hook
│       ├── useEquipmentView.ts
│       ├── chemical-detail/      # Detail page config + sections
│       ├── equipment-detail/
│       ├── reports/
│       └── ...
│
├── contexts/                     # React contexts
│   └── AuthContext.tsx
│
└── styles/
    └── index.css                 # Tailwind directives + CSS custom properties ONLY
                                  # NO @layer components utilities
                                  # All component styles live in .tsx files
```

### 10.2 Component Organization Rules

1. **`ui/`** — Contains ONLY shadcn/ui primitives. Never import business logic. Never import API services.
2. **`composed/`** — Application-level composites built from `ui/` primitives + layout logic. No business logic. No API calls.
3. **`shared/`** — Business-aware components used across multiple pages. May import types. No direct API calls.
4. **`detail/`** — Detail page framework. Config-driven. May import `shared/` and `ui/`.
5. **`layout/`** — App chrome components. Sidebar, TopNav, MobileBottomNav.
6. **`feedback/`** — Loading, error, skeleton, boundary components. Pure UI.
7. **Pages** — Composition roots. Import hooks and components. Zero internal state (all state in `useXxxView` hooks). Pure declarative JSX.

### 10.3 Layout Layers

```
Layer 0: HTML <body>              → bg-background, font-sans, text-foreground
Layer 1: <AppLayout>              → Skip link, TopNav, Sidebar, <main> container
Layer 2: <PageShell>              → space-y-6, animate-fade-in, max-width constraint
Layer 3: Page sections            → PageHeader, QuickStats, SearchFilter, content, footer
Layer 4: Content containers       → DataTableWrapper, EntityGrid, Card
Layer 5: Individual elements      → TableRow, ProductCard, Badge, Button
```

### 10.4 Design Tokens Definition

All design tokens live as CSS custom properties in `index.css` under `:root` (already established).  
Token categories:

| Category    | Source                                                                 | Override Method           |
| ----------- | ---------------------------------------------------------------------- | ------------------------- |
| Colors      | `--primary`, `--background`, `--foreground`, etc.                      | `.dark` class on `<html>` |
| Spacing     | Tailwind theme `spacing`                                               | Tailwind config           |
| Typography  | `--font-sans`, `--font-mono`, `--font-size-base` + Tailwind `fontSize` | Tailwind config           |
| Shadows     | `--shadow-*`                                                           | CSS custom properties     |
| Radius      | Tailwind `borderRadius`                                                | Tailwind config           |
| Transitions | `--transition-snap`, `--transition-duration`                           | CSS custom properties     |

### 10.5 Reusable Patterns

| Pattern                     | Implementation                                        | When To Use                              |
| --------------------------- | ----------------------------------------------------- | ---------------------------------------- |
| **View Model Hook**         | `useXxxView()` returns all state + actions for a page | Every page. No exceptions.               |
| **Config-Driven Rendering** | Hook returns config object → renderer consumes it     | Detail pages, dashboard widgets          |
| **Section Registry**        | Object mapping `kind` → React component               | Detail pages with multiple section types |
| **Composition Root**        | Page file imports hook + renderer, wires them         | Every page is a thin composition root    |
| **Query Boundary**          | `<AsyncContent>` wraps all async regions              | Every page with server data              |
| **Form Pattern**            | `useForm()` + `zodResolver()` + `<Form>`              | Every create/edit operation              |

### 10.6 Governance Rules

1. **No new custom CSS classes in `index.css`**. All new styling must use Tailwind utilities or component composition.
2. **No inline `useState` for query/mutation state in page files**. All state must live in `useXxxView()` hooks.
3. **No custom loading/error/empty rendering**. All async regions must use `<AsyncContent>`.
4. **No new page without `PageHeader`**. Every page has exactly one `<PageHeader>`.
5. **No icon-only button without `aria-label`**. ESLint rule must enforce this.
6. **No table without `<DataTableWrapper>`**. Manual border/radius wrappers are forbidden.
7. **No raw date strings in UI**. All dates must pass through `formatDate()` or `formatDateTime()`.
8. **No raw enum strings in UI**. All enums must pass through `formatEnumLabel()`.
9. **PR checklist** — Before merge, verify:
   - [ ] Uses shared components (PageHeader, AsyncContent, EmptyState, Pagination, DataTableWrapper)
   - [ ] All icon-only buttons have `aria-label`
   - [ ] All dates and enums are formatted
   - [ ] All forms use react-hook-form + zod
   - [ ] Page file has zero `useState` (state lives in hook)
   - [ ] Responsive: visible on 375px mobile, 768px tablet, 1024px desktop
   - [ ] Dark mode: no hardcoded colors that fail in dark mode
   - [ ] Loading / error / empty states all handled

---

## Appendix A — Migration Checklist Per Legacy Page

| Page                          | Create `useXxxView` | Use `PageHeader` (icon ref) | Add `AsyncContent` | Use `DataTableWrapper` | Use `Pagination` | Use `formatDate`               | Use `formatEnumLabel`  | Add `aria-label` | Add breadcrumb |
| ----------------------------- | ------------------- | --------------------------- | ------------------ | ---------------------- | ---------------- | ------------------------------ | ---------------------- | ---------------- | -------------- |
| `Plants.tsx`                  | Delete entirely     | —                           | —                  | —                      | —                | —                              | —                      | —                | —              |
| `UserProfile.tsx`             | Yes                 | Already used                | Yes                | No table               | No               | Yes                            | Yes                    | Yes              | No             |
| `MaintenanceRecords.tsx`      | Yes                 | Fix icon API                | Yes                | Yes                    | Yes              | Yes (started_at, completed_at) | Yes (maintenance_type) | Yes              | Yes            |
| `ChemicalBatches.tsx`         | Yes                 | Fix icon API                | Yes                | Yes                    | Yes              | Yes (expiry_date, received_at) | No                     | Yes              | Yes            |
| `Achievements.tsx`            | Yes                 | Fix icon API                | Yes                | Yes                    | Yes              | No                             | Yes (criteria_type)    | Yes              | Yes            |
| `OverdueBorrows.tsx`          | Yes                 | Fix icon API                | Yes                | Yes                    | No               | Yes (due_at, borrowed_at)      | No                     | Yes              | Yes            |
| `PendingApprovals.tsx`        | Yes                 | Fix icon API                | Yes                | Yes                    | No               | Yes (due_at)                   | No                     | Yes              | Yes            |
| `UserDocuments.tsx`           | Yes                 | Fix icon API                | Yes                | Yes                    | No               | Yes (created_at)               | No                     | Yes              | Yes            |
| `InventoryReportPage.tsx`     | Yes                 | Fix icon API                | Yes                | No                     | No               | Yes                            | No                     | No               | Yes            |
| `BorrowedItemsReportPage.tsx` | Yes                 | Fix icon API                | Yes                | Yes                    | No               | Yes (due_at)                   | No                     | No               | Yes            |
| `ExpiredItemsReportPage.tsx`  | Yes                 | Fix icon API                | Yes                | Yes                    | No               | Yes                            | No                     | No               | Yes            |
| `ChemicalUsageReportPage.tsx` | Yes                 | Fix icon API                | Yes                | Yes                    | No               | Yes                            | No                     | No               | Yes            |
| `UserActivityReportPage.tsx`  | Yes                 | Fix icon API                | Yes                | Yes                    | No               | Yes                            | No                     | No               | Yes            |
| `ReportsDashboard.tsx`        | No (static)         | Fix icon API                | No                 | No                     | No               | No                             | No                     | Yes (cards)      | Yes            |

---

## Appendix B — Estimated Total Effort

| Phase                               | Duration       | Effort Level | Dependencies            |
| ----------------------------------- | -------------- | ------------ | ----------------------- |
| Phase 1 — Critical Stabilization    | 1–2 weeks      | Medium       | None                    |
| Phase 2 — System Standardization    | 3 weeks        | High         | Phase 1 complete        |
| Phase 3 — Scalability & Performance | 2–3 weeks      | High         | Phase 2 mostly complete |
| Phase 4 — Enterprise Hardening      | 3–4 weeks      | Medium       | Phase 2 complete        |
| **Total**                           | **9–12 weeks** | —            | Sequential phases       |

---

_End of audit. This document serves as the UI Architecture Standard for the Plant Lab Inventory system. All future development must conform to the patterns, governance rules, and component contracts defined herein._
