"use client";

import React, { useEffect, useState } from "react";
import { FixedSizeList as List, ListChildComponentProps } from "react-window";

interface VirtualListProps<T> {
  items: T[];
  height: number;
  itemHeight: number;
  renderItemAction: (item: T, index: number) => React.ReactNode;
  className?: string;
  overscanCount?: number;
}

export function VirtualList<T>({
  items,
  height,
  itemHeight,
  renderItemAction,
  className = "",
  overscanCount = 5,
}: VirtualListProps<T>) {
  const [width, setWidth] = useState(800);

  useEffect(() => {
    const updateWidth = () => {
      setWidth(window.innerWidth);
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const itemCount = items.length;

  const Row = ({ index, style }: ListChildComponentProps) => {
    const item = items[index];
    if (!item) return null;

    return (
      <div style={style} className="px-4">
        {renderItemAction(item, index)}
      </div>
    );
  };

  if (itemCount === 0) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <div className="text-center text-gray-500">
          <p>No items found</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <List
        height={height}
        width={width}
        itemCount={itemCount}
        itemSize={itemHeight}
        overscanCount={overscanCount}
        className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
      >
        {Row}
      </List>
    </div>
  );
}

// Infinite loading virtual list for pagination
interface InfiniteVirtualListProps<T> {
  items: T[];
  height: number;
  itemHeight: number;
  renderItemAction: (item: T, index: number) => React.ReactNode;
  className?: string;
  hasNextPage?: boolean;
  isNextPageLoading?: boolean;
  loadNextPage?: () => void;
  overscanCount?: number;
}

export function InfiniteVirtualList<T>({
  items,
  height,
  itemHeight,
  renderItemAction,
  className = "",
  hasNextPage = false,
  isNextPageLoading = false,
  loadNextPage,
  overscanCount = 5,
}: InfiniteVirtualListProps<T>) {
  const [width, setWidth] = useState(800);

  useEffect(() => {
    const updateWidth = () => {
      setWidth(window.innerWidth);
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const itemCount = items.length + (hasNextPage ? 1 : 0);

  const Row = ({ index, style }: ListChildComponentProps) => {
    if (index === items.length && hasNextPage) {
      return (
        <div style={style} className="px-4 flex items-center justify-center">
          <div className="text-center py-4">
            {isNextPageLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm text-gray-600">Loading more...</span>
              </div>
            ) : (
              <button
                onClick={loadNextPage}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Load more items
              </button>
            )}
          </div>
        </div>
      );
    }

    const item = items[index];
    if (!item) return null;

    return (
      <div style={style} className="px-4">
        {renderItemAction(item, index)}
      </div>
    );
  };

  if (itemCount === 0) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <div className="text-center text-gray-500">
          <p>No items found</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <List
        height={height}
        width={width}
        itemCount={itemCount}
        itemSize={itemHeight}
        overscanCount={overscanCount}
        className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
      >
        {Row}
      </List>
    </div>
  );
}
