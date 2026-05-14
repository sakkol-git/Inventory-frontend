# Inventory Module — UI Audit Report

**Date:** March 4, 2026  
**Scope:** All pages under `src/pages/inventory/`  
**Total pages audited:** 24 pages + 6 report sub-pages + multiple detail renderers

---

## Executive Summary

The inventory module contains two distinct generation tiers of pages:

- **Modern pages** (Chemicals, Equipment, PlantSpecies, PlantStock, PlantSamples, PlantVarieties, BorrowRecords, Transactions, Users, Dashboard, and all detail pages) — built with a clean hook-driven architecture and shared component system.
- **Legacy pages** (MaintenanceRecords, ChemicalBatches, Achievements, OverdueBorrows, PendingApprovals, UserDocuments, Plants, UserProfile, and all report pages) — built with ad-hoc inline state, inconsistent styling, and missing standard patterns.

The gap between these two tiers produces extreme visual inconsistency, broken responsiveness, and several non-functional features.

---

## Section 1 — Broken / Non-Functional Pages

### FLAW-01 · `Plants.tsx` — Entire Page is Mock / Non-Functional

**Severity: Critical**

- Uses a hardcoded `plantData` array. No API call exists. Data never reflects reality.
- The two `<Select>` filters (Stage, Location) have no `onValueChange` handler. Selection does nothing.
- The "Add Plant Stock" button has no `onClick` handler. Clicking it does nothing.
- Uses custom CSS class strings `"status-pill status-seed"`, `"status-pill status-growing"`, etc. These classes likely do not exist in Tailwind or the stylesheet, resulting in unstyled status pills.
- Builds its own non-standard header `<div class="flex flex-col sm:flex-row ...">` instead of `<PageHeader>`. Diverges from every other page visually.
- The table has no border wrapper — renders as a floating, unstyled table.
- **This page is a dead placeholder and should be replaced or removed.**

---

### FLAW-02 · `UserProfile.tsx` — Hardcoded Mock Data, No Persistence

**Severity: Critical**

- Imports `currentUser` and `researchAchievementsData` from `@/data/mockUserData`. No real user data from the API.
- Achievement CRUD (create, edit, delete) only operates on local `useState`. Changes are lost on page refresh.
- The `handleSave` function calls `toast({ title: "Updated" })` giving false confidence that changes were saved to any backend.

---

### FLAW-03 · `InventoryReportPage.tsx` — Renders Raw JSON in UI

**Severity: High**

```tsx
<p className="text-2xl font-bold">{JSON.stringify(value)}</p>
```

Any report value that is an object or array renders as ugly JSON string (e.g., `{"total":120,"active":90}`). This is unreadable and looks broken to users.

---

### FLAW-04 · Item Identification Missing in Borrow-Adjacent Pages

**Severity: High**  
**Affects:** `OverdueBorrows.tsx`, `PendingApprovals.tsx`, `BorrowedItemsReportPage.tsx`

All three pages display the borrowed item as:

```
equipment #12
```

…instead of the item's actual name. Users cannot identify what was borrowed without memorizing IDs. The `item.type + " #" + item.id` pattern is used throughout, but the item's name/title is never shown.

---

## Section 2 — Responsiveness Issues

### FLAW-05 · Tables Missing `overflow-x-auto` on Legacy Pages

**Severity: High**  
**Affects:** `MaintenanceRecords`, `ChemicalBatches`, `Achievements`, `OverdueBorrows`, `PendingApprovals`, `UserDocuments`, all 5 report table pages

These pages wrap their tables in:

```html
<div class="mt-6 rounded-lg border"></div>
```

There is no `overflow-x-auto` applied. On mobile or narrow viewports, table content overflows the page boundary without a scrollbar, causing horizontal layout breakage.

Modern pages use `"rounded-xl overflow-hidden border border-border/40"` which implicitly clips overflow but also does not allow scrolling. The correct fix is to add `overflow-x-auto` to the wrapper div on all table pages.

---

### FLAW-06 · `BorrowRecords` Table Has 10 Columns — Unusable on Mobile

