import { ErrorBoundary } from "@/shared/components/ErrorBoundary";
import AppRoutes from "@/app/router";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "@/core/api/queryClient";
import { AuthProvider } from "@/core/auth/AuthContext";
import { ThemeProvider } from "@/core/theme/ThemeProvider";
import { SkipToContent } from "@/shared/components/SkipToContent";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter } from "react-router-dom";

const App = () => (
  <ErrorBoundary>
    <ThemeProvider defaultTheme="system" storageKey="plantlab-theme">
      <QueryClientProvider client={queryClient}>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <AuthProvider>
            <TooltipProvider>
              <SkipToContent />
              <Toaster />
              <Sonner />
              <AppRoutes />
            </TooltipProvider>
          </AuthProvider>
        </BrowserRouter>
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </ThemeProvider>
  </ErrorBoundary>
);

export default App;
