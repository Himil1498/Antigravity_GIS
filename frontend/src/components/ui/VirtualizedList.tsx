import React from "react";
import { List } from "react-window";

interface VirtualizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight: number;
  height?: number;
  maxHeight?: number;
  className?: string;
  emptyMessage?: React.ReactNode;
}

// Row component to be used by react-window List
// It receives standard props (index, style) plus custom props passed via rowProps
const Row = ({
  index,
  style,
  items,
  renderItem,
}: {
  index: number;
  style: React.CSSProperties;
  items: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
}) => <div style={style}>{renderItem(items[index], index)}</div>;

/**
 * Virtualized List Component
 *
 * Uses react-window for efficient rendering of large lists.
 * Only renders visible items + buffer, dramatically improving performance.
 *
 * NOTE: This implementation is compatible with react-window v2.2.5+ API
 * which uses 'List' instead of 'FixedSizeList'.
 */
function VirtualizedList<T>({
  items,
  renderItem,
  itemHeight,
  height,
  maxHeight = 600,
  className = "",
  emptyMessage,
}: VirtualizedListProps<T>) {
  // If no items, show empty state
  if (items.length === 0) {
    return emptyMessage ? <>{emptyMessage}</> : null;
  }

  // Calculate dynamic height: smaller of (items * itemHeight) or maxHeight
  const calculatedHeight =
    height || Math.min(items.length * itemHeight, maxHeight);

  return (
    <div className={className}>
      <List<{
        items: any[];
        renderItem: (item: any, index: number) => React.ReactNode;
      }>
        rowCount={items.length}
        rowHeight={itemHeight}
        style={{ height: calculatedHeight, width: "100%" }}
        overscanCount={5}
        rowComponent={Row}
        rowProps={{ items, renderItem }}
      />
    </div>
  );
}

export default VirtualizedList;

