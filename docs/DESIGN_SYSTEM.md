# Biolab Clarity Design System
**Version:** 1.0  
**Last Updated:** February 8, 2026  
**Status:** ✅ Implemented

---

## Quick Reference

### Design Principles
1. **Optical Clarity** - Reduce visual noise, maximize readability
2. **Functional Hierarchy** - Guide user attention through subtle cues
3. **Consistent Rhythm** - Predictable spacing and alignment
4. **Accessibility First** - WCAG 2.1 AA compliance minimum
5. **Performance** - Minimal CSS, optimized transitions

---

## Component Usage Guide

### Spacing

#### Icon + Text Gap (Standardized: `gap-2`)
```tsx
// ✅ Correct
<div className="flex items-center gap-2">
  <Icon className="h-4 w-4" />
  <span>Label</span>
</div>

// ❌ Avoid
<div className="flex items-center gap-1">     // Too tight
<div className="flex items-center gap-1.5">   // Deprecated
<div className="flex items-center gap-3">     // Too loose for icon+text
```

#### Grid Gaps
```tsx
// Standard grid layouts:
gap-3 (12px)  → Compact grids (dense data)
gap-4 (16px)  → Standard grids (most common)
gap-6 (24px)  → Spacious sections (dashboard cards)
```

#### Card Padding
```tsx
// Standard card:
<Card className="p-5">  // 20px - Default

// Dense layout only:
<Card className="p-4">  // 16px - Tables, compact lists

// ❌ Avoid:
<Card className="p-6">  // Removed - use p-5
```

### Icon Sizing

#### Standard Sizes (Only use Tailwind classes)
```tsx
// Button icons (default):
<Icon className="h-4 w-4" />  // 16px - Most buttons

// Navigation icons:
<Icon className="h-5 w-5" />  // 20px - TopNav, Sidebar, large buttons

// Large display icons:
<Icon className="h-6 w-6" />  // 24px - Feature icons, headers
<Icon className="h-8 w-8" />  // 32px - Empty states, large features

// ❌ Never use:
<Icon className="h-[18px] w-[18px]" />  // Custom pixel values
```

### Button Sizes

#### Action Buttons
```tsx
// Primary actions:
<Button variant="default" size="default">  // h-10 px-4 py-2
  <Plus className="h-4 w-4" />
  Add Item
</Button>

// Icon-only buttons (tables, cards):
<Button variant="ghost" size="sm" className="h-9 w-9 p-0">
  <Edit className="h-4 w-4" />
</Button>

// ❌ Avoid:
<Button className="h-7 w-7">  // Too small - migrated to h-9
```

### Border Opacity (Standardized 3-Tier System)

```tsx
// Primary containers (cards, modals):
border-border/50    // 50% opacity

// Subtle dividers (inner borders):
border-border/30    // 30% opacity

// Full strength (dialogs, primary borders):
border-border       // 100% opacity

// ❌ Deprecated:
border-border/40    // Consolidate to /30
border-border/60    // Consolidate to /50
border-border/70    // Consolidate to full
border-border/80    // Consolidate to full
```

### Typography

#### Font Weights
```tsx
// Page/section headers:
font-semibold (600)  // h1, h2

// Card titles, labels:
font-medium (500)    // h3, h4, labels

// Body text, metadata, IDs:
font-normal (400)    // Everything else

// ❌ Never use:
font-bold (700)      // Too heavy for our design
```

#### Text Sizes
```tsx
// Headers:
text-2xl  // 24px - Page headers (h1)
text-xl   // 20px - Section headers (h2)
text-lg   // 18px - Card headers (h3)
text-base // 16px - Subheadings (h4)

// Body:
text-sm   // 14px - Primary body text
text-xs   // 12px - Metadata, labels, tags
```

---

## Component Standards

### LoadingState Component
```tsx
import { LoadingState } from "@/components/LoadingState";

// Skeleton loader (content loading):
<LoadingState variant="skeleton" rows={3} />

// Spinner loader (actions, saves):
<LoadingState variant="spinner" size="md" text="Saving..." />

// Text loader (lightweight):
<LoadingState variant="text" />
```

**When to use:**
- ✅ All async data fetching
- ✅ Form submissions
- ✅ Page transitions
- ❌ Don't show nothing while loading

### EmptyState Component
```tsx
import EmptyState from "@/components/EmptyState";

// Basic empty state:
<EmptyState
  icon={Package}
  title="No equipment found"
  description="Get started by adding your first equipment item"
/>

// With action button:
<EmptyState
  icon={Plus}
  title="No experiments yet"
  description="Create your first experiment to get started"
  actionLabel="Create Experiment"
  actionIcon={Plus}
  onAction={() => setIsDialogOpen(true)}
/>
```

