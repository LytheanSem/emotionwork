"use client";

import { useCallback, useEffect, useRef } from "react";

interface PerformanceMetrics {
  fcp: number | null;
  lcp: number | null;
  fid: number | null;
  cls: number | null;
  ttfb: number | null;
}

// LayoutShift interface for proper CLS calculation
interface LayoutShift extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
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
  // Track CLS sessions to compute the largest window (gap > 1s or window > 5s)
  const clsSessions = useRef<{ value: number; start: number; last: number }[]>(
    []
  );

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
            case "first-input": {
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
            }
            case "layout-shift": {
              const ls = entry as unknown as LayoutShift; // lib.dom typings

              // Ignore shifts triggered by recent user input
              if (ls.hadRecentInput) {
                break;
              }

              const start = entry.startTime;
              const sessions = clsSessions.current;
              const last = sessions[sessions.length - 1];

              // Start a new session if gap > 1s or session length > 5s
              if (
                !last ||
                start - last.last > 1000 ||
                start - last.start > 5000
              ) {
                sessions.push({ value: ls.value, start, last: start });
              } else {
                last.value += ls.value;
                last.last = start;
              }

              // CLS is the largest session value
              metrics.current.cls = Math.max(...sessions.map((s) => s.value));
              console.log("CLS:", metrics.current.cls);
              break;
            }
            case "navigation": {
              const navigationEntry = entry as PerformanceEntry & {
                responseStart: number;
                requestStart: number;
              };
              metrics.current.ttfb =
                navigationEntry.responseStart - navigationEntry.requestStart;
              console.log("TTFB:", metrics.current.ttfb);
              break;
            }
          }
        });
      });

      // Observe each entry type with buffering to capture early (already fired) entries
      observer.current.observe({ type: "paint", buffered: true });
      observer.current.observe({
        type: "largest-contentful-paint",
        buffered: true,
      });
      observer.current.observe({ type: "first-input", buffered: true });
      observer.current.observe({ type: "layout-shift", buffered: true });
      observer.current.observe({ type: "navigation", buffered: true });
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
