import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SyntaxThemeProvider } from "@/components/ThemeContext";
import CookieConsent from "@/components/CookieConsent";
import PageLoadingSkeleton from "@/components/PageLoadingSkeleton";
import RouteProgressBar from "@/components/RouteProgressBar";
import OfflineIndicator from "@/components/OfflineIndicator";
import OfflineQueueIndicator from "@/components/OfflineQueueIndicator";
// Lazy load pages for code splitting
const Index = lazy(() => import("./pages/Index"));
const Scan = lazy(() => import("./pages/Scan"));
const Auth = lazy(() => import("./pages/Auth"));
const History = lazy(() => import("./pages/History"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="bugfindai-theme" attribute="class">
      <SyntaxThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <RouteProgressBar />
            <OfflineIndicator />
            <OfflineQueueIndicator />
            <CookieConsent />
            <Suspense fallback={<PageLoadingSkeleton />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/scan" element={<Scan />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/history" element={<History />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </SyntaxThemeProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