**Severity: High**

The BorrowTable renders: ID, User, Item, Type, Qty, Status, Borrowed, Due, Returned, Actions — 10 columns. On any screen narrower than ~1100px this overflows.  
No responsive column-hiding strategy exists. Columns like "Type", "Borrowed", "Returned" become unreadable on tablet/mobile.

---

### FLAW-07 · `PendingApprovals` — Approve/Reject Buttons Break on Narrow Rows

**Severity: Medium**

The actions cell contains:

```html
<div class="flex justify-end gap-2">
  <button>Approve</button>
  <button variant="destructive">Reject</button>
</div>
```

Two full-width labeled buttons side-by-side in a table column. On medium screens (~768px), these overflow the cell or force the row to an awkward height. No icon-only fallback for small screens.

---

### FLAW-08 · `aspect-square` Cards Are Too Small on Small Screens

**Severity: Medium**  
**Affects:** Chemicals, Equipment, PlantSamples, PlantVarieties, PlantStock grid views

The grid uses `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4` with `className="aspect-square"` on each card. On a 375px phone viewport in 1-column layout, the cards are wide but the aspect-square constraint makes them excessively tall — the card content then has to compress awkwardly inside that fixed square.

---

### FLAW-09 · Dashboard Grid Breakpoints Require `xl` for Multi-Column Layout

**Severity: Medium**

All three dashboard tab layouts (`renderOverviewLayout`, `renderAnalyticsLayout`, `renderInsightsLayout`) use `grid-cols-1 xl:grid-cols-2` for the paired widget layout. The `xl` breakpoint is 1280px. Between 768px and 1279px (typical tablets and small laptops) every widget is full-width and stacked, making the dashboard extremely long.

---

## Section 3 — Visual Consistency Issues

### FLAW-10 · `PageHeader` Props Used in Two Incompatible Ways

**Severity: High**  
**Affects:** ALL pages

The `PageHeader` component supports both `icon={IconComponent}` and `icon={<Icon className="h-6 w-6" />}` via internal detection logic, plus `description` vs `subtitle` aliases.

**Modern pages:**

```tsx
<PageHeader icon={Wrench} title="Equipment" description="..." />
// Icon rendered at h-5 w-5 (by PageHeader internally)
```

**Legacy pages:**

```tsx
<PageHeader
  title="Maintenance Records"
  subtitle="..."
  icon={<Wrench className="h-6 w-6" />}
/>
// Icon rendered at h-6 w-6 (set by the caller)
```

Result: page header icons are **20px on modern pages** and **24px on legacy pages**. The muted-foreground wrapping div and alignment differ. Every page header looks slightly different.

---

### FLAW-11 · Loading State — Three Different Implementations

**Severity: High**

| Pattern                                                                            | Pages                                                                                                 |
| ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `<LoadingState text="..." />` component                                            | PlantSpecies only                                                                                     |
| `<p class="text-sm text-muted-foreground text-center py-12">Loading…</p>`          | Equipment, BorrowRecords, Transactions, Users                                                         |
| `<TableRow><TableCell colSpan={n}>Loading…</TableCell></TableRow>` inline in table | MaintenanceRecords, ChemicalBatches, Achievements, OverdueBorrows, PendingApprovals, all report pages |
| No loading state at all                                                            | Chemicals, PlantSamples, PlantVarieties, PlantStock (filtered client-side)                            |

No skeleton loaders anywhere — card grids show nothing until data arrives.

---

### FLAW-12 · Error State — Four Different Implementations

**Severity: High**

| Pattern                                                                       | Pages                                                                    |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `<EmptyState icon={Leaf} title="Failed to load..." />`                        | PlantSpecies                                                             |
| `<p class="text-sm text-destructive text-center py-12">Failed to load...</p>` | Equipment, BorrowRecords, Transactions                                   |
| Empty table with no error indication                                          | MaintenanceRecords, ChemicalBatches, OverdueBorrows, PendingApprovals    |
| No error state at all                                                         | Chemicals, PlantSamples, PlantVarieties, PlantStock, UserProfile, Plants |