**When to use:**
- ✅ List pages with no items
- ✅ Search results with no matches
- ✅ Filtered lists that return empty
- ❌ Don't show raw "No data" text

### Badge Component
```tsx
import { Badge } from "@/components/ui/badge";

// Status badges:
<Badge variant="default">Active</Badge>
<Badge variant="success">Completed</Badge>
<Badge variant="warning">Expiring</Badge>
<Badge variant="destructive">Expired</Badge>

// Tags/labels:
<Badge variant="secondary">Tag Name</Badge>
<Badge variant="outline">Category</Badge>

// ❌ Avoid custom span badges:
<span className="inline-flex items-center gap-2 px-2 py-1 text-xs...">
  Status
</span>

// ✅ Use Badge component instead
```

---

## Code Review Checklist

Before committing component code, verify:

- [ ] Colors use design tokens (no hardcoded hex values)
- [ ] Spacing uses standard Tailwind scale (no custom `px` values)
- [ ] Typography follows defined scale and weights
- [ ] Icons use standard sizes (`h-4 w-4` or `h-5 w-5`)
- [ ] Borders use opacity scale (`/30`, `/50`, or `100%`)
- [ ] Gap spacing uses `gap-2` for icon+text pairs
- [ ] Buttons use correct sizes (h-9 w-9 for icon buttons)
- [ ] Loading states use `<LoadingState>` component
- [ ] Empty states use `<EmptyState>` component
- [ ] Status indicators use `<Badge>` component
- [ ] Hover states follow standard patterns
- [ ] Focus states are accessible (visible rings)
- [ ] Responsive breakpoints applied where needed
- [ ] ARIA labels present for icon-only elements

---

## Migration Guide

### Replacing gap-1 and gap-1.5
```bash
# Automated fix applied:
find src -name "*.tsx" -exec sed -i 's/gap-1\.5/gap-2/g' {} +
```

### Replacing h-[18px] w-[18px]
```tsx
// Before:
<Icon className="h-[18px] w-[18px]" />

// After:
<Icon className="h-5 w-5" />
```

### Replacing h-7 w-7 buttons
```tsx
// Before:
<Button variant="ghost" size="sm" className="h-7 w-7 p-0">
  <Edit className="h-3.5 w-3.5" />
</Button>

// After:
<Button variant="ghost" size="sm" className="h-9 w-9 p-0">
  <Edit className="h-4 w-4" />
</Button>
```

### Replacing custom badge spans
```tsx
// Before:
<span className="inline-flex items-center gap-2 px-2 py-1 text-xs font-medium bg-muted rounded-lg">
  Status
</span>

// After:
<Badge variant="secondary">Status</Badge>
```

---

## Performance Guidelines

### CSS Bundle Optimization
- **Current:** 47KB
- **Target:** <40KB
- **Strategy:** Remove unused custom classes, rely on Tailwind utilities

### Component Count
- **Current:** 203 components
- **Target:** <150 components
- **Strategy:** Consolidate similar components, remove duplicates

### Render Optimization
- Use `React.memo()` for expensive list items
- Implement virtualization for long lists (react-window)
- Lazy load heavy dashboard components

---

## Accessibility Standards

### Keyboard Navigation
```tsx
// Ensure all interactive elements are keyboard accessible:
<button tabIndex={0} onKeyDown={handleKeyPress}>

// Skip link (already implemented):
<a href="#main-content" className="skip-link">
```

### ARIA Labels
```tsx
// Icon-only buttons MUST have aria-label:
<Button aria-label="Edit equipment item">
  <Edit className="h-4 w-4" />
</Button>

// Decorative icons should be hidden:
<Icon aria-hidden="true" />
```

### Focus States
```tsx
// All interactive elements have visible focus:
focus-visible:outline-none
focus-visible:ring-2
focus-visible:ring-ring
focus-visible:ring-offset-2
```

---

## Resources

- **Tailwind Config:** [`tailwind.config.ts`](tailwind.config.ts)
- **CSS Variables:** [`src/index.css`](src/index.css)
- **Component Library:** [`src/components/ui/`](src/components/ui/)
- **Full Audit:** [`UI_UX_CONSISTENCY_AUDIT.md`](UI_UX_CONSISTENCY_AUDIT.md)

---

## Version History

### v1.0 (February 8, 2026)
- ✅ Fixed icon sizing inconsistencies (h-[18px] → h-5)
- ✅ Consolidated gap spacing (gap-1/gap-1.5 → gap-2)
- ✅ Standardized button sizes (h-7 → h-9)
- ✅ Created LoadingState component
- ✅ Enhanced EmptyState component
- ✅ Documented border opacity system
- ✅ Established component usage guidelines
