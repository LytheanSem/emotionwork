"use client";

import { useCallback, useEffect, useRef } from "react";

interface PerformanceMetrics {
  fcp: number | null;
  lcp: number | null;
  fid: number | null;
  cls: number | null;
  ttfb: number | null;
}

export function usePerformance() {
  const metrics = useRef<PerformanceMetrics>({
    fcp: null,
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null,
  });

  const observer = useRef<PerformanceObserver | null>(null);

  const measureFCP = useCallback(() => {
    if ("PerformanceObserver" in window) {
      try {
        observer.current = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.name === "first-contentful-paint") {
              metrics.current.fcp = entry.startTime;
              console.log("FCP:", entry.startTime);
            }
          });
        });
        observer.current.observe({ entryTypes: ["paint"] });
      } catch {
        console.warn("PerformanceObserver not supported");
      }
    }
  }, []);

  const measureLCP = useCallback(() => {
    if ("PerformanceObserver" in window) {
      try {
        observer.current = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.entryType === "largest-contentful-paint") {
              metrics.current.lcp = entry.startTime;
              console.log("LCP:", entry.startTime);
            }
          });
        });
        observer.current.observe({ entryTypes: ["largest-contentful-paint"] });
      } catch {
        console.warn("PerformanceObserver not supported");
      }
    }
  }, []);

  const measureFID = useCallback(() => {
    if ("PerformanceObserver" in window) {
      try {
        observer.current = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.entryType === "first-input") {
              const firstInputEntry = entry as PerformanceEntry & {
                processingStart: number;
                startTime: number;
              };
              metrics.current.fid =
                firstInputEntry.processingStart - firstInputEntry.startTime;
              console.log(
                "FID:",
                firstInputEntry.processingStart - firstInputEntry.startTime
              );
            }
          });
        });
        observer.current.observe({ entryTypes: ["first-input"] });
      } catch {
        console.warn("PerformanceObserver not supported");
      }
    }
  }, []);

  const measureCLS = useCallback(() => {
    if ("PerformanceObserver" in window) {
      try {
        observer.current = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.entryType === "layout-shift") {
              const layoutShiftEntry = entry as PerformanceEntry & {
                value: number;
              };
              metrics.current.cls =
                (metrics.current.cls || 0) + layoutShiftEntry.value;
              console.log("CLS:", metrics.current.cls);
            }
          });
        });
        observer.current.observe({ entryTypes: ["layout-shift"] });
      } catch {
        console.warn("PerformanceObserver not supported");
      }
    }
  }, []);

  const measureTTFB = useCallback(() => {
    if ("PerformanceObserver" in window) {
      try {
        observer.current = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.entryType === "navigation") {
              const navEntry = entry as PerformanceNavigationTiming;
              metrics.current.ttfb =
                navEntry.responseStart - navEntry.requestStart;
              console.log("TTFB:", metrics.current.ttfb);
            }
          });
        });
        observer.current.observe({ entryTypes: ["navigation"] });
      } catch {
        console.warn("PerformanceObserver not supported");
      }
    }
  }, []);

  const getMetrics = useCallback(() => {
    return { ...metrics.current };
  }, []);

  const logMetrics = useCallback(() => {
    console.group("Performance Metrics");
    console.log("FCP:", metrics.current.fcp);
    console.log("LCP:", metrics.current.lcp);
    console.log("FID:", metrics.current.fid);
    console.log("CLS:", metrics.current.cls);
    console.log("TTFB:", metrics.current.ttfb);
    console.groupEnd();
  }, []);

  useEffect(() => {
    // Measure Core Web Vitals
    measureFCP();
    measureLCP();
    measureFID();
    measureCLS();
    measureTTFB();

    // Cleanup observer on unmount
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [measureFCP, measureLCP, measureFID, measureCLS, measureTTFB]);

  return {
    metrics: getMetrics(),
    logMetrics,
  };
}
