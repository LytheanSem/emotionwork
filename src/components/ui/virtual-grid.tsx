"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

interface VirtualGridProps<T> {
  items: T[];
  height: number;
  itemHeight: number;
  columns: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  overscanCount?: number;
}

export function VirtualGrid<T>({
  items,
  height,
  itemHeight,
  columns,
  renderItem,
  className = "",
  overscanCount = 5,
}: VirtualGridProps<T>) {
  const [visibleItems, setVisibleItems] = useState<T[]>([]);
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(height);

  // Calculate how many items fit in the viewport
  const itemsPerViewport = Math.ceil(containerHeight / itemHeight) * columns;

  // Calculate visible range with overscan
  const overscanItems = overscanCount * columns;
  const visibleStart = Math.max(0, startIndex - overscanItems);
  const visibleEnd = Math.min(items.length, endIndex + overscanItems);

  // Update visible items when range changes
  useEffect(() => {
    const visible = items.slice(visibleStart, visibleEnd);
    setVisibleItems(visible);
  }, [items, visibleStart, visibleEnd]);

  // Handle scroll to update visible range
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;

    const scrollTop = containerRef.current.scrollTop;
    const newStartIndex = Math.floor(scrollTop / itemHeight) * columns;
    const newEndIndex = Math.min(
      newStartIndex + itemsPerViewport + overscanItems,
      items.length
    );

    setStartIndex(newStartIndex);
    setEndIndex(newEndIndex);
  }, [itemHeight, columns, itemsPerViewport, overscanItems, items.length]);

  // Set up scroll listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial calculation

    return () => container.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Update container height on resize
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.clientHeight);
      }
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  if (items.length === 0) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <div className="text-center text-gray-500">
          <p>No equipment found</p>
        </div>
      </div>
    );
  }

  // Calculate total height needed for all items
  const totalRows = Math.ceil(items.length / columns);
  const totalHeight = totalRows * itemHeight;

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
    >
      <div style={{ height: totalHeight, position: "relative" }}>
        <div
          style={{
            position: "absolute",
            top: visibleStart * (itemHeight / columns),
            left: 0,
            right: 0,
          }}
        >
          <div
            className="grid gap-6"
            style={{
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
            }}
          >
            {visibleItems.map((item, index) => (
              <div
                key={`${visibleStart + index}`}
                style={{ height: itemHeight }}
                className="flex items-center justify-center"
              >
                {renderItem(item, visibleStart + index)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
