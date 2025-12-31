import { useCallback } from "react";

// Map routes to their lazy component import functions
const routeImports: Record<string, () => Promise<unknown>> = {
  "/": () => import("@/pages/Index"),
  "/scan": () => import("@/pages/Scan"),
  "/auth": () => import("@/pages/Auth"),
  "/history": () => import("@/pages/History"),
  "/privacy": () => import("@/pages/Privacy"),
  "/terms": () => import("@/pages/Terms"),
};

// Track which routes have been prefetched to avoid duplicate requests
const prefetchedRoutes = new Set<string>();

export const usePrefetch = () => {
  const prefetch = useCallback((to: string) => {
    // Normalize the path
    const path = to.startsWith("/") ? to : `/${to}`;
    
    // Skip if already prefetched or no import function exists
    if (prefetchedRoutes.has(path) || !routeImports[path]) {
      return;
    }

    // Mark as prefetched immediately to prevent race conditions
    prefetchedRoutes.add(path);

    // Trigger the import to cache the module
    routeImports[path]().catch(() => {
      // Remove from set if prefetch fails so it can be retried
      prefetchedRoutes.delete(path);
    });
  }, []);

  return { prefetch };
};

export const prefetchRoute = (to: string) => {
  const path = to.startsWith("/") ? to : `/${to}`;
  
  if (prefetchedRoutes.has(path) || !routeImports[path]) {
    return;
  }

  prefetchedRoutes.add(path);
  routeImports[path]().catch(() => {
    prefetchedRoutes.delete(path);
  });
};
