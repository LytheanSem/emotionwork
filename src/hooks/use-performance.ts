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

  const measureMetrics = useCallback(() => {
    if (!("PerformanceObserver" in window)) return;

    try {
      observer.current = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          switch (entry.entryType) {
            case "paint":
              if (entry.name === "first-contentful-paint") {
                metrics.current.fcp = entry.startTime;
                console.log("FCP:", entry.startTime);
              }
              break;
            case "largest-contentful-paint":
              metrics.current.lcp = entry.startTime;
              console.log("LCP:", entry.startTime);
              break;
            case "first-input":
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
              break;
            case "layout-shift":
              const layoutShiftEntry = entry as PerformanceEntry & {
                value: number;
              };
              metrics.current.cls =
                (metrics.current.cls || 0) + layoutShiftEntry.value;
              console.log("CLS:", metrics.current.cls);
              break;
            case "navigation":
              const navigationEntry = entry as PerformanceEntry & {
                responseStart: number;
                requestStart: number;
              };
              metrics.current.ttfb =
                navigationEntry.responseStart - navigationEntry.requestStart;
              console.log("TTFB:", metrics.current.ttfb);
              break;
          }
        });
      });

      observer.current.observe({
        entryTypes: [
          "paint",
          "largest-contentful-paint",
          "first-input",
          "layout-shift",
          "navigation",
        ],
      });
    } catch {
      console.warn("PerformanceObserver not supported");
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
    // Measure all metrics with single observer
    measureMetrics();

    // Cleanup observer on unmount
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [measureMetrics]);

  return {
    metrics: getMetrics(),
    logMetrics,
  };
}
