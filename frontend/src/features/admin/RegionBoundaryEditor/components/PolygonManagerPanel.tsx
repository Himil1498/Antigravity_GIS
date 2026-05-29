import React, { useMemo } from "react";

interface PolygonManagerPanelProps {
  paths: google.maps.LatLng[][][];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  onFocus: (index: number) => void;
  onDelete: (index: number) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const POLYGON_COLORS = [
  "#3B82F6", // Blue
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#14B8A6", // Teal
  "#F97316", // Orange
  "#6366F1", // Indigo
  "#10B981", // Green
];

export const PolygonManagerPanel: React.FC<
  PolygonManagerPanelProps & {
    deletedPaths: google.maps.LatLng[][][];
    onRestore: (index: number) => void;
  }
> = ({
  paths,
  selectedIndex,
  onSelect,
  onFocus,
  onDelete,
  isOpen,
  onToggle,
  deletedPaths = [],
  onRestore,
}) => {
  // Analyze polygons to find Main vs Islands
  const analyzedPolygons = useMemo(() => {
    return paths
      .map((path, index) => {
        const totalVertices = path.reduce((acc, ring) => acc + ring.length, 0);
        return { index, totalVertices };
      })
      .sort((a, b) => b.totalVertices - a.totalVertices);
  }, [paths]);

  const getLabel = (originalIndex: number) => {
    const rank = analyzedPolygons.findIndex((p) => p.index === originalIndex);
    return rank === 0 ? "Main" : `Island ${rank}`;
  };

  const getBadge = (originalIndex: number) => {
    const rank = analyzedPolygons.findIndex((p) => p.index === originalIndex);
    return rank === 0 ? (
      <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] rounded-full font-bold leading-none">
        Main
      </span>
    ) : (
      <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded-full leading-none">
        Sub
      </span>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-12 right-0 w-64 bg-white/95 backdrop-blur-md rounded-xl shadow-xl z-30 border border-gray-200 flex flex-col max-h-[60vh]">
      {/* Header */}
      <div className="px-3 py-2 border-b border-gray-100 flex justify-between items-center bg-gray-50/80 rounded-t-xl shrink-0">
        <div>
          <h3 className="font-bold text-gray-800 text-xs">Boundary Parts</h3>
          <div className="flex gap-2 text-[10px] text-gray-500">
            <span>{paths.length} active</span>
            {deletedPaths.length > 0 && (
              <span className="text-red-500">
                • {deletedPaths.length} deleted
              </span>
            )}
          </div>
        </div>
        <button
          onClick={onToggle}
          className="text-gray-400 hover:text-gray-600 p-0.5"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* List */}
      <div className="overflow-y-auto p-1.5 space-y-1 flex-1 min-h-0">
        {paths.map((path, idx) => {
          const color = POLYGON_COLORS[idx % POLYGON_COLORS.length];
          const isSelected = selectedIndex === idx;
          
          return (
          <div
            key={idx}
            className={`px-2 py-1.5 rounded-lg border transition-all ${
              isSelected ? "shadow-sm" : "hover:border-gray-300"
            }`}
            style={{
              borderColor: isSelected ? color : '#E5E7EB',
              backgroundColor: isSelected ? `${color}10` : '#ffffff',
              borderLeftWidth: '3px',
              borderLeftColor: color
            }}
          >
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs" style={{ color: color }}>
                  {getLabel(idx)}
                </span>
                {getBadge(idx)}
              </div>
              <span className="text-[9px] text-gray-400 font-mono">
                {path.reduce((acc, r) => acc + r.length, 0)} pts
              </span>
            </div>

            <div className="flex gap-1">
              <button
                onClick={() => onSelect(idx)}
                className="flex-1 px-1.5 py-1 text-[10px] font-bold rounded transition-colors"
                style={{
                  backgroundColor: isSelected ? color : 'transparent',
                  color: isSelected ? 'white' : color,
                  border: `1px solid ${color}`
                }}
              >
                {isSelected ? "Selected" : "Select"}
              </button>

              <button
                onClick={() => onFocus(idx)}
                className="px-1.5 py-1 text-[10px] font-medium border rounded transition-all hover:scale-105 flex items-center justify-center"
                style={{ borderColor: `${color}50`, color: color, backgroundColor: 'white' }}
                title="Zoom to"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>

              <button
                onClick={() => onDelete(idx)}
                className="px-1.5 py-1 text-[10px] font-medium border rounded transition-all hover:scale-105 flex items-center justify-center"
                style={{ borderColor: '#FECACA', color: '#DC2626', backgroundColor: '#FEF2F2' }}
                title="Delete"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        )})}

        {paths.length === 0 && (
          <div className="text-center py-4 text-gray-400 text-xs">
            No active boundary parts.
          </div>
        )}

        {/* Deleted Items Section */}
        {deletedPaths.length > 0 && (
          <div className="mt-2 border-t border-gray-100 pt-1.5">
            <h4 className="text-[10px] font-bold text-gray-500 uppercase px-1 mb-1">
              Deleted ({deletedPaths.length})
            </h4>
            <div className="space-y-1 opacity-75">
              {deletedPaths.map((path, idx) => (
                <div
                  key={`deleted-${idx}`}
                  className="px-2 py-1 border border-dashed border-red-200 bg-red-50 rounded flex justify-between items-center text-[10px]"
                >
                  <span className="text-gray-600">
                    Deleted ({path.reduce((acc, r) => acc + r.length, 0)} pts)
                  </span>
                  <button
                    onClick={() => onRestore(idx)}
                    className="px-1.5 py-0.5 bg-white border border-gray-200 text-gray-600 rounded hover:text-blue-600 hover:border-blue-300 flex items-center gap-1 text-[10px]"
                  >
                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                    Restore
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {paths.length > 2 && (
        <div className="px-2 py-1 text-[9px] text-center text-gray-400 bg-gray-50/80 rounded-b-xl border-t border-gray-100 shrink-0">
          Sorted by size (largest first)
        </div>
      )}
    </div>
  );
};
