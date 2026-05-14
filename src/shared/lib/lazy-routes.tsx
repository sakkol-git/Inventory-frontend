/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Route-Level Code Splitting — Lazy-loaded page components.
 *
 * Rules:
 *   1. All pages are lazy-loaded via React.lazy().
 *   2. Each route wraps its lazy component in <Suspense>.
 *   3. Reports (infrequently accessed) are always code-split.
 *   4. Core listing pages are split into their own chunks.
 *
 * Usage in router.tsx:
 *   import { lazyRoute } from '@/lib/lazy-routes';
 *   const Page = lazyRoute(() => import('@/pages/MyPage'), { displayName: 'MyPage' });
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { LoadingState } from "@/shared/components/LoadingState";
import { lazy, Suspense, type ComponentType, type ReactNode } from "react";

// ────────────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────────────

export interface LazyRouteOptions {
  /** Human-readable name for React DevTools / error boundaries */
  displayName?: string;
  /** Custom Suspense fallback. Defaults to a skeleton LoadingState. */
  fallback?: ReactNode;
}

// ────────────────────────────────────────────────────────────────────────────
// Lazy Wrapper
// ────────────────────────────────────────────────────────────────────────────

/**
 * Creates a lazy-loaded route component with built-in Suspense fallback.
 * Fully type-safe and supports props.
 */
export function lazyRoute<T extends ComponentType<object>>(
  factory: () => Promise<{ default: T }>,
  options?: LazyRouteOptions,
) {
  const LazyComponent = lazy(factory);

  function WrappedRoute(props: React.ComponentProps<T>) {
    return (
      <Suspense
        fallback={
          options?.fallback ?? (
            <LoadingState variant="skeleton" rows={6} size="lg" />
          )
        }
      >
        <LazyComponent {...props} />
      </Suspense>
    );
  }

  WrappedRoute.displayName =
    options?.displayName ?? `LazyRoute(${factory.toString().slice(0, 50)})`;

  return WrappedRoute;
}
