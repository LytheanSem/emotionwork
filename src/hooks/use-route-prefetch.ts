"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";

interface PrefetchOptions {
  delay?: number;
}

export function useRoutePrefetch() {
  const router = useRouter();
  const prefetchedRoutes = useRef<Set<string>>(new Set());
  const prefetchTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const prefetchRoute = useCallback(
    (route: string, options: PrefetchOptions = {}) => {
      const { delay = 0 } = options;

      // Don't prefetch if already prefetched
      if (prefetchedRoutes.current.has(route)) {
        return;
      }

      const prefetch = () => {
        try {
          router.prefetch(route);
          prefetchedRoutes.current.add(route);
        } catch (error) {
          console.warn(`Failed to prefetch route: ${route}`, error);
        }
      };

      if (delay > 0) {
        const timeoutId = setTimeout(prefetch, delay);
        prefetchTimeouts.current.set(route, timeoutId);
      } else {
        prefetch();
      }
    },
    [router]
  );

  const prefetchOnHover = useCallback(
    (route: string, options: PrefetchOptions = {}) => {
      const { delay = 100 } = options;

      return {
        onMouseEnter: () => prefetchRoute(route, { ...options, delay }),
        onFocus: () => prefetchRoute(route, { ...options, delay }),
      };
    },
    [prefetchRoute]
  );

  const prefetchOnIntersection = useCallback(
    (route: string, options: PrefetchOptions = {}) => {
      const { delay = 0 } = options;

      return {
        ref: (node: HTMLElement | null) => {
          if (node && !prefetchedRoutes.current.has(route)) {
            const observer = new IntersectionObserver(
              ([entry]) => {
                if (entry.isIntersecting) {
                  prefetchRoute(route, { ...options, delay });
                  observer.disconnect();
                }
              },
              {
                rootMargin: "50px",
                threshold: 0.1,
              }
            );

            observer.observe(node);
          }
        },
      };
    },
    [prefetchRoute]
  );

  const prefetchCriticalRoutes = useCallback(() => {
    // Prefetch critical routes immediately
    const criticalRoutes = ["/about", "/service", "/equipment", "/contact", "/bookmeeting", "/design"];

    criticalRoutes.forEach((route) => {
      prefetchRoute(route);
    });
  }, [prefetchRoute]);

  const cancelPrefetch = useCallback((route: string) => {
    const timeoutId = prefetchTimeouts.current.get(route);
    if (timeoutId) {
      clearTimeout(timeoutId);
      prefetchTimeouts.current.delete(route);
    }
  }, []);

  const clearPrefetchedRoutes = useCallback(() => {
    prefetchedRoutes.current.clear();
    prefetchTimeouts.current.forEach((timeoutId) => clearTimeout(timeoutId));
    prefetchTimeouts.current.clear();
  }, []);

  useEffect(() => {
    // Prefetch critical routes on mount
    prefetchCriticalRoutes();

    // Cleanup on unmount
    return () => {
      clearPrefetchedRoutes();
    };
  }, [prefetchCriticalRoutes, clearPrefetchedRoutes]);

  return {
    prefetchRoute,
    prefetchOnHover,
    prefetchOnIntersection,
    prefetchCriticalRoutes,
    cancelPrefetch,
    clearPrefetchedRoutes,
    isPrefetched: (route: string) => prefetchedRoutes.current.has(route),
  };
}
