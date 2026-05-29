import React from "react";

const SHIMMER_ROWS = 8;

const SkeletonRow: React.FC<{ depth?: number }> = ({ depth = 0 }) => (
  <div
    className="flex items-center gap-2.5 px-2.5 py-2 animate-pulse"
    style={{ paddingLeft: `${12 + depth * 16}px` }}
  >
    <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
    <div className="w-3.5 h-3.5 bg-gray-200 dark:bg-gray-700 rounded" />
    <div className="w-3.5 h-3.5 bg-gray-200 dark:bg-gray-700 rounded-sm" />
    <div className="flex-1 h-3.5 bg-gray-200 dark:bg-gray-700 rounded" style={{ maxWidth: `${60 + Math.random() * 80}px` }} />
    <div className="w-10 h-5 bg-gray-200 dark:bg-gray-700 rounded-full ml-auto" />
  </div>
);

export const SkeletonLoader: React.FC = () => (
  <div className="p-2 space-y-1">
    {Array.from({ length: SHIMMER_ROWS }).map((_, i) => (
      <SkeletonRow key={i} depth={i > 2 && i < 5 ? 1 : 0} />
    ))}
  </div>
);
