# Minimalist Redesign Roadmap

## From Neo-Brutalist → Clean Minimalism

**Date:** February 8, 2026  
**Status:** In Progress  

---

## Design Philosophy Change

| Aspect | Neo-Brutalist (Current) | Minimalist (Target) |
|--------|------------------------|---------------------|
| **Typography** | Space Grotesk (geometric, heavy), `font-bold` everywhere (164×) | Inter (neutral, humanist), `font-normal/medium` with selective `semibold` |
| **Borders** | Visible 1px borders on everything, high-contrast `--border: 78% lightness` | Borderless cards, ultra-subtle `--border: 92% lightness`, borders only as dividers |
| **Shadows** | 147 shadow instances across 50 files, hover elevation effects | Near-zero shadows — flat cards, 1-level subtle `shadow-sm` for floating elements only |
| **Colors** | Heavy tinted backgrounds (`bg-primary/10` 56×), saturated accents | Monochrome grays + single accent color, no tinted backgrounds |
| **Radius** | `0.375rem` (6px) — was 0px brutalist, partially patched | `0.5rem` (8px) for cards, `0.375rem` (6px) for inputs/buttons, `9999px` for pills |
| **Spacing** | Dense, varied padding | Generous, consistent 16/20/24px rhythm |
| **Icons** | Bordered icon-badge containers (17×), colored icon squares | Bare icons, no containers, muted foreground color |
| **Interactions** | `hover:shadow-md`, translate effects (25×) | Subtle `bg-muted/50` hover, no elevation changes |
| **Status Badges** | Colored background + colored border + colored text | Dot indicator + text, or very subtle pill with single-tone background |
| **Weight** | `font-bold` on values, labels, titles (164×) | `font-normal` default, `font-medium` for emphasis, `font-semibold` for page titles only |

---

## Execution Phases

### Phase 1 — Design Tokens & CSS Foundation
**Files:** `index.css`, `tailwind.config.ts`  
**Changes:**
- Swap font from Space Grotesk → Inter
- Update CSS custom properties: softer borders, lighter muted, minimal shadows
- Remove all `brutalist-*` CSS classes, replace with `minimal-*` equivalents
- Update `--radius` to `0.5rem`
- Flatten shadow scale (most levels → `none`)
- Remove icon-badge classes, replace with plain flex containers
- Remove brutalist progress bars, inputs, cards from CSS

### Phase 2 — Core UI Components (shadcn/ui)
**Files:** 14 component files in `src/components/ui/`  
**Changes:**
- **button.tsx** — Remove borders on default/ghost, softer focus ring, `font-normal`
- **card.tsx** — Remove border + shadow, use bg-card with no elevation
- **badge.tsx** — Remove borders, lighter backgrounds, `font-normal`
- **input.tsx** — Hairline bottom-border only, no full box border
- **table.tsx** — Borderless rows, subtle hover, lighter headers
- **tabs.tsx** — Underline-style active indicator instead of filled
- **select.tsx** — Minimal trigger, remove border emphasis
- **dialog.tsx** — Softer overlay, remove visible border
- **toast.tsx** — Remove border, light shadow only
- **progress.tsx** — Thin track, no border
- **tooltip.tsx** — Remove border
- **dropdown-menu.tsx** — Light shadow only, remove border
- **alert.tsx** — Subtle left-accent instead of full border
- **alert-dialog.tsx** — Match dialog minimalism

### Phase 3 — Layout Shell
**Files:** `Sidebar.tsx`, `TopNav.tsx`, `AppLayout.tsx`  
**Changes:**
- **Sidebar** — Remove right border, use subtle background difference instead; plain text nav items (no bordered active state); remove collapse animation weight
- **TopNav** — Remove bottom border, use very subtle shadow; simplify section tabs to underline-style; clean user menu

### Phase 4 — Cards, Stats, Dashboards
**Files:** `StatCard.tsx`, `DetailPageShell.tsx`, 14 dashboard cards, 3 dashboard renderers  
**Changes:**
- **StatCard** — Borderless, no shadow, flat surface, lighter title weight
- **DetailPageShell** — Flatten section cards, simplify info rows
- **Dashboard cards** — Remove icon-badge containers, use bare icons; reduce shadow/border noise; lighten all label weights
- **Dashboard renderers** — Remove header border decorations, simplify section chrome

### Phase 5 — Tables, Forms, Detail Pages
**Files:** 15+ page files, detail renderers  
**Changes:**
- All table headers → `text-muted-foreground font-normal text-xs`
- All table rows → borderless with `hover:bg-muted/40`
- Edit/action buttons → ghost variant, no visible border
- Form inputs → minimal style
- Detail page info grids → simplified spacing

### Phase 6 — Domain Components & Widgets
**Files:** Widget renderers, experiment cards, contract cards, pipeline, domain configs  
**Changes:**
- Widget section headers → plain text, no decoration
- Status badges → dot + text or ultra-light pill
- Production calculator → flatten
- All remaining `font-bold` → `font-medium` or `font-normal`
- All remaining `hover:shadow-*` → `hover:bg-muted/50`
- All remaining `bg-primary/10` tinted containers → `bg-muted`

### Phase 7 — Polish & Verification
- Run TypeScript compilation check
- Grep audit for remaining brutalist patterns
- Visual consistency pass

---

## Pattern Reference — Minimalist Tokens

```css
/* TARGET VALUES */
--radius: 0.5rem;
--border: 0 0% 92%;          /* nearly invisible */
--muted-foreground: 0 0% 50%; /* softer labels */
--shadow: none;               /* flat by default */
--font-sans: 'Inter', system-ui, sans-serif;
```

## Scope Summary

| Metric | Count |
|--------|-------|
| `font-bold` to convert | 164 instances, ~40 files |
| `shadow-*` to flatten | 147 instances, ~50 files |
| `bg-primary/N` tints to neutralize | 56 instances, 38 files |
| `hover:shadow` to remove | 25 instances, ~20 files |
| `brutalist-*` classes to remove | 21 instances, 3 files |
| `icon-badge-*` to replace | 17 instances, 12 files |
| Directional `border-*-2` | 2 instances, 2 files |
| **Total estimated edits** | **~430+** |