Legacy pages silently show an empty table if the API fails. Users cannot distinguish "no data" from "fetch failed".

---

### FLAW-13 · Empty State — Three Different Implementations

**Severity: Medium**

| Pattern                                                       | Pages                                                         |
| ------------------------------------------------------------- | ------------------------------------------------------------- |
| `<EmptyState icon={X} title="..." description="..." />`       | Chemicals, Equipment, BorrowRecords, PlantSpecies, PlantStock |
| `<EmptyState title="..." description="..." />` (no icon)      | PlantSamples, PlantVarieties                                  |
| Raw `<TableCell colSpan={n}>No records found.</TableCell>`    | All legacy pages                                              |
| Plain `<div>Loading report…</div>` with no empty state at all | InventoryReportPage                                           |

---

### FLAW-14 · Table Wrapper Class Is Inconsistent

**Severity: Medium**

Three different wrapper patterns in use simultaneously:

```html
<!-- Modern (most list pages) -->
<div class="rounded-xl overflow-hidden border border-border/40">
  <!-- Partial modern (PlantSamples, PlantVarieties) -->
  <div class="border rounded-lg overflow-hidden">
    <!-- Legacy (all legacy pages + reports) -->
    <div class="mt-6 rounded-lg border"></div>
  </div>
</div>
```

The visual result is different border radius, border opacity, spacing above the table, and overflow behavior.

---

### FLAW-15 · Search + Filter Layout Inconsistent

**Severity: Medium**

**Canonical pattern** (Chemicals, Equipment, PlantSpecies, PlantStock, BorrowRecords):

```tsx
<SearchFilter query={...} onQueryChange={...} placeholder="...">
  <FilterSelect />
  <ViewToggle />
</SearchFilter>
```

**Custom wrapper pattern** (PlantSamples, PlantVarieties):

```tsx
<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
  <SearchFilter query={...} onQueryChange={...} placeholder="..." />
  <div class="flex items-center gap-2">
    <Select ... />
    <ViewToggle ... />
  </div>
</div>
```

**Fully custom raw pattern** (Plants.tsx):

```tsx
<div class="relative flex-1">
  <Search class="absolute left-3..." />
  <Input ... />
</div>
<Select ... />
<Select ... />
```

The three patterns render differently in spacing, alignment, and responsive stacking.

---

### FLAW-16 · Pagination — Inconsistent Implementation

**Severity: Medium**

| Pages with footer pagination           | Equipment, BorrowRecords, Transactions, Users                            |
| -------------------------------------- | ------------------------------------------------------------------------ |
| **Pages with count-only footer**       | Chemicals, PlantSpecies, PlantStock                                      |
| **Pages with NO footer or pagination** | PlantSamples, PlantVarieties, Plants, all legacy pages, all report pages |

Pagination uses raw `<Button>` components in a manual `<footer>` element rather than the shared `<Pagination>` component that exists at `@/components/shared/Pagination.tsx`. That shared component goes completely unused across all inventory list pages.

---

### FLAW-17 · Dashboard Has a Duplicate Local `PageHeader` Component

**Severity: Medium**

`InventoryDashboardRenderer.tsx` defines its own local `PageHeader`:

```tsx
const PageHeader = ({ header }: PageHeaderProps) => (
  <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between border-b border-border pb-6 gap-4">
    <h1 class="text-3xl font-medium text-foreground">...</h1>
  </div>
);
```

Differences vs the shared PageHeader:

- `text-3xl` vs `text-2xl` on all other pages.
- `border-b border-border pb-6` underlining vs no underline.
- `lg:flex-row` breakpoint vs `sm:flex-row`.
- Has a "date label" element in the right corner, other pages don't.

The dashboard visually looks like a different product's header.

---

### FLAW-18 · Action Button Sizing Is Inconsistent Across Tables

**Severity: Low**

Four different button size patterns for icon-only row actions:

