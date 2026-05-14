# Plant Lab Inventory — Frontend Governance & Scaling Rules

> **Version:** 1.0 | **Last updated:** Session 3 Implementation  
> **Audience:** Every developer touching `frontend/src/`

---

## 1. Component Taxonomy

Every React component MUST belong to exactly one tier:

| Tier          | Path                            | Purpose                                                                    | Rules                                                                          |
| ------------- | ------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| **Primitive** | `src/components/ui/`            | shadcn/ui primitives                                                       | DO NOT edit unless adding a new CVA variant. Never add business logic.         |
| **Shared**    | `src/components/shared/`        | App-level reusable widgets (PageHeader, SearchFilter, Pagination, etc.)    | Must be entity-agnostic. Accept data via props. No API calls.                  |
| **Composed**  | `src/components/composed/`      | Multi-primitive compositions (AsyncContent, EntityGrid, ListPage, etc.)    | Combine shared + ui components. May accept generic types. No direct API calls. |
| **Layout**    | `src/components/layout/`        | Page shells & structural wrappers (AppLayout, AuthLayout, DashboardLayout) | Define spatial arrangement only. No data fetching.                             |
| **Feature**   | `src/pages/` or `src/features/` | Page-level components with business logic                                  | MAY call hooks, MAY fetch data. Must be wrapped in PageShell or ListPage.      |

### Decision Tree: "Where does my component go?"

```
Is it a design primitive (button, input, card)?
  → ui/

Does it appear on 2+ pages with identical behavior?
  → shared/

Does it compose multiple shared/ui components into a layout pattern?
  → composed/

Does it define page-level structure (sidebar, nav, auth wrapper)?
  → layout/

Does it contain business logic, API calls, or routing?
  → pages/ (or features/)
```

---

## 2. Component Creation Checklist

Before creating ANY new component:

- [ ] **Check existing components** — Search `ui/`, `shared/`, `composed/` first. Duplicate = rejection.
- [ ] **Correct tier** — Must follow taxonomy above.
- [ ] **TypeScript interface** — All props typed, no `any`, no `object`. Use generics for collections.
- [ ] **Default exports** — Named exports only. No `export default`.
- [ ] **CVA for variants** — If it has >1 visual variant, use `class-variance-authority`.
- [ ] **Tokens only** — No hardcoded colors, spacing, or font sizes. Reference `tokens.ts` or Tailwind classes.
- [ ] **Dark mode** — Test in both light and dark. Use semantic colors (`text-foreground`, not `text-gray-900`).
- [ ] **ARIA** — Interactive elements need `aria-label` or visible label. Decorative icons get `aria-hidden="true"`.
- [ ] **Keyboard** — All interactive elements reachable via Tab. Activation via Enter/Space.
- [ ] **Loading state** — If async, must handle loading/error/empty via `AsyncContent`.
- [ ] **Barrel export** — Add to the tier's `index.ts` barrel file.

---

## 3. Design Token Extension Rules

### Adding a new color

1. Add the CSS custom property to `:root` AND `.dark` in `index.css`
2. Add the Tailwind mapping in `tailwind.config.ts` under `colors`
3. Add the TypeScript constant in `tokens.ts` under `statusColors` (if status-related)
4. **Never** use raw HSL values in components — always reference the token

### Adding a new spacing value

1. Add to `spacing` in `tokens.ts`
2. Add to `theme.extend.spacing` in `tailwind.config.ts`
3. Document the semantic purpose (e.g., `"dialog-padding": "1.5rem"`)

### Adding a new animation

1. Add `@keyframes` to `tailwind.config.ts` under `keyframes`
2. Add the animation shorthand under `animation`
3. Add a preset class to `motion.ts` under the `motion` object
4. Ensure it respects `prefers-reduced-motion` (automatic via CSS rule in `index.css`)

---

## 4. Variant Extension Rules

When adding a new variant to an existing component:

```tsx
// ✅ CORRECT — Add to the CVA definition
const badgeVariants = cva("...", {
  variants: {
    variant: {
      default: "...",
      secondary: "...",
      success: "...",
      // ← New variant goes here
      info: "bg-info/10 text-info border-info/20",
    },
  },
});

// ❌ WRONG — Inline override
<Badge className="!bg-blue-500 !text-white">Info</Badge>

// ❌ WRONG — Creating a separate InfoBadge component
export function InfoBadge({ children }) { ... }
```

---

## 5. Hook Architecture Rules

| Hook Category  | Naming             | Location             | Rules                                                                         |
| -------------- | ------------------ | -------------------- | ----------------------------------------------------------------------------- |
| **Data hooks** | `use{Entity}Query` | `src/hooks/`         | Wrap TanStack Query. Return `{ data, isLoading, isError, ... }`. No UI logic. |
| **CRUD hooks** | `useCRUD`          | `src/hooks/`         | Generic mutation wrapper. All entities share one factory.                     |
| **UI hooks**   | `use{Feature}`     | `src/hooks/`         | UI-only state (debounce, media query, focus trap). No API calls.              |
| **View hooks** | `use{Entity}View`  | Co-located with page | Compose data + UI hooks. Return everything the page template needs.           |

### View Hook Pattern (Recommended)

