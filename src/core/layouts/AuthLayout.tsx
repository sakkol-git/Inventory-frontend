/**
 * ═══════════════════════════════════════════════════════════════════════════
 * AuthLayout — Centered layout for authentication pages.
 *
 * Provides:
 *   - Centered card with max-width
 *   - Logo/branding area
 *   - Background styling
 *   - No sidebar/nav chrome
 *   - Responsive padding
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { cn } from "@/shared/lib/utils";
import { type ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  /** Optional title shown above the form card */
  title?: string;
  /** Optional description below the title */
  description?: string;
  /** Max width of the card container */
  maxWidth?: "sm" | "md" | "lg";
  className?: string;
}

const maxWidthMap = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
} as const;

export function AuthLayout({
  children,
  title,
  description,
  maxWidth = "md",
  className,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6">
      <div
        className={cn(
          "w-full animate-fade-in",
          maxWidthMap[maxWidth],
          className,
        )}
      >
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-4">
            <svg
              className="w-6 h-6 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
              />
            </svg>
          </div>
          {title && (
            <h1 className="text-2xl font-medium text-foreground tracking-tighter">
              {title}
            </h1>
          )}
          {description && (
            <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
              {description}
            </p>
          )}
        </div>

        {/* Card */}
        <div className="rounded-xl border-2 border-border/60 bg-card shadow-md p-6 sm:p-8">
          {children}
        </div>

        {/* Footer */}
        <p className="text-xs text-muted-foreground text-center mt-6">
          Plant Lab Inventory System
        </p>
      </div>
    </div>
  );
}