```tsx
// Pattern A — Chemicals table
<Button size="sm" className="h-7 w-7 p-0">

// Pattern B — PlantSamples / PlantVarieties table
<Button size="icon" className="h-7 w-7">

// Pattern C — Legacy pages (MaintenanceRecords, ChemicalBatches, etc.)
<Button size="icon">   // default h-10 w-10, much larger

// Pattern D — Equipment cards
<Button size="sm" className="h-9 w-9 p-0 shrink-0">
```

This means delete/edit buttons appear as 28px, 28px, 40px, or 36px depending on the page, with no design rationale.

---

### FLAW-19 · `ChemicalBatches` and `MaintenanceRecords` Display Raw Date Strings

**Severity: Medium**

`ChemicalBatches.tsx`:

```tsx
<TableCell>
  <Badge variant={batch.is_expired ? "destructive" : "outline"}>
    {batch.expiry_date} {/* raw ISO string e.g. "2025-03-15" */}
  </Badge>
</TableCell>
```

`MaintenanceRecords.tsx`:

```tsx
<TableCell>{record.started_at}</TableCell>  {/* raw "2025-03-15T10:00:00.000000Z" */}
```

All modern pages use `formatDisplayDate()` / `formatDate()` / `formatTimestamp()` helpers. The legacy pages output raw ISO date/datetime strings directly, which is unformatted and confusing.

---

### FLAW-20 · `Achievements` Page Shows Raw Enum Values with Zero Labeling

**Severity: Low**

```tsx
<TableCell>{ach.criteria_type}</TableCell>   // e.g. "transaction_count"
<TableCell>{ach.criteria_value}</TableCell>  // e.g. "100"
```

No `formatEnumLabel()` is applied. The icon field (emoji string) is prepended to the name but never previewed separately. Users see raw database enum values throughout.

---

## Section 4 — User-Friendliness Issues

### FLAW-21 · No Back Navigation on Standalone Pages

**Severity: High**  
**Affects:** `OverdueBorrows`, `PendingApprovals`, `MaintenanceRecords`, `ChemicalBatches`, `UserDocuments`, `Achievements`, all 5 report pages

None of these pages have a back button, breadcrumb, or contextual navigation. Users can only use the browser back button or the sidebar. In contrast, all detail pages (`ChemicalDetail`, `EquipmentDetail`, etc.) have back navigation via the `DetailLayout` framework. The standalone secondary pages are stranded.

---

### FLAW-22 · No Skeleton / Placeholder Cards in Grid Views

**Severity: Medium**

When loading, the grid pages (Chemicals, Equipment, PlantSamples, PlantVarieties) show a plain text string:

```
Loading equipment…
```

No skeleton cards appear. The layout collapses to a single text line and then suddenly expands when data arrives, creating a jarring content jump (layout shift).

---

### FLAW-23 · `Chemicals` and `PlantStock` Show Empty State During Loading

**Severity: Medium**

These pages check `hasResults` without checking `isLoading`:

```tsx
{!hasResults && (
  <EmptyState icon={...} title="No chemicals found" />
)}
```

If data hasn't loaded yet and `filteredItems` is empty, the EmptyState renders immediately and then disappears once data arrives. Users briefly see "No chemicals found" even when chemicals exist.

---

### FLAW-24 · Equipment Card Has Overlapping Action Buttons

**Severity: Medium**

The edit/delete buttons are positioned with:

```tsx
<div class="absolute bottom-5 left-5 right-5 pt-3 border-t border-border/40 bg-card">
```