```tsx
// src/pages/chemicals/useChemicalsView.ts
export function useChemicalsView() {
  const { data, isLoading, isError, refetch } = useChemicalQuery();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const debouncedQuery = useDebounce(query, 300);

  const filtered = useMemo(
    () => filterChemicals(data, debouncedQuery, status),
    [data, debouncedQuery, status],
  );

  return {
    // Data
    items: filtered,
    totalCount: data?.length ?? 0,
    // State
    query,
    setQuery,
    status,
    setStatus,
    // Async
    isLoading,
    isError,
    refetch,
    isEmpty: !isLoading && filtered.length === 0,
  };
}
```

---

## 6. File & Folder Naming

| Entity          | Convention                  | Example                           |
| --------------- | --------------------------- | --------------------------------- |
| Component files | PascalCase                  | `PageHeader.tsx`                  |
| Hook files      | camelCase with `use` prefix | `useDebounce.ts`                  |
| Utility files   | kebab-case or camelCase     | `formatters.ts`, `lazy-routes.ts` |
| Type-only files | `*.types.ts`                | `chemical.types.ts`               |
| Test files      | `*.test.ts` / `*.test.tsx`  | `formatters.test.ts`              |
| Style modules   | `*.module.css` (if needed)  | — Prefer Tailwind classes         |

---

## 7. Import Ordering

All files must follow this import order (enforced by convention, enforceable via eslint-plugin-import):

```tsx
// 1. React & core libraries
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

// 2. Third-party libraries
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

// 3. Internal libraries (lib/)
import { cn } from "@/lib/utils";
import { motion } from "@/lib/motion";
import { formatDate } from "@/lib/formatters";

// 4. Components (ui → shared → composed → layout)
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/shared/PageHeader";
import { AsyncContent } from "@/components/composed";

// 5. Hooks
import { useDebounce } from "@/hooks/useDebounce";

// 6. Types (type-only imports)
import type { Chemical } from "@/types/chemical";
```

---

## 8. Forbidden Patterns

These patterns are **hard rejects** in code review:

| Anti-Pattern                     | Why                                | Fix                                            |
| -------------------------------- | ---------------------------------- | ---------------------------------------------- |
| `any` type                       | Breaks type safety                 | Use `unknown`, generics, or proper interfaces  |
| Inline `style={{}}`              | Breaks dark mode, defeats Tailwind | Use Tailwind classes or CSS custom properties  |
| `!important` in components       | Specificity wars                   | Fix the cascade, use CVA variants              |
| `className="text-gray-500"`      | Raw Tailwind colors break themes   | Use `text-muted-foreground` or semantic tokens |
| `className="p-4 px-6 mt-8"`      | Hardcoded spacing                  | Use semantic tokens: `p-card`, `px-page-x`     |
| `setTimeout` for animations      | Brittle, breaks reduced motion     | Use CSS transitions/animations                 |
| `document.getElementById`        | Imperative DOM access              | Use refs, state, or portals                    |
| `JSON.stringify(data)` in UI     | Debug artifact                     | Replace with proper data display components    |
| Copy-pasted grid classes         | DRY violation                      | Use `EntityGrid` or `DashboardLayout`          |
| `console.log` in production      | Noise                              | Use conditional logging or remove              |
| Missing `key` prop               | React rendering bugs               | Always use stable, unique keys                 |
| Index as `key` for mutable lists | Stale state on reorder             | Use entity ID                                  |

---

## 9. Code Review UI Checklist

For every PR touching frontend code:

### Structure

- [ ] Component is in the correct tier
- [ ] No business logic in `ui/` or `shared/` components
- [ ] View hook pattern used for pages with data + filters
- [ ] Barrel exports updated if new component added

### Visual

- [ ] Tested in light AND dark mode
- [ ] Tested at mobile (375px), tablet (768px), and desktop (1280px)
- [ ] No horizontal overflow on mobile
- [ ] Loading skeleton matches final layout shape
- [ ] Empty state has actionable CTA

### Accessibility

- [ ] All images have alt text
- [ ] Interactive elements are keyboard-reachable (Tab)
- [ ] Interactive elements are keyboard-activatable (Enter/Space)
- [ ] Color is not the only indicator of state (icons, text also present)
- [ ] `aria-label` on icon-only buttons
- [ ] Form inputs have visible labels
- [ ] Focus order is logical (top→bottom, left→right)

### Performance

- [ ] No unnecessary re-renders (React DevTools Profiler check)
- [ ] Large lists use `useMemo` for filtering
- [ ] Dialog forms are separate components (not inline in page)
- [ ] Report pages use lazy loading via `lazy-routes.ts`

### Tokens

- [ ] No hardcoded colors, spacing, or shadows
- [ ] New tokens added to `tokens.ts` + `tailwind.config.ts` + `index.css`

---

## 10. Scaling Heuristics

### When to split a component

If a component file exceeds **250 lines**, it's a signal to extract:

- Repeated sections → new `shared/` component
- Complex form → separate form component
- Multiple view modes → separate view components

### When to extract a hook

If a component has **>3 `useState` calls** or **>2 `useEffect` calls**, extract a view hook.

### When to create a new composed component

If the **same 3+ component arrangement** appears on 2+ pages, create a composed component.

### When to add a new token

If a **magic number** appears in 2+ files, it should be a token.
