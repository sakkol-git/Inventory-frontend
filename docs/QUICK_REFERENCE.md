# Quick Reference - Biolab Clarity Design System

## Spacing
```tsx
gap-2 for icon+text  │  gap-4 for grids  │  p-5 for cards
```

## Icons
```tsx
h-4 w-4 buttons  │  h-5 w-5 navigation  │  h-8 w-8 empty states
```

## Buttons
```tsx
<Button variant="ghost" size="sm" className="h-9 w-9 p-0">
  <Icon className="h-4 w-4" />
</Button>
```

## Borders
```tsx
/30 subtle  │  /50 standard  │  100% emphasis
```

## Loading
```tsx
<LoadingState variant="skeleton" rows={3} />
<LoadingState variant="spinner" text="Saving..." />
```

## Empty States
```tsx
<EmptyState
  icon={Package}
  title="No items"
  actionLabel="Add Item"
  onAction={openDialog}
/>
```

## Badges
```tsx
<Badge variant="default">Active</Badge>
<Badge variant="warning">Expiring</Badge>
<Badge variant="destructive">Expired</Badge>
```

---

**Full Guide:** [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)
