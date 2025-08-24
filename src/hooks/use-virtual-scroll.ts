"use client";

import { useCallback, useEffect, useState } from "react";

interface VirtualScrollConfig {
  itemHeight: number;
  containerHeight: number;
  overscanCount: number;
}

export function useVirtualScroll(
  defaultItemHeight: number = 80,
  defaultContainerHeight: number = 400
): VirtualScrollConfig {
  const [dimensions, setDimensions] = useState<VirtualScrollConfig>({
    itemHeight: defaultItemHeight,
    containerHeight: defaultContainerHeight,
    overscanCount: 5,
  });

  const updateDimensions = useCallback(() => {
    const isMobile = window.innerWidth < 768;
    const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;

    let newItemHeight = defaultItemHeight;
    let newContainerHeight = defaultContainerHeight;
    let newOverscanCount = 5;

    if (isMobile) {
      newItemHeight = Math.floor(defaultItemHeight * 0.8);
      newContainerHeight = Math.floor(defaultContainerHeight * 0.7);
      newOverscanCount = 3;
    } else if (isTablet) {
      newItemHeight = Math.floor(defaultItemHeight * 0.9);
      newContainerHeight = Math.floor(defaultContainerHeight * 0.85);
      newOverscanCount = 4;
    } else {
      newItemHeight = defaultItemHeight;
      newContainerHeight = defaultContainerHeight;
      newOverscanCount = 5;
    }

    setDimensions({
      itemHeight: newItemHeight,
      containerHeight: newContainerHeight,
      overscanCount: newOverscanCount,
    });
  }, [defaultItemHeight, defaultContainerHeight]);

  useEffect(() => {
    updateDimensions();

    const handleResize = () => {
      updateDimensions();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [updateDimensions]);

  return dimensions;
}

// Specialized hooks for common use cases
export function useUserListVirtualScroll() {
  return useVirtualScroll(80, 400);
}

export function useEquipmentGridVirtualScroll() {
  return useVirtualScroll(400, 600);
}

export function useCategoryListVirtualScroll() {
  return useVirtualScroll(60, 300);
}