This `bg-card` solid overlay sits on top of the card content. On hover/focus the card scales (via the ProductCard's group-hover), but the action bar doesn't scale with it. The dividing border and background can also visually clash with the product image area below it on certain screen sizes.

---

### FLAW-25 · `BorrowRecords` Has No Navigation to Item Detail

**Severity: Medium**

Every entry in the BorrowTable shows the item name (via `getItemName`) but provides no link/navigation to the equipment or chemical detail page. Users cannot quickly inspect borrowed items from the borrow list.

---

### FLAW-26 · `Transactions` Page Shows No Item Name or Link

**Severity: Medium**

The transaction log shows User, Action, Item Type, Quantity, and Note — but never shows the specific item name. "admin added 5 of equipment" tells the user nothing about which specific piece of equipment. No drill-down link exists.

---

### FLAW-27 · Missing `aria-label` on Icon-Only Action Buttons in Tables

**Severity: Medium**  
**Affects:** Chemicals table, PlantSamples table, PlantVarieties table, MaintenanceRecords table, ChemicalBatches table, Achievements table

Icon-only buttons without visible labels need `aria-label` for screen readers and accessibility. Equipment cards (the newer pattern) do include `aria-label`. The table patterns do not:

```tsx
// Missing aria-label:
<Button variant="ghost" size="icon" className="h-7 w-7" onClick={...}>
  <Pencil className="h-3.5 w-3.5" />
</Button>
```

---

### FLAW-28 · `UserDocuments` Upload Dialog Lacks File Drag-and-Drop and Preview

**Severity: Low**

The upload dialog renders a plain `<Input type="file">` with no drag-and-drop zone, no file name confirmation, no file size preview before submission. Other parts of the app use the `<ImageUpload>` component which has better affordance. User experience for upload is minimal.

---

### FLAW-29 · `ReportsDashboard` Cards Are Not Keyboard-Navigable

**Severity: Low**

```tsx
<Card
  className="cursor-pointer hover:shadow-md transition-shadow"
  onClick={() => navigate(report.path)}
>
```

The cards are `<div>` elements with `onClick` but no `role="button"` or `tabIndex`. Keyboard-only users cannot tab to or activate these navigation cards.

---

### FLAW-30 · `MaintenanceRecords` — No Ability to See Completed Date

**Severity: Low**

The table shows "Started" and "Status" but not "Completed At" or "Next Service Date" despite those fields being in the schema and form. After completing a maintenance record, users cannot confirm the completion date without opening the edit dialog.

---

## Section 5 — Per-Page Summary

| Page                          | Critical  | High                                        | Medium                                      | Low              | Notes                     |
| ----------------------------- | --------- | ------------------------------------------- | ------------------------------------------- | ---------------- | ------------------------- |
| `Plants.tsx`                  | ✗ FLAW-01 | —                                           | —                                           | —                | Fully mock/broken         |
| `UserProfile.tsx`             | ✗ FLAW-02 | —                                           | —                                           | —                | Mock data only            |
| `Dashboard.tsx`               | —         | —                                           | FLAW-09, FLAW-17                            | —                | Dashboard-specific issues |
| `Chemicals.tsx`               | —         | FLAW-12, FLAW-23                            | FLAW-08, FLAW-14, FLAW-18                   | FLAW-27          |                           |
| `Equipment.tsx`               | —         | FLAW-12                                     | FLAW-06, FLAW-08, FLAW-14, FLAW-18, FLAW-24 | —                |                           |
| `PlantSamples.tsx`            | —         | FLAW-12, FLAW-23                            | FLAW-08, FLAW-14, FLAW-15, FLAW-18, FLAW-22 | FLAW-27          |                           |
| `PlantSpecies.tsx`            | —         | —                                           | FLAW-08, FLAW-14, FLAW-18                   | FLAW-27          |                           |
| `PlantVarieties.tsx`          | —         | FLAW-12, FLAW-23                            | FLAW-08, FLAW-14, FLAW-15, FLAW-18          | FLAW-27          |                           |
| `PlantStock.tsx`              | —         | FLAW-12, FLAW-23                            | FLAW-08, FLAW-14                            | FLAW-27          |                           |
| `BorrowRecords.tsx`           | —         | FLAW-05, FLAW-06, FLAW-12                   | FLAW-16, FLAW-25                            | —                |                           |
| `Transactions.tsx`            | —         | FLAW-05, FLAW-12                            | FLAW-16, FLAW-26                            | —                |                           |
| `Users.tsx`                   | —         | FLAW-05, FLAW-12                            | FLAW-16                                     | —                |                           |
| `OverdueBorrows.tsx`          | —         | FLAW-04, FLAW-05, FLAW-10, FLAW-12          | FLAW-13, FLAW-14, FLAW-21                   | —                |                           |
| `PendingApprovals.tsx`        | —         | FLAW-04, FLAW-05, FLAW-07, FLAW-10, FLAW-12 | FLAW-13, FLAW-14, FLAW-21                   | —                |                           |
| `MaintenanceRecords.tsx`      | —         | FLAW-05, FLAW-10, FLAW-12, FLAW-19          | FLAW-13, FLAW-14, FLAW-18, FLAW-21          | FLAW-27, FLAW-30 |                           |
| `ChemicalBatches.tsx`         | —         | FLAW-05, FLAW-10, FLAW-12, FLAW-19          | FLAW-13, FLAW-14, FLAW-18, FLAW-21          | FLAW-27          |                           |
| `Achievements.tsx`            | —         | FLAW-05, FLAW-10, FLAW-12                   | FLAW-13, FLAW-14, FLAW-18, FLAW-21          | FLAW-20, FLAW-27 |                           |
| `UserDocuments.tsx`           | —         | FLAW-05, FLAW-10, FLAW-12                   | FLAW-13, FLAW-14, FLAW-21                   | FLAW-28          |                           |
| `InventoryReportPage.tsx`     | —         | FLAW-03, FLAW-05, FLAW-10                   | FLAW-13, FLAW-16, FLAW-21                   | —                |                           |
| `BorrowedItemsReportPage.tsx` | —         | FLAW-04, FLAW-05, FLAW-10                   | FLAW-13, FLAW-16, FLAW-21                   | —                |                           |
| `ExpiredItemsReportPage.tsx`  | —         | FLAW-05, FLAW-10                            | FLAW-13, FLAW-16, FLAW-21                   | —                |                           |
| `ChemicalUsageReportPage.tsx` | —         | FLAW-05, FLAW-10                            | FLAW-13, FLAW-16, FLAW-21                   | —                |                           |
| `UserActivityReportPage.tsx`  | —         | FLAW-05, FLAW-10                            | FLAW-13, FLAW-16, FLAW-21                   | —                |                           |
| `ReportsDashboard.tsx`        | —         | FLAW-10                                     | FLAW-21                                     | FLAW-29          |                           |

---

## Flaw Count Summary

| Severity  | Count  |
| --------- | ------ |
| Critical  | 2      |
| High      | 10     |
| Medium    | 13     |
| Low       | 5      |
| **Total** | **30** |

---

## Recommended Fix Priority

### Immediate (Blocks usability)

1. **FLAW-01** — Replace or wire `Plants.tsx` (currently dead placeholder)
2. **FLAW-02** — Connect `UserProfile.tsx` to real API
3. **FLAW-05** — Add `overflow-x-auto` to all legacy table wrappers
4. **FLAW-03** — Fix `InventoryReportPage` raw JSON rendering
5. **FLAW-04** — Resolve item names in OverdueBorrows / PendingApprovals / BorrowedItemsReport

### High Value (Consistency and UX)

6. **FLAW-10 / FLAW-11 / FLAW-12 / FLAW-13** — Standardize PageHeader usage, loading/error/empty states across ALL pages
7. **FLAW-14 / FLAW-15** — Standardize table wrapper class and SearchFilter layout pattern
8. **FLAW-19** — Apply date formatters to ChemicalBatches and MaintenanceRecords
9. **FLAW-17** — Remove local PageHeader duplicate in dashboard renderer
10. **FLAW-21** — Add breadcrumb/back navigation to all secondary and report pages

### Polish (Responsive + Accessibility)

11. **FLAW-06** — Responsive column-hiding for BorrowTable (10 columns)
12. **FLAW-07** — Collapse Approve/Reject to icon+tooltip on narrow screens
13. **FLAW-16** — Use the existing shared `<Pagination>` component consistently
14. **FLAW-22 / FLAW-23** — Add skeleton cards; fix premature empty state during load
15. **FLAW-27** — Add `aria-label` to all icon-only action buttons
