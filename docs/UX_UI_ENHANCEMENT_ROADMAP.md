# UX/UI Enhancement Roadmap — Plant Lab Inventory

> **Goal**: Elevate this application from a functional CRUD system to a **peak Enterprise SaaS user interface** — the kind of polished, delightful product that looks and feels like it has been refined daily for 5+ years.
>
> **Constraint**: Backend remains unchanged. All work is client-side UI only.

---

## Table of Contents

1. [Phase 1 — Foundation: Design System Enforcement](#phase-1--foundation-design-system-enforcement)
2. [Phase 2 — Component Architecture Consolidation](#phase-2--component-architecture-consolidation)
3. [Phase 3 — Navigation & Information Architecture](#phase-3--navigation--information-architecture)
4. [Phase 4 — Data Tables 2.0](#phase-4--data-tables-20)
5. [Phase 5 — Forms & Validation](#phase-5--forms--validation)
6. [Phase 6 — Loading, Error & Empty States](#phase-6--loading-error--empty-states)
7. [Phase 7 — Search & Filtering](#phase-7--search--filtering)
8. [Phase 8 — Detail Pages & Entity Views](#phase-8--detail-pages--entity-views)
9. [Phase 9 — Dashboard & Data Visualization](#phase-9--dashboard--data-visualization)
10. [Phase 10 — Authentication & Onboarding](#phase-10--authentication--onboarding)
11. [Phase 11 — Notification & Feedback System](#phase-11--notification--feedback-system)
12. [Phase 12 — Image & File Management](#phase-12--image--file-management)
13. [Phase 13 — Mobile & Responsive Excellence](#phase-13--mobile--responsive-excellence)
14. [Phase 14 — Micro-Interactions & Animation](#phase-14--micro-interactions--animation)
15. [Phase 15 — Accessibility (WCAG AAA)](#phase-15--accessibility-wcag-aaa)
16. [Phase 16 — Performance & Perceived Speed](#phase-16--performance--perceived-speed)
17. [Phase 17 — Dark Mode Polish](#phase-17--dark-mode-polish)
18. [Phase 18 — Advanced Enterprise Features](#phase-18--advanced-enterprise-features)
19. [Phase 19 — Print, Export & Sharing](#phase-19--print--export--sharing)
20. [Phase 20 — Final Polish & Delight](#phase-20--final-polish--delight)

---

## Phase 1 — Foundation: Design System Enforcement

**Priority: P0 — Must Do First**
**Estimated Effort: 2–3 days**

The design system has excellent tokens defined in `tokens.css`, `base.css`, and `components.css` — but pages bypass them, using raw Tailwind utilities instead of semantic classes. This phase enforces the system everywhere.

### 1.1 Typography Consistency

- [ ] **Task 1.1.1** — Replace `font-medium` with `font-semibold` in `PageHeader.tsx` heading to match `h1` base style (`font-weight: 600`).
- [ ] **Task 1.1.2** — Audit every page component and replace raw Tailwind text utilities with semantic classes:
  - `text-2xl font-semibold` → `.text-title` or `.text-display`
  - `text-xl font-semibold` → `.text-heading`
  - `text-lg font-medium` → `.text-subheading`
  - `text-sm text-muted-foreground` → `.text-body-muted`
  - `text-xs text-muted-foreground` → `.text-caption`
  - `text-xs font-medium uppercase tracking-wider` → `.text-label`
  - `font-mono tabular-nums` → `.text-mono`

  **Files to update**: All 35+ page components, `ProductCard.tsx`, `QuickStats.tsx`, `DetailLayout.tsx`, all detail renderers, sidebar, topnav.

- [ ] **Task 1.1.3** — Standardize card title typography across all card components to use one consistent pattern (`.text-subheading` or `text-sm font-semibold`). Currently varies between `text-sm font-semibold` (LabServices), `font-medium text-foreground` (Clients), `font-medium text-sm` (ProductCard).

- [ ] **Task 1.1.4** — Ensure `StatMini` cards on detail pages use `.stat-value` and `.stat-label` classes instead of inline Tailwind.

### 1.2 Spacing Token Adoption

- [ ] **Task 1.2.1** — Replace all numeric spacing with semantic tokens across every component:
  - `p-4 sm:p-6` → `p-card sm:p-page-x` (content padding)
  - `p-5` → `p-card` (card padding)
  - `gap-4` → `gap-card` (card grids)
  - `gap-6` → `gap-section` (section spacing)
  - `px-4` → `px-cell-x` (table cell horizontal padding)
  - `py-3` → `py-cell-y` (table cell vertical padding)

- [ ] **Task 1.2.2** — Standardize dialog content padding. Currently inconsistent:
  - PlantSamples uses `py-2` spacer
  - MaintenanceRecords uses `mt-2`
  - BorrowRecords uses `py-4`

  **Target**: All dialogs use `py-card` for content area, `gap-card` between sections.

- [ ] **Task 1.2.3** — Align QuickStats and all stat strips (including Clients `SummaryStrip`) to use the same `.stat-card` spacing (`p-card`).

### 1.3 Color Token Enforcement

- [ ] **Task 1.3.1** — Remove all remaining hardcoded color values:
  - LabServices: `bg-emerald-50 dark:bg-emerald-950` → `bg-success/5`
  - PlantSamples card icon: `style={{ color: "hsl(217, 91%, 60%)" }}` → `text-info` or `text-primary`
  - PlantVarieties card icon: `style={{ color: "hsl(142, 71%, 45%)" }}` → `text-success` or `text-primary`
  - Any other inline `style={{ color: ... }}` or hardcoded Tailwind color classes (emerald, blue, amber, green, red) → semantic tokens.

- [ ] **Task 1.3.2** — Unify the three competing status badge systems into one:
  1. `StatusBadge` component with `.status-tag-*` CSS → **keep this as the single source of truth**
  2. Inline `Badge` + `cn(STATUS_COLORS[...])` in PlantSamples, LabServices → **migrate to `StatusBadge`**
  3. `statusBadge()` helper from `status-styles.ts` in Contracts, Payments, Experiments → **migrate to `StatusBadge`**

- [ ] **Task 1.3.3** — Review `success` vs `primary` color overlap. Both map to green. Consider making `success` a slightly different shade (brighter, warmer green) to visually distinguish "active/primary action" from "success state".

### 1.4 Shadow & Elevation Consistency

- [ ] **Task 1.4.1** — Define a 3-tier elevation system and enforce it:
  - **Level 0** (flat): `shadow-none` — inline elements, status badges
  - **Level 1** (raised): `shadow-sm` — cards, dropdowns, tooltips
  - **Level 2** (prominent): `shadow-md` — modals, popovers, floating panels
  - **Level 3** (floating): `shadow-lg` — drag handles, toasts, command palette

- [ ] **Task 1.4.2** — Replace inconsistent hover shadow patterns. Currently some cards use `hover:shadow-lg`, others `hover:shadow-md`, others nothing. Standardize all interactive cards to `shadow-sm hover:shadow-md transition-shadow`.

---

## Phase 2 — Component Architecture Consolidation

**Priority: P0 — Must Do First**
**Estimated Effort: 3–5 days**

~9 pages manually duplicate the `ListPage` pattern. This is the single biggest architectural debt.

### 2.1 ListPage Migration

- [ ] **Task 2.1.1** — Refactor `PlantSamples.tsx` to use `ListPage` shell instead of hand-assembled layout. Wire up proper pagination via `usePagination`.
- [ ] **Task 2.1.2** — Refactor `PlantVarieties.tsx` to use `ListPage`.
- [ ] **Task 2.1.3** — Refactor `Users.tsx` to use `ListPage`.
- [ ] **Task 2.1.4** — Refactor `BorrowRecords.tsx` to use `ListPage`.
- [ ] **Task 2.1.5** — Refactor `LabServices.tsx` to use `ListPage`.
- [ ] **Task 2.1.6** — Refactor `Clients.tsx` to use `ListPage`.
- [ ] **Task 2.1.7** — Refactor `Contracts.tsx` to use `ListPage`.
- [ ] **Task 2.1.8** — Refactor `Payments.tsx` to use `ListPage`.
- [ ] **Task 2.1.9** — Refactor `ExperimentsPage.tsx` to use `ListPage`.
- [ ] **Task 2.1.10** — Verify all 9 pages now have: consistent pagination, loading state, error state, empty state, search filter, view toggle.

### 2.2 Table Standardization

- [ ] **Task 2.2.1** — Ensure `MaintenanceRecords.tsx` uses `EmptyState` component instead of inline `<TableCell>No records found.</TableCell>`.
- [ ] **Task 2.2.2** — Ensure `Achievements.tsx` uses `EmptyState` instead of inline empty message.
- [ ] **Task 2.2.3** — Migrate Clients page table from raw `<table>` HTML to shadcn `<Table>` component.
- [ ] **Task 2.2.4** — Wrap every table instance in `DataTableWrapper` for consistent border, rounded corners, and horizontal scroll.

### 2.3 PageHeader API Cleanup

- [ ] **Task 2.3.1** — Fix `MaintenanceRecords.tsx`: change `subtitle` prop to `description` (the correct `PageHeader` prop name).
- [ ] **Task 2.3.2** — Fix `Achievements.tsx`: change `subtitle` prop to `description`.
- [ ] **Task 2.3.3** — Add TypeScript strict checks to `PageHeader` props (ensure no unknown props are silently accepted).

### 2.4 Shared Component Deduplication

- [ ] **Task 2.4.1** — Extract the "SummaryStrip" pattern from Clients page into a reusable component (or standardize via `QuickStats`).
- [ ] **Task 2.4.2** — Extract common action button patterns (Edit/Delete/View icon buttons) into a shared `ActionButtons` component with proper aria-labels.
- [ ] **Task 2.4.3** — Create a shared `FilterBar` composite component that bundles `SearchFilter` + status `Select` + any page-specific filter controls into a consistent flex row with responsive stacking.

---

## Phase 3 — Navigation & Information Architecture

**Priority: P1 — High Impact**
**Estimated Effort: 2–3 days**

### 3.1 Sidebar Enhancement

- [ ] **Task 3.1.1** — Group the 19 flat inventory nav items into collapsible sections:
  - **Core Inventory**: Equipment, Chemicals, Plant Samples, Plant Varieties, Plant Stock, Species
  - **Operations**: Borrow Records, Overdue Borrows, Maintenance Records, Transactions
  - **Reports & Analytics**: Dashboard, Inventory Report, Achievements
  - **Administration**: Users, Pending Approvals

  Use an accordion/collapsible pattern with section headers.

- [ ] **Task 3.1.2** — Add badge counts to nav items where relevant:
  - Overdue Borrows: show count of overdue items
  - Pending Approvals: show count of pending items
  - Notifications: show unread count

- [ ] **Task 3.1.3** — Add a mini search/filter input at the top of the sidebar to quickly find nav items (useful with 19+ items).

- [ ] **Task 3.1.4** — Implement "Favorites" / "Pinned Pages" — allow users to pin frequently used pages to the top of sidebar. Persist in localStorage.

- [ ] **Task 3.1.5** — Add "Recent Pages" section (last 5 visited pages) at the top of sidebar. Track via a context or localStorage.

- [ ] **Task 3.1.6** — Polish collapsed sidebar state: show group divider lines, improve tooltip positioning, add subtle transition animation.

### 3.2 MobileBottomNav Fix

- [ ] **Task 3.2.1** — Replace all `<a href="...">` with React Router `<Link to="...">` or `<NavLink to="...">` to prevent full page reloads on mobile.
- [ ] **Task 3.2.2** — Add a "More" overflow menu item to MobileBottomNav that opens a sheet with all sub-pages for the current section.
- [ ] **Task 3.2.3** — Add haptic-feedback-ready class (`press-effect`) to mobile nav items.

### 3.3 Breadcrumbs

- [ ] **Task 3.3.1** — Create a `Breadcrumbs` component using the CSS classes already defined in `components.css` (`.breadcrumb`, `.breadcrumb-item`).
- [ ] **Task 3.3.2** — Auto-generate breadcrumb trail from current route path. E.g., `Inventory > Equipment > EQ-001`.
- [ ] **Task 3.3.3** — Integrate breadcrumbs into `PageHeader` or `AppLayout` — show below TopNav on pages deeper than top-level.

### 3.4 TopNav Enhancement

- [ ] **Task 3.4.1** — Add a global action button ("+ New") dropdown in TopNav that allows quick creation of any entity type from anywhere.
- [ ] **Task 3.4.2** — Add user avatar/initials display in the user menu trigger (not just an icon).
- [ ] **Task 3.4.3** — Add active section indicator styling (bottom border or background) on the current top-level tab.

---

## Phase 4 — Data Tables 2.0

**Priority: P1 — High Impact**
**Estimated Effort: 4–5 days**

Transform basic HTML tables into a powerful, interactive data grid experience.

### 4.1 Core Table Engine

- [ ] **Task 4.1.1** — Integrate TanStack Table (`@tanstack/react-table`) as the table engine. Create a generic `DataTable<T>` component that accepts column definitions and data.
- [ ] **Task 4.1.2** — Implement column sorting: clickable headers with ascending/descending/unsorted tri-state indicators (chevron icons).
- [ ] **Task 4.1.3** — Implement column visibility toggle: a dropdown button (e.g., "Columns") that shows checkboxes for each column.
- [ ] **Task 4.1.4** — Implement bulk row selection with a header checkbox for "select all" and individual row checkboxes. Show a floating action bar when rows are selected.
- [ ] **Task 4.1.5** — Add sticky table headers that remain visible when scrolling long tables.

### 4.2 Advanced Table Features

- [ ] **Task 4.2.1** — Implement column resizing by dragging column borders (use `react-resizable-panels` already installed, or TanStack Table's built-in column sizing).
- [ ] **Task 4.2.2** — Add column reordering via drag-and-drop (TanStack Table supports this natively).
- [ ] **Task 4.2.3** — Implement inline row expansion — click to expand a row to show additional details without navigating away.
- [ ] **Task 4.2.4** — Add row context menu (right-click) with options: View, Edit, Duplicate, Delete.
- [ ] **Task 4.2.5** — Implement keyboard navigation within tables: arrow keys to move between cells, Enter to activate, Escape to deselect.

### 4.3 Table Density & Preferences

- [ ] **Task 4.3.1** — Add density toggle (Compact / Default / Relaxed) that adjusts row height and padding.
- [ ] **Task 4.3.2** — Persist user's table preferences (sort column, sort direction, visible columns, density, page size) in localStorage per-page.
- [ ] **Task 4.3.3** — Add "Reset to default" option to restore factory column/sort settings.

### 4.4 Bulk Actions

- [ ] **Task 4.4.1** — Create a floating `BulkActionBar` component that appears when 1+ rows are selected, anchored to bottom of viewport.
- [ ] **Task 4.4.2** — Implement bulk actions: Delete Selected, Export Selected, Change Status (for applicable entities).
- [ ] **Task 4.4.3** — Show selection count in the bulk action bar: "3 of 50 items selected".

---

## Phase 5 — Forms & Validation

**Priority: P1 — High Impact**
**Estimated Effort: 3–4 days**

Standardize all entity forms on `react-hook-form` + `zod` and add modern UX patterns.

### 5.1 Form Library Standardization

- [ ] **Task 5.1.1** — Create Zod schemas for every entity type: Equipment, Chemical, PlantSample, PlantVariety, User, BorrowRecord, LabService, Client, Contract, Payment, Experiment.
- [ ] **Task 5.1.2** — Migrate all entity form dialogs from manual `useState` + `updateFormField` to `react-hook-form` + `zodResolver`.
  - EquipmentFormDialog
  - ChemicalFormDialog
  - PlantSamples (inline dialog)
  - PlantVarieties (inline dialog)
  - Users (inline dialog)
  - BorrowRecords (inline dialog)
  - LabServices (inline dialog)
  - Clients (inline dialog)
  - Contracts (inline dialog)
  - Payments (inline dialog)
  - ExperimentsPage (inline dialog)
- [ ] **Task 5.1.3** — Use the shared `FormField` component (already created) consistently in all forms for label + input + hint + error layout.

### 5.2 Date & Time Inputs

- [ ] **Task 5.2.1** — Replace all native `<Input type="date">` fields with the shadcn `Calendar` / `DatePicker` component (uses `react-day-picker`, already installed).
- [ ] **Task 5.2.2** — Style the DatePicker to match the design system tokens (primary green selection, proper dark mode).
- [ ] **Task 5.2.3** — Add date range picker for filtering (e.g., "Created between" date range filter on reporting pages).

### 5.3 Input Enhancements

- [ ] **Task 5.3.1** — Add character count indicators on text inputs that have max length (e.g., "142 / 255").
- [ ] **Task 5.3.2** — Add numeric input formatting: currency inputs with proper formatting, quantity inputs with +/- stepper buttons.
- [ ] **Task 5.3.3** — Replace plain `<Select>` dropdowns with searchable `Combobox` (shadcn `Command`-based) for fields with many options (e.g., category, status, assigned user, client selection).
- [ ] **Task 5.3.4** — Add inline password strength meter to Registration form: visual bar + text indicator (Weak / Fair / Strong / Very Strong).
- [ ] **Task 5.3.5** — Add password show/hide toggle (eye icon) to all password fields.

### 5.4 Form UX Patterns

- [ ] **Task 5.4.1** — Add "unsaved changes" detection: show a warning toast or dialog when user tries to close a form dialog with unsaved edits.
- [ ] **Task 5.4.2** — Add auto-focus on the first field when a form dialog opens.
- [ ] **Task 5.4.3** — Show inline validation errors as user types (on blur or with debounce), not only on submit.
- [ ] **Task 5.4.4** — Add form section headers with icons (the `<fieldset>` + `<legend>` pattern in EquipmentFormDialog is good — standardize it across all forms).
- [ ] **Task 5.4.5** — Add conditional field visibility — e.g., show "Purity" and "Grade" fields only when Chemical category is "Reagent".
- [ ] **Task 5.4.6** — For complex entities (Equipment, Experiments), consider multi-step wizard dialog with step indicators (Step 1: Basic Info → Step 2: Specifications → Step 3: Review).

---

## Phase 6 — Loading, Error & Empty States

**Priority: P0 — Must Do**
**Estimated Effort: 2 days**

The `LoadingState` component exists but is never used. Loading indicators are raw `<p>` tags. Error states are missing on most pages.

### 6.1 Loading States

- [ ] **Task 6.1.1** — Replace all `<p>Loading…</p>` and `<TableCell>Loading…</TableCell>` with the `LoadingState` component (with `variant="skeleton"` for lists/tables, `variant="spinner"` for initial loads).
- [ ] **Task 6.1.2** — Add loading states to the ~9 pages that currently have **no loading indicator**: PlantSamples, PlantVarieties, LabServices, Clients, Contracts, Payments, Experiments (and any others).
- [ ] **Task 6.1.3** — Create `TableSkeleton` component: renders N skeleton rows matching the table's column count, with shimmer animation.
- [ ] **Task 6.1.4** — Create `CardGridSkeleton` component: renders N placeholder cards matching `ProductCard` dimensions, with shimmer animation.
- [ ] **Task 6.1.5** — Add skeleton loading to dashboard widgets — each widget type gets a matching skeleton shape.
- [ ] **Task 6.1.6** — Implement `Suspense` boundaries with skeleton fallbacks for route-level code splitting.

### 6.2 Error States

- [ ] **Task 6.2.1** — Create a reusable `ErrorState` component with:
  - Error icon/illustration
  - "Something went wrong" message (customizable)
  - Error details toggle (collapsible, for debugging)
  - "Try Again" / "Retry" button that re-fetches data
  - "Go Back" secondary action

- [ ] **Task 6.2.2** — Add error states to all listing pages (most currently have none). Wire the "Retry" button to `TanStack Query`'s `refetch()`.
- [ ] **Task 6.2.3** — Add an `ErrorBoundary` wrapper component with graceful fallback UI (not a white screen). Show a friendly error page with "Report this issue" action.
- [ ] **Task 6.2.4** — Wrap each route's main content in `ErrorBoundary` so one page's crash doesn't take down the whole app.

### 6.3 Empty States

- [ ] **Task 6.3.1** — Enhance `EmptyState` component with optional SVG illustration per entity type (beaker for chemicals, plant for samples, gear for equipment, etc.).
- [ ] **Task 6.3.2** — Add contextual "Create your first [entity]" CTA button in empty states, pre-opening the create dialog.
- [ ] **Task 6.3.3** — Add empty state search variant: "No results for '[query]'" with "Clear search" button.

---

## Phase 7 — Search & Filtering

**Priority: P1 — High Impact**
**Estimated Effort: 3–4 days**

### 7.1 Global Entity Search

- [ ] **Task 7.1.1** — Enhance `CommandPalette` to include real entity search. When user types in the palette, search across all entity types: Equipment, Chemicals, Samples, Clients, etc. Show results grouped by type with icons.
- [ ] **Task 7.1.2** — Add "Recent searches" section to CommandPalette showing last 5 searches (stored in localStorage).
- [ ] **Task 7.1.3** — Add keyboard shortcut hints in the palette footer (↑↓ Navigate, ↵ Select, ⎋ Close).

### 7.2 Search UX

- [ ] **Task 7.2.1** — Add search debounce (300ms) to `SearchFilter` to avoid excessive re-renders during fast typing.
- [ ] **Task 7.2.2** — Add "Clear" (×) button inside search input when query is non-empty.
- [ ] **Task 7.2.3** — Show result count next to search: "Showing 12 of 50 items".
- [ ] **Task 7.2.4** — Highlight matching text in search results (bold the matched substring in item names/descriptions).

### 7.3 Advanced Filtering

- [ ] **Task 7.3.1** — Add multi-select tag filters (e.g., filter by multiple statuses simultaneously, multiple categories).
- [ ] **Task 7.3.2** — Add date range filter component using `Calendar` — for filtering by creation date, expiry date, etc.
- [ ] **Task 7.3.3** — Add numeric range filter (e.g., quantity between 10–100, price range).
- [ ] **Task 7.3.4** — Create an "Advanced Filters" panel (slide-in sheet or collapsible section) for complex multi-criteria filtering.
- [ ] **Task 7.3.5** — Add filter chips that show active filters above the table/grid, each with an "×" button to remove.
- [ ] **Task 7.3.6** — Persist filters in URL query parameters so users can bookmark/share filtered views.

### 7.4 Saved Views

- [ ] **Task 7.4.1** — Allow users to save filter + sort + column combinations as named "Views" (e.g., "Low Stock Items", "Expiring Soon"). Store in localStorage.
- [ ] **Task 7.4.2** — Show saved views as quick-access tabs above the filter bar.
- [ ] **Task 7.4.3** — Add "Reset filters" button that clears all active filters and returns to default view.

---

## Phase 8 — Detail Pages & Entity Views

**Priority: P1 — High Impact**
**Estimated Effort: 3–4 days**

### 8.1 Enhanced Detail Layout

- [ ] **Task 8.1.1** — Add tabbed navigation within detail pages for complex entities: e.g., Equipment detail → tabs: Overview | Maintenance History | Usage Log | Documents.
- [ ] **Task 8.1.2** — Add "Related Items" section: show linked entities (e.g., Equipment detail shows its borrow records, Chemical detail shows experiments using it).
- [ ] **Task 8.1.3** — Add "Activity Log" / "Audit Trail" section showing recent actions on the entity (created, edited, status changed) with timestamps and user attribution.
- [ ] **Task 8.1.4** — Add inline quick-edit for simple fields (click to edit a field value without opening the full form dialog).
- [ ] **Task 8.1.5** — Add "Previous / Next" navigation arrows on detail pages to step through sibling entities without going back to the list.

### 8.2 Detail Page Actions

- [ ] **Task 8.2.1** — Add a floating action menu on detail pages ("Edit", "Duplicate", "Delete", "Print", "Share Link") — positioned as a sticky action bar or FAB.
- [ ] **Task 8.2.2** — Add "Duplicate Entity" action — opens create dialog pre-filled with current entity's data.
- [ ] **Task 8.2.3** — Add "Copy Link" action that copies a shareable deep-link to the entity's detail page.

### 8.3 Comparison View

- [ ] **Task 8.3.1** — Implement side-by-side comparison for 2–3 entities of the same type. Allow selecting items from the list page and opening them in a comparison table.

---

## Phase 9 — Dashboard & Data Visualization

**Priority: P1 — High Impact**
**Estimated Effort: 4–5 days**

### 9.1 Chart Interactivity

- [ ] **Task 9.1.1** — Add click-through on chart data points: clicking a bar/slice/area navigates to the filtered list (e.g., click "Chemicals" bar → navigate to Chemicals page filtered by that category).
- [ ] **Task 9.1.2** — Add brush/zoom on area/line charts: let users select a time range by dragging on the chart.
- [ ] **Task 9.1.3** — Add responsive legends: when chart container is narrow, move legend below the chart. Add legend item click-to-toggle series visibility.
- [ ] **Task 9.1.4** — Enhance chart tooltips: formatted numbers, percentage comparisons to previous period, color-coded indicators.
- [ ] **Task 9.1.5** — Add smooth entry animations on charts (bars grow from zero, lines draw progressively).

### 9.2 Dashboard Widgets

- [ ] **Task 9.2.1** — Add "Time Range" selector to dashboard header (Last 7 days / 30 days / 3 months / Year / Custom range) that filters all widgets.
- [ ] **Task 9.2.2** — Add KPI trend indicators: up/down arrows with percentage change and sparkline mini-charts on KPI cards.
- [ ] **Task 9.2.3** — Add widget "Expand" button to view any widget in full-screen modal for detailed inspection.
- [ ] **Task 9.2.4** — Add widget refresh button to individually reload a widget's data.
- [ ] **Task 9.2.5** — Create a "Favorites" or "My Dashboard" capability allowing users to customize which widgets appear and their layout order (drag-and-drop reorder, persisted in localStorage).

### 9.3 New Chart Types

- [ ] **Task 9.3.1** — Add a **Treemap** chart for inventory distribution by category + subcategory.
- [ ] **Task 9.3.2** — Add a **Funnel** chart for business pipeline (leads → proposals → contracts → active).
- [ ] **Task 9.3.3** — Add **Sparkline** mini-charts inline in table cells and KPI cards to show 7-day trends.
- [ ] **Task 9.3.4** — Add **Progress Ring** (circular progress) for goal tracking and completion metrics.
- [ ] **Task 9.3.5** — Add a **Calendar Heatmap** (GitHub-style contribution heatmap) for activity/transaction frequency.

### 9.4 Real-Time Feel

- [ ] **Task 9.4.1** — Add "Last updated" timestamp on dashboard with auto-refresh indicator.
- [ ] **Task 9.4.2** — Implement stale data indicator: dim widgets with "Refreshing..." overlay when data is being refetched.
- [ ] **Task 9.4.3** — Animate KPI values when they change (count-up animation using `CountUp` effect).

---

## Phase 10 — Authentication & Onboarding

**Priority: P2 — Medium Impact**
**Estimated Effort: 2–3 days**

### 10.1 Login Page Enhancement

- [ ] **Task 10.1.1** — Add a split-screen layout: left side shows branding/illustration (lab/plant imagery), right side shows login form.
- [ ] **Task 10.1.2** — Add "Remember me" checkbox to login form.
- [ ] **Task 10.1.3** — Add "Forgot password" link and flow (email input → "check your email" message — even if backend isn't ready, build the UI skeleton).
- [ ] **Task 10.1.4** — Add password visibility toggle (eye icon) on password fields.
- [ ] **Task 10.1.5** — Add subtle animated background or gradient effect on auth pages.
- [ ] **Task 10.1.6** — Display server-side field errors inline under each field (not just toast notifications).

### 10.2 Register Page Enhancement

- [ ] **Task 10.2.1** — Add password strength indicator: colored progress bar (Red → Orange → Green) + text label (Weak / Fair / Strong / Very Strong).
- [ ] **Task 10.2.2** — Add real-time password requirement checklist: ✓ 8+ characters, ✓ Uppercase, ✓ Number, ✓ Special character — each lights up green when met.
- [ ] **Task 10.2.3** — Add email format hint/validation as user types.
- [ ] **Task 10.2.4** — Add "Terms of Service" and "Privacy Policy" checkbox (even if placeholder links).

### 10.3 Onboarding Flow

- [ ] **Task 10.3.1** — Build a first-time user welcome modal/wizard:
  - Step 1: "Welcome to Plant Lab Inventory!" with product overview
  - Step 2: "Set up your profile" (upload avatar, set preferences)
  - Step 3: "Quick tour" highlights with tooltips pointing to key UI elements
  - Step 4: "You're ready!" with links to most common actions

- [ ] **Task 10.3.2** — Add contextual "?" help tooltips on complex UI elements (hover to see explanation).
- [ ] **Task 10.3.3** — Add a "What's New" changelog modal accessible from user menu, showing recent feature additions.

### 10.4 Landing Page

- [ ] **Task 10.4.1** — Build the `LandingPage.tsx` (currently empty file). Create a marketing-style landing page with:
  - Hero section with headline, subheadline, CTA buttons (Login / Register)
  - Feature showcase sections with icons and descriptions
  - Screenshot/mockup previews
  - Footer with links

---

## Phase 11 — Notification & Feedback System

**Priority: P1 — High Impact**
**Estimated Effort: 2–3 days**

### 11.1 Toast System Cleanup

- [ ] **Task 11.1.1** — Remove the redundant Radix Toast system (`toaster.tsx`, `toast.tsx`, `use-toast.ts`). Standardize entirely on Sonner.
- [ ] **Task 11.1.2** — Style Sonner toasts to match design system: use success/warning/destructive tokens, add icons per type, use Inter font.
- [ ] **Task 11.1.3** — Add action buttons in toasts where appropriate (e.g., "Undo" after delete, "View" after create).
- [ ] **Task 11.1.4** — Add progress toasts for long-running operations (e.g., bulk import/export with progress bar in toast).

### 11.2 Notification Center

- [ ] **Task 11.2.1** — Build a `NotificationPanel` dropdown attached to the bell icon in TopNav:
  - List of notifications with read/unread state (dot indicator)
  - Notification types: info, warning, success, error — each with icon
  - "Mark all as read" action
  - "View all" link to a full notifications page
  - Relative timestamps ("2 hours ago")

- [ ] **Task 11.2.2** — Build a full `NotificationsPage` with:
  - Filterable notification list (All / Unread / Type filters)
  - Pagination
  - Individual dismiss / mark-as-read actions

- [ ] **Task 11.2.3** — Replace the hardcoded "3" badge on the bell icon with a dynamic unread count.
- [ ] **Task 11.2.4** — Add notification types specific to the domain:
  - Chemical expiry warnings
  - Overdue borrow alerts
  - Low stock notifications
  - Maintenance reminders
  - Contract renewal alerts
  - Payment due notices

### 11.3 In-App Feedback

- [ ] **Task 11.3.1** — Add a "Feedback" button in the sidebar or footer that opens a simple feedback form (textarea + category dropdown + submit).
- [ ] **Task 11.3.2** — Add confirmation animations: checkmark success animation after successful form submission (not just toast).

---

## Phase 12 — Image & File Management

**Priority: P2 — Medium Impact**
**Estimated Effort: 2–3 days**

### 12.1 Image Upload Enhancement

- [ ] **Task 12.1.1** — Add file size validation with clear error message (e.g., "File exceeds 5 MB limit. Please choose a smaller file.").
- [ ] **Task 12.1.2** — Add image crop/resize before upload using a cropping library (e.g., `react-image-crop` or `react-easy-crop`).
- [ ] **Task 12.1.3** — Add upload progress indicator (progress bar or percentage).
- [ ] **Task 12.1.4** — Support multiple image upload (gallery) — allow attaching multiple images per entity.
- [ ] **Task 12.1.5** — Add image compression on client-side before upload to reduce file sizes.

### 12.2 Image Display

- [ ] **Task 12.2.1** — Add lightbox/fullscreen image viewer: clicking an image opens it in a modal with zoom and pan capabilities.
- [ ] **Task 12.2.2** — Add lazy loading for images with blur-up placeholder effect (low-res preview → sharp image).
- [ ] **Task 12.2.3** — Improve `ImageWithFallback`: add a subtle loading skeleton before the image loads.
- [ ] **Task 12.2.4** — In grid view, make all card images the same aspect ratio with `object-cover` to prevent layout shifts.

### 12.3 Document Attachments

- [ ] **Task 12.3.1** — Create a `FileAttachment` component for uploading non-image files (PDF manuals, datasheets, certificates).
- [ ] **Task 12.3.2** — Display attached files as a list with file type icon, filename, size, and download button.
- [ ] **Task 12.3.3** — Add in-browser PDF preview for attached documents.

---

## Phase 13 — Mobile & Responsive Excellence

**Priority: P1 — High Impact**
**Estimated Effort: 3–4 days**

### 13.1 Mobile Table Alternative

- [ ] **Task 13.1.1** — Create a `ResponsiveTable` wrapper that renders the normal `<Table>` on desktop (≥768px) and a stacked card list on mobile (<768px). Each "card" shows the key columns as label-value pairs.
- [ ] **Task 13.1.2** — Apply `ResponsiveTable` to all table-heavy pages: BorrowRecords, MaintenanceRecords, Achievements, Payments, InventoryReportPage, Contracts.
- [ ] **Task 13.1.3** — Add horizontal scroll indicators on tables (gradient fade on edges) to hint that the table is scrollable.

### 13.2 Mobile Navigation

- [ ] **Task 13.2.1** — Enhance the mobile slide-in sidebar: add section tab switching inside the drawer, add user info at bottom.
- [ ] **Task 13.2.2** — Add swipe gestures: swipe right to open sidebar, swipe left to close. Use `@use-gesture/react` or similar.
- [ ] **Task 13.2.3** — Add pull-to-refresh on mobile list pages.
- [ ] **Task 13.2.4** — Make the mobile bottom nav show the current sub-page name (not just section icons).

### 13.3 Mobile Form Optimization

- [ ] **Task 13.3.1** — On mobile, open form dialogs as full-screen sheets (bottom-up slide) instead of centered modals, using shadcn `Sheet` component.
- [ ] **Task 13.3.2** — Increase touch target sizes on mobile: all buttons ≥ 44×44px, adequate spacing between interactive elements.
- [ ] **Task 13.3.3** — Add mobile-optimized date picker (bottom sheet calendar instead of dropdown).

### 13.4 Responsive Dashboard

- [ ] **Task 13.4.1** — Make dashboard widgets stack vertically on mobile with proper card padding.
- [ ] **Task 13.4.2** — Chart containers should be touch-scrollable horizontally on mobile.
- [ ] **Task 13.4.3** — KPI cards should use a horizontal scroll (snap) on mobile instead of 2-column grid.

---

## Phase 14 — Micro-Interactions & Animation

**Priority: P2 — Delight**
**Estimated Effort: 2–3 days**

The animation system in `animations.css` defines many classes that are never used. Time to activate them.

### 14.1 Page Transitions

- [ ] **Task 14.1.1** — Enhance `PageTransition` with more sophisticated transitions: slide-in from right for forward navigation, slide-in from left for back navigation (route-direction-aware).
- [ ] **Task 14.1.2** — Add staggered entrance animation for card grids: each card fades in with a 50ms delay using `.stagger-children` classes already defined.
- [ ] **Task 14.1.3** — Add table row entrance animation: rows slide in from left with stagger.

### 14.2 Interactive Element Feedback

- [ ] **Task 14.2.1** — Apply `hover-lift` (translateY -2px + shadow) to all cards: `ProductCard`, stat cards, dashboard widgets.
- [ ] **Task 14.2.2** — Apply `press-effect` (scale 0.97) to all buttons for tactile click feedback.
- [ ] **Task 14.2.3** — Add `ripple-button` effect to primary action buttons.
- [ ] **Task 14.2.4** — Animate sidebar navigation active state change (sliding indicator background like macOS sidebar).
- [ ] **Task 14.2.5** — Add subtle scale animation on hover for icon buttons (1.1x scale).

### 14.3 Data Change Animations

- [ ] **Task 14.3.1** — Flash highlight animation when a table row is newly added (green flash) or updated (yellow flash).
- [ ] **Task 14.3.2** — Smooth number transitions on KPI counters: count-up from previous value to new value using `requestAnimationFrame` or a `CountUp` component.
- [ ] **Task 14.3.3** — Slide-out animation when deleting a row (collapse + fade).
- [ ] **Task 14.3.4** — Add success confetti or checkmark burst animation after creating a new entity.

### 14.4 Scroll-Based Animations

- [ ] **Task 14.4.1** — Apply `.scroll-reveal` (from `animations.css`) to dashboard sections, landing page sections, and long detail pages using `IntersectionObserver`.
- [ ] **Task 14.4.2** — Add scroll progress indicator on long pages (thin progress bar at top of viewport).

---

## Phase 15 — Accessibility (WCAG AAA)

**Priority: P1 — Required**
**Estimated Effort: 2–3 days**

The foundation is good (skip link, ARIA roles, keyboard shortcuts, focus-visible). These tasks push to AAA compliance.

### 15.1 Semantic HTML Fixes

- [ ] **Task 15.1.1** — Replace `ProductCard`'s `div` + `role="button"` with native `<button>` or `<a>` element for proper keyboard behavior and screen reader semantics.
- [ ] **Task 15.1.2** — Add `aria-label` to all icon-only action buttons in table rows (Edit, Delete, View) across all pages. Label format: "Edit [entity name]", "Delete [entity name]".
- [ ] **Task 15.1.3** — Add `role="row"` and `role="gridcell"` to table rows/cells for proper ARIA grid navigation when using the DataTable component.
- [ ] **Task 15.1.4** — Link all form `<Label>` elements with `htmlFor` matching input `id` — currently missing in PlantSamples and other inline form dialogs.

### 15.2 Screen Reader Enhancements

- [ ] **Task 15.2.1** — Add `aria-live="polite"` announcements for:
  - Search result counts changing ("12 results found")
  - Table sort changes ("Sorted by name, ascending")
  - Filter changes ("Filtered to show 'Active' status only")
  - Pagination changes ("Showing page 2 of 5")

- [ ] **Task 15.2.2** — Add screen reader-only text (`.sr-only`) for visual indicators:
  - Status badge colors should have text equivalents
  - Chart data should have a hidden data table alternative
  - Icon-only buttons should always have text labels

- [ ] **Task 15.2.3** — Add `aria-describedby` to form fields linking to their hint text / error messages.

### 15.3 Keyboard Navigation

- [ ] **Task 15.3.1** — Ensure all modal dialogs trap focus properly (Tab cycling within dialog boundaries).
- [ ] **Task 15.3.2** — Add keyboard shortcuts for common list actions:
  - `n` — New item
  - `/` — Focus search
  - `g + i` — Go to Inventory
  - `g + r` — Go to Research
  - `g + b` — Go to Business
  - `?` — Show keyboard shortcuts panel

- [ ] **Task 15.3.3** — Ensure `Escape` closes all modals, popovers, and dropdowns.
- [ ] **Task 15.3.4** — Add visible focus indicators to all interactive elements (`:focus-visible` — already partially implemented, audit for completeness).

### 15.4 Color Contrast & Readability

- [ ] **Task 15.4.1** — Audit all text color combinations against WCAG AAA standards (7:1 contrast ratio for normal text, 4.5:1 for large text). Fix any failures.
- [ ] **Task 15.4.2** — Ensure status badges don't rely solely on color — add icons or patterns for each status (e.g., checkmark for success, warning triangle for warning).

---

## Phase 16 — Performance & Perceived Speed

**Priority: P2 — Optimization**
**Estimated Effort: 2–3 days**

### 16.1 Code Splitting

- [ ] **Task 16.1.1** — Add route-level lazy loading with `React.lazy()` + `Suspense` for each feature module:
  - `features/inventory/*` → lazy chunk
  - `features/business/*` → lazy chunk
  - `features/research/*` → lazy chunk
  - `features/reports/*` → lazy chunk
  - `features/admin/*` → lazy chunk

- [ ] **Task 16.1.2** — Lazy-load heavy components: chart widgets, form dialogs, command palette.
- [ ] **Task 16.1.3** — Add route prefetching: when hovering a nav link, start loading that route's chunk.

### 16.2 Virtualization

- [ ] **Task 16.2.1** — Add list virtualization for pages with 100+ items using `@tanstack/react-virtual` or `react-window`:
  - Equipment list/table
  - Chemical list/table
  - Transaction logs
  - Notification list

- [ ] **Task 16.2.2** — Add virtualization to long select/combobox dropdowns (50+ options).

### 16.3 Perceived Performance

- [ ] **Task 16.3.1** — Implement optimistic updates for CRUD operations: show the change immediately in the UI, then confirm/rollback when the server responds.
- [ ] **Task 16.3.2** — Add instant navigation feedback: show a thin progress bar at the top of the page (NProgress-style) during route transitions.
- [ ] **Task 16.3.3** — Pre-populate form fields when editing: show current values immediately (from cache), don't wait for a fresh fetch.
- [ ] **Task 16.3.4** — Use `TanStack Query` stale-while-revalidate pattern: show cached data immediately, refresh in background.

---

## Phase 17 — Dark Mode Polish

**Priority: P2 — Quality**
**Estimated Effort: 1–2 days**

### 17.1 Visual Refinement

- [ ] **Task 17.1.1** — Audit all pages in dark mode for:
  - Card borders that are too harsh or invisible
  - Input fields that lack sufficient contrast against card backgrounds
  - Drop shadows that look wrong (should be more subtle or use `rgba(0,0,0,0.x)`)
  - Images that feel too bright (add a subtle overlay or lower opacity)

- [ ] **Task 17.1.2** — Add distinct hover states for dark mode (dark mode hover states should be lighter, not just transparent).
- [ ] **Task 17.1.3** — Ensure chart colors are optimized for dark backgrounds (more vivid, higher saturation).
- [ ] **Task 17.1.4** — Add smooth color transition when switching between light/dark mode (the transition is enabled but verify all elements animate properly).

### 17.2 Dark Mode Specific Tweaks

- [ ] **Task 17.2.1** — In dark mode, logo/brand images should use light variants (if applicable).
- [ ] **Task 17.2.2** — Dark mode empty state illustrations should use muted tones.
- [ ] **Task 17.2.3** — Glassmorphism effects (`.glass-card`, `.glass-nav`) should use different backdrop values for dark mode to maintain the frosted glass feel.

---

## Phase 18 — Advanced Enterprise Features

**Priority: P3 — Differentiator**
**Estimated Effort: 5–7 days**

### 18.1 Drag-and-Drop

- [ ] **Task 18.1.1** — Add drag-and-drop card reordering in grid view (for manual prioritization).
- [ ] **Task 18.1.2** — Add drag-and-drop column reordering in table headers.
- [ ] **Task 18.1.3** — Add drag-and-drop dashboard widget rearrangement.
- [ ] **Task 18.1.4** — Add Kanban board view option for status-based entities (BorrowRecords by status, Contracts by stage).

### 18.2 User Preferences

- [ ] **Task 18.2.1** — Build a `Preferences` page (currently non-functional menu item):
  - Theme selection (Light / Dark / System)
  - Default view mode (Grid / Table)
  - Default page size (10 / 20 / 50)
  - Date format preference
  - Language/locale selection (future-ready)
  - Notification preferences

- [ ] **Task 18.2.2** — Persist all UI preferences in localStorage (and optionally sync to backend user profile).

### 18.3 Data Import/Export

- [ ] **Task 18.3.1** — Add "Import CSV" dialog: file upload, column mapping UI, preview of first 5 rows, confirm import.
- [ ] **Task 18.3.2** — Add template CSV download for each entity type.
- [ ] **Task 18.3.3** — Add "Export" button on list pages: export current view (with filters applied) to CSV / Excel / PDF.

### 18.4 Multi-Select & Batch Operations UI

- [ ] **Task 18.4.1** — Add "Selection mode" toggle to switch between click-to-view and click-to-select modes on card grids.
- [ ] **Task 18.4.2** — Add drag-select (marquee selection) on card grids.

### 18.5 Audit Trail UI

- [ ] **Task 18.5.1** — Build an `AuditLog` component showing entity change history:
  - Timeline view with user avatar, action description, timestamp
  - Diff view for field changes (old value → new value)
  - Filter by user, action type, date range

---

## Phase 19 — Print, Export & Sharing

**Priority: P3 — Professional Polish**
**Estimated Effort: 1–2 days**

### 19.1 Print Styles

- [ ] **Task 19.1.1** — Create `@media print` stylesheet:
  - Hide sidebar, TopNav, MobileBottomNav
  - Hide action buttons, search filters, pagination controls
  - Expand content to full width
  - Use serif font for better print readability
  - Break pages cleanly at section boundaries
  - Add header/footer with entity name and print date

- [ ] **Task 19.1.2** — Add "Print" button to detail pages and report pages.
- [ ] **Task 19.1.3** — Add print-optimized report layout for `InventoryReportPage`.

### 19.2 PDF Export

- [ ] **Task 19.2.1** — Add client-side PDF generation for detail pages (using `html2pdf.js` or `@react-pdf/renderer`).
- [ ] **Task 19.2.2** — Add PDF export for inventory reports with charts rendered as images.

### 19.3 Sharing

- [ ] **Task 19.3.1** — Add "Copy Link" button on detail pages that copies the deep-link URL to clipboard with toast confirmation.
- [ ] **Task 19.3.2** — Add QR code generation for entity detail pages (useful for physical asset labeling).

---

## Phase 20 — Final Polish & Delight

**Priority: P3 — The Last Mile**
**Estimated Effort: 2–3 days**

### 20.1 Branding & Visual Identity

- [ ] **Task 20.1.1** — Design and add a proper SVG logo (not just text) for the Plant Lab brand.
- [ ] **Task 20.1.2** — Add favicon (currently using Vite default).
- [ ] **Task 20.1.3** — Add `<meta>` tags for SEO and social sharing (Open Graph, Twitter Card).
- [ ] **Task 20.1.4** — Add loading splash screen on initial app load (logo + spinner before React bundle loads).

### 20.2 404 & Error Routes

- [ ] **Task 20.2.1** — Build a custom 404 page with friendly illustration, message, and search bar / nav links.
- [ ] **Task 20.2.2** — Build a 403 / Unauthorized page for protected routes.
- [ ] **Task 20.2.3** — Build a maintenance/offline page.

### 20.3 Keyboard Power-User Features

- [ ] **Task 20.3.1** — Enhance `KeyboardShortcutsPanel` to show all available shortcuts organized by category (Navigation, Actions, Views).
- [ ] **Task 20.3.2** — Add vim-style `j/k` navigation for moving up/down in lists and tables.
- [ ] **Task 20.3.3** — Add `Ctrl+S` / `⌘S` to save forms (prevent default browser save).

### 20.4 Contextual Help

- [ ] **Task 20.4.1** — Add tooltip hints on complex form fields explaining what the field means and what format is expected.
- [ ] **Task 20.4.2** — Add spotlight/coach-mark tutorial for first-time users highlighting key UI areas.
- [ ] **Task 20.4.3** — Add "?" shortcut to open keyboard shortcuts panel.

### 20.5 Fun & Engagement

- [ ] **Task 20.5.1** — Add a subtle confetti animation when user reaches an achievement/milestone.
- [ ] **Task 20.5.2** — Add personalized greeting on dashboard: "Good morning, [Name]" based on time of day.
- [ ] **Task 20.5.3** — Add a skeleton "Fun Fact" or "Tip of the Day" widget on the dashboard.

---

## Summary: Priority Matrix

| Priority | Phase    | Est. Effort | Description                                                   |
| -------- | -------- | ----------- | ------------------------------------------------------------- |
| **P0**   | Phase 1  | 2–3 days    | Design system enforcement (typography, spacing, color tokens) |
| **P0**   | Phase 2  | 3–5 days    | Component consolidation (ListPage migration, dedup)           |
| **P0**   | Phase 6  | 2 days      | Loading, error, empty states                                  |
| **P1**   | Phase 3  | 2–3 days    | Navigation & sidebar enhancements                             |
| **P1**   | Phase 4  | 4–5 days    | Data Tables 2.0 (TanStack Table, sort, select, resize)        |
| **P1**   | Phase 5  | 3–4 days    | Forms & validation (react-hook-form everywhere)               |
| **P1**   | Phase 7  | 3–4 days    | Search & filtering                                            |
| **P1**   | Phase 8  | 3–4 days    | Detail pages & entity views                                   |
| **P1**   | Phase 9  | 4–5 days    | Dashboard & data visualization                                |
| **P1**   | Phase 11 | 2–3 days    | Notification system                                           |
| **P1**   | Phase 13 | 3–4 days    | Mobile & responsive excellence                                |
| **P1**   | Phase 15 | 2–3 days    | Accessibility (WCAG AAA)                                      |
| **P2**   | Phase 10 | 2–3 days    | Authentication & onboarding                                   |
| **P2**   | Phase 12 | 2–3 days    | Image & file management                                       |
| **P2**   | Phase 14 | 2–3 days    | Micro-interactions & animation                                |
| **P2**   | Phase 16 | 2–3 days    | Performance & perceived speed                                 |
| **P2**   | Phase 17 | 1–2 days    | Dark mode polish                                              |
| **P3**   | Phase 18 | 5–7 days    | Advanced enterprise features                                  |
| **P3**   | Phase 19 | 1–2 days    | Print, export & sharing                                       |
| **P3**   | Phase 20 | 2–3 days    | Final polish & delight                                        |

---

## Total Estimated Effort

| Priority            | Effort          |
| ------------------- | --------------- |
| P0 (Must Do)        | **7–10 days**   |
| P1 (High Impact)    | **27–35 days**  |
| P2 (Medium)         | **10–14 days**  |
| P3 (Differentiator) | **8–12 days**   |
| **Total**           | **~52–71 days** |

---

## Key Metrics After Completion

| Metric                     | Current           | Target                               |
| -------------------------- | ----------------- | ------------------------------------ |
| Design token adoption      | ~30%              | 100%                                 |
| Component reuse (ListPage) | 2 of 11 pages     | 11 of 11 pages                       |
| Loading state coverage     | 2 of 11 pages     | 11 of 11 pages                       |
| Error state coverage       | 2 of 11 pages     | 11 of 11 pages                       |
| Form validation (zod)      | 2 of 11 forms     | 11 of 11 forms                       |
| a11y compliance            | WCAG AA (partial) | WCAG AAA                             |
| Table features             | Static only       | Sort, filter, select, resize, export |
| Mobile table support       | Overflow          | Responsive card alternative          |
| Status badge systems       | 3 competing       | 1 unified                            |
| Animation utilization      | ~10% of defined   | ~90% of defined                      |
| Lighthouse a11y score      | ~85               | 98+                                  |
| Lighthouse perf score      | ~80               | 95+                                  |

---

> **Document maintained by**: Tech Lead / UX Designer
> **Last updated**: 2025
> **Version**: 1.0
