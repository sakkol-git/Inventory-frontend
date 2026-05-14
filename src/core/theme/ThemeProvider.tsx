/**
 * ThemeProvider — wraps next-themes for dark/light/system theme support.
 * Persists user preference in localStorage.
 */

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ReactNode } from "react";

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: string;
  storageKey?: string;
}

export const ThemeProvider = ({
  children,
  defaultTheme = "system",
  storageKey = "plantlab-theme",
  ...props
}: ThemeProviderProps) => (
  <NextThemesProvider
    attribute="class"
    defaultTheme={defaultTheme}
    enableSystem
    disableTransitionOnChange={false}
    storageKey={storageKey}
    {...props}
  >
    {children}
  </NextThemesProvider>
);
