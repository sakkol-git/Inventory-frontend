# LINEAR.APP DESIGN SYSTEM — Refactoring Plan
**Project:** BioLab Compass  
**Design Philosophy:** High-Density Utility Interface  
**Constraint:** Preserve existing color palette (Green `#2d9d78`)  
**Date:** February 8, 2026

---

## 🎯 EXECUTIVE SUMMARY

**Current State:** Minimalist design with 14-16px body text, rounded corners (8px), flat cards, and soft hover states.

**Target State:** Linear-inspired high-density utility interface with:
- **13-14px base typography** with tight tracking
- **1px border-based separation** instead of whitespace
- **6px/12px strict border-radius**
- **Tabular numbers** for all data
- **Opacity-based text hierarchy** (100% / 60% / 40%)
- **Invisible inputs** with subtle focus states
- **Sub-perceptual animations** (120ms cubic-bezier)

---

## 📊 CURRENT STATE ANALYSIS

### ✅ What We Already Have (Keep)
1. **Color Palette** — Green `152 56% 40%` (#2d9d78) primary
2. **Inter Font** — Perfect for high-density interfaces
3. **JetBrains Mono** — Good for code/tabular data
4. **Flat surfaces** — No shadows on cards (good foundation)
5. **Simple hover states** — `hover:bg-muted/30` (we'll refine)

### ❌ What Needs Complete Refactor
1. **Typography Scale** — Currently 16px base, needs to be 13-14px
2. **Border System** — Almost no borders; needs 1px borders everywhere
3. **Border Radius** — Currently `--radius: 0.5rem` (8px), needs standardization to 6px/12px
4. **Input Styling** — Has visible borders/backgrounds, needs to be invisible
5. **Text Hierarchy** — Uses muted colors (`--muted-foreground`), should use opacity
6. **Spacing** — Generous padding (p-6), needs compression (p-3/p-4)
7. **Animations** — No defined transition system, needs 120ms cubic-bezier
8. **Number Rendering** — Not using `tabular-nums` consistently

---

## 🗺️ REFACTORING ROADMAP

### MILESTONE 1: High-Density Typography Refactor
**Files to Edit:** 6 files  
**Estimated Changes:** ~40 edits

#### 1.1 Design Tokens ([src/index.css](src/index.css))
- [ ] Set base font-size to `13px` (currently inherited 16px)
- [ ] Add CSS custom property: `--font-size-base: 13px`
- [ ] Add tight letter-spacing: `--tracking-tight: -0.01em` (currently -0.011em)
- [ ] Add tabular-nums utility class: `.tabular-nums { font-variant-numeric: tabular-nums; }`
- [ ] Create opacity-based text utilities:
  ```css
  .text-primary { opacity: 1; }
  .text-secondary { opacity: 0.6; }
  .text-tertiary { opacity: 0.4; }
  ```

#### 1.2 Tailwind Config ([tailwind.config.ts](tailwind.config.ts))
- [ ] Override default font sizes:
  ```ts
  fontSize: {
    xs: ['11px', '16px'],
    sm: ['12px', '18px'],
    base: ['13px', '20px'],
    lg: ['14px', '22px'],
    xl: ['16px', '24px'],
    '2xl': ['18px', '28px'],
  }
  ```
- [ ] Add letter-spacing scale:
  ```ts
  letterSpacing: {
    tighter: '-0.02em',
    tight: '-0.01em',
    normal: '0em',
  }
  ```

#### 1.3 Component Updates
- [ ] **Card.tsx** — CardTitle: `text-lg` → `text-sm`, add `tracking-tight`
- [ ] **Button.tsx** — `text-sm` → `text-xs`, add `tracking-tight`
- [ ] **StatCard.tsx** — Value: `text-2xl` → `text-xl`, add `tabular-nums`
- [ ] **TopNav.tsx** — All text: `text-sm` → `text-xs`
- [ ] **Sidebar.tsx** — Nav items: `text-sm` → `text-xs`

**Acceptance Criteria:**
- All body text renders at 13px
- All numbers use tabular-nums
- Headings use tight tracking (-0.01em)
- Text hierarchy uses opacity (not color)

---

### MILESTONE 2: Glass & Border Structural Layer
**Files to Edit:** 12 files  
**Estimated Changes:** ~80 edits

#### 2.1 Design Tokens ([src/index.css](src/index.css))
- [ ] Update `--radius: 0.5rem` → `--radius: 0.375rem` (6px)
- [ ] Add `--radius-lg: 0.75rem` (12px) for containers
- [ ] Create border color from foreground:
  ```css
  --border-ghost: 220 13% 18% / 0.08; /* foreground at 8% opacity */
  ```
- [ ] Create active state colors:
  ```css
  --active-bg: 152 56% 40% / 0.05; /* primary at 5% */
  --active-border: 152 56% 40% / 0.2; /* primary at 20% */
  ```

#### 2.2 Border Radius Standardization ([tailwind.config.ts](tailwind.config.ts))
- [ ] Override borderRadius:
  ```ts
  borderRadius: {
    none: '0',
    sm: '3px',
    DEFAULT: '6px',
    md: '6px',
    lg: '12px',
    xl: '12px',
    full: '9999px',
  }
  ```

#### 2.3 Layout Components
- [ ] **Sidebar.tsx**
  - Add right border: `border-r border-foreground/[0.08]`
  - Remove background blur: `bg-card/50` → `bg-card`
  - Active state: `bg-primary/5 border-l-2 border-primary/20`
  - Padding compression: `p-3` → `p-2`
  
- [ ] **TopNav.tsx**
  - Add bottom border: `border-b border-foreground/[0.08]`
  - Remove backdrop blur: `bg-card/80 backdrop-blur-sm` → `bg-card`
  - Section tabs: Active state uses `bg-primary/5 border-b-2 border-primary`

#### 2.4 UI Components
- [ ] **Card.tsx**
  - Add border: `border border-foreground/[0.08]`
  - Change radius: `rounded-xl` → `rounded-lg` (12px)
  - Reduce padding: `p-6` → `p-4`
  
- [ ] **Button.tsx**
  - Radius: `rounded-lg` → `rounded` (6px)
  - Ghost variant: Add `border border-foreground/[0.08]`
  - Active state: Add `active:scale-[0.98]`
  
- [ ] **Input.tsx**
  - Border: `border-input` → `border-foreground/[0.08]`
  - Radius: `rounded-lg` → `rounded` (6px)

- [ ] **StatCard.tsx**
  - Add border: `border border-foreground/[0.08]`
  - Reduce padding: `p-5` → `p-3`
  - Hover: `hover:bg-muted/30` → `hover:border-foreground/[0.12]`

**Acceptance Criteria:**
- All major sections separated by 1px borders
- Border color is `foreground` at 8% opacity
- Active states use `primary` at 5% bg + 20% border
- Border radius is 6px for small elements, 12px for containers
- No rounded-xl, rounded-2xl, or rounded-full except avatars

---

### MILESTONE 3: Sub-Perceptual Physics (Animation)
**Files to Edit:** 4 files  
**Estimated Changes:** ~30 edits  
**Status:** PENDING USER APPROVAL (Execute after M1+M2)

#### 3.1 Design Tokens ([src/index.css](src/index.css))
- [ ] Add transition timing:
  ```css
  --transition-snap: cubic-bezier(0.25, 1, 0.5, 1);
  --transition-duration: 120ms;
  ```

#### 3.2 Global Utilities ([src/index.css](src/index.css))
- [ ] Add active state class:
  ```css
  .clickable-row {
    transition: transform var(--transition-duration) var(--transition-snap);
  }
  .clickable-row:active {
    transform: scale(0.98);
  }
  ```

#### 3.3 Components
- [ ] **Button.tsx** — Add `transition-all duration-[120ms] active:scale-[0.98]`
- [ ] **Sidebar.tsx** — Add `transition-all duration-[120ms]` to nav items
- [ ] **TopNav.tsx** — Add `transition-all duration-[120ms]` to tabs

#### 3.4 Install Framer Motion (Optional)
- [ ] `bun add framer-motion`
- [ ] Wrap list components with `<motion.div layout>`

**Acceptance Criteria:**
- All transitions use 120ms cubic-bezier(0.25, 1, 0.5, 1)
- Clickable elements have scale(0.98) on active
- Lists use layout animations (if framer-motion installed)

---

### MILESTONE 4: Information Density (The Reduction)
**Files to Edit:** 15+ files  
**Estimated Changes:** ~100 edits  
**Status:** PENDING USER APPROVAL

#### 4.1 Label Deletion
- [ ] **Search inputs** — Remove "Search:" labels, use placeholder only
- [ ] **Form fields** — Remove explicit labels, use placeholders
- [ ] **Table headers** — Compress text, remove redundant words

#### 4.2 Icon Standardization
- [ ] Audit all icon sizes (currently `lucide-react` defaults to 24px)
- [ ] Standardize to 16px: `className="h-4 w-4"` (or 20px: `h-5 w-5`)
- [ ] Ensure consistent stroke-width (default is 2, Linear uses 1.5-2)

#### 4.3 Row Compression
- [ ] **Table rows** — `h-12` → `h-10` (40px)
- [ ] **List items** — Remove excessive padding
- [ ] **StatCard** — Already at `p-3`, compress to `p-2.5` if needed

**Acceptance Criteria:**
- No explicit labels visible (use placeholders/icons)
- All icons are 16px or 20px
- Table rows are 40px tall maximum
- Overall vertical space reduced by ~20%

---

### MILESTONE 5: Input & Command Experience
**Files to Edit:** 6 files  
**Estimated Changes:** ~40 edits  
**Status:** PENDING USER APPROVAL

#### 5.1 Invisible Inputs ([src/components/ui/input.tsx](src/components/ui/input.tsx))
- [ ] Remove default border: `border-0`
- [ ] Remove background: `bg-transparent`
- [ ] Add bottom border only: `border-b border-foreground/[0.08]`
- [ ] Focus state: `focus-visible:border-primary focus-visible:shadow-[0_0_0_2px_rgba(45,157,120,0.3)]`
- [ ] Remove rounded corners: `rounded-none`

#### 5.2 Focus Ring System ([src/index.css](src/index.css))
- [ ] Create focus ring utility:
  ```css
  .focus-ring {
    box-shadow: 0 0 0 2px hsl(var(--primary) / 0.3);
  }
  ```

#### 5.3 Component Updates
- [ ] **Input.tsx** — Apply invisible input style
- [ ] **Textarea.tsx** — Match input style
- [ ] **Select.tsx** — Match input style for trigger
- [ ] **Button.tsx** — Update focus ring to use custom style

**Acceptance Criteria:**
- Text inputs have no visible border/background when idle
- Only show border/glow when focused
- Focus ring uses `box-shadow: 0 0 0 2px rgba(primary, 0.3)`
- No browser default blue focus rings anywhere

---

## 📋 COMPONENT AUDIT

### Priority 1: Core Layout (M1+M2)
- [x] `src/index.css` — Design tokens
- [x] `tailwind.config.ts` — Typography & radius
- [ ] `src/components/layout/Sidebar.tsx`
- [ ] `src/components/layout/TopNav.tsx`
- [ ] `src/components/layout/AppLayout.tsx`

### Priority 2: UI Primitives (M1+M2)
- [ ] `src/components/ui/button.tsx`
- [ ] `src/components/ui/card.tsx`
- [ ] `src/components/ui/input.tsx`
- [ ] `src/components/ui/table.tsx`
- [ ] `src/components/ui/badge.tsx`
- [ ] `src/components/ui/tabs.tsx`

### Priority 3: Dashboard Cards (M1+M2)
- [ ] `src/components/dashboard/StatCard.tsx`
- [ ] `src/components/dashboard/RecentActivityCard.tsx`
- [ ] `src/components/dashboard/ChemicalExpiryCard.tsx`
- [ ] `src/components/dashboard/PlantHealthCard.tsx`

### Priority 4: Detail Pages (M4)
- [ ] `src/components/detail/DetailPageShell.tsx`
- [ ] `src/components/detail/DetailLayout.tsx`
- [ ] All page files in `src/pages/` (30+ files)

---

## 🎨 COLOR PALETTE PRESERVATION

**Current Palette (KEEP THESE HEX VALUES):**
```css
Primary: hsl(152 56% 40%) → #2d9d78 ✅ PRESERVE
Foreground: hsl(220 13% 18%) → #262f38 ✅ PRESERVE
Background: hsl(0 0% 99%) → #fcfcfc ✅ PRESERVE
Destructive: hsl(0 72% 51%) → #dd3730 ✅ PRESERVE
Warning: hsl(38 92% 50%) → #f59e0b ✅ PRESERVE
```

**New Applications (HOW WE USE THEM):**
```css
/* Ghost borders */
border-color: hsl(220 13% 18% / 0.08);

/* Active states */
background: hsl(152 56% 40% / 0.05);
border-color: hsl(152 56% 40% / 0.2);

/* Focus rings */
box-shadow: 0 0 0 2px hsl(152 56% 40% / 0.3);

/* Text hierarchy (opacity-based) */
color: hsl(220 13% 18%); /* Base foreground */
opacity: 1.0; /* Primary */
opacity: 0.6; /* Secondary */
opacity: 0.4; /* Tertiary */
```

---

## 🚀 EXECUTION STRATEGY

### Phase 1: Foundation (Milestones 1+2)
1. Update design tokens in `index.css`
2. Update Tailwind config
3. Refactor core layout (Sidebar, TopNav)
4. Refactor UI primitives (Button, Card, Input)
5. Refactor StatCard + 3 dashboard cards
6. **CHECKPOINT:** User review + approval

### Phase 2: Polish (Milestones 3+4+5)
*Execute only after Phase 1 approval*
1. Add animation system
2. Compress information density
3. Refactor inputs to invisible style
4. Apply to remaining 30+ page files
5. **FINAL REVIEW:** User acceptance

---

## ⚠️ RISK MITIGATION

### Potential Issues:
1. **Readability** — 13px may be too small for some users
   - *Mitigation:* Test on various screens, adjust to 14px if needed
2. **Border visibility** — 8% opacity borders may be too subtle
   - *Mitigation:* Increase to 10-12% if needed
3. **Breaking changes** — Component prop changes may break pages
   - *Mitigation:* Update components in-place, preserve props

### Testing Checklist:
- [ ] TypeScript compilation (no errors)
- [ ] Visual regression (compare before/after screenshots)
- [ ] Keyboard navigation (tab order preserved)
- [ ] Mobile responsiveness (touch targets ≥44px)
- [ ] Dark mode compatibility (if used)

---

## 📊 SUCCESS METRICS

**Before (Current State):**
- Base font size: 16px
- Border radius: 8px (0.5rem)
- Card padding: 24px (p-6)
- Border usage: ~10% of components
- Average row height: 48-60px

**After (Target State):**
- Base font size: 13px ✓
- Border radius: 6px/12px ✓
- Card padding: 12-16px (p-3/p-4) ✓
- Border usage: 100% of components ✓
- Average row height: 40px ✓
- Transition speed: 120ms ✓
- Focus ring: Custom primary color ✓

---

## 🛠️ IMPLEMENTATION NOTES

### Files Changed Summary:
- **Milestone 1+2:** ~18 files (~120 edits)
- **Milestone 3:** ~4 files (~30 edits)
- **Milestone 4+5:** ~21 files (~140 edits)
- **TOTAL:** ~43 files, ~290 edits

### Estimated Timeline:
- **Phase 1 (M1+M2):** 2-3 hours
- **User Review:** 1 hour
- **Phase 2 (M3+M4+M5):** 3-4 hours
- **Final Testing:** 1 hour
- **TOTAL:** 7-9 hours

---

**STATUS:** ✅ Plan Complete — Ready for Execution  
**NEXT STEP:** Execute Milestone 1 & 2 (Typography + Structure)
