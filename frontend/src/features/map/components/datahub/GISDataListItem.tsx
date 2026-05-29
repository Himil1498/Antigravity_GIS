import React, { memo } from "react";
import {
  formatDate,
  formatDistance,
  formatArea,
} from "../../../../utils/formatters";

interface GISDataListItemProps {
  item: any;
  type: string;
  currentUserId?: number;
  currentUserRole?: string;
  isSelected?: boolean;
  onSelect?: (id: number) => void;
  onViewDetails: (item: any, type: string) => void;
  onViewOnMap: (item: any, type: string) => void;
  onDelete: (type: string, id: number, name: string, userId: number) => void;
  onEdit?: (item: any, type: string) => void; // Optional if not used yet
  onViewElevation?: (item: any) => void; // For Distance/Elevation type
  renderUserBadge: (username?: string) => React.ReactNode;
  renderStorageBadge: (item: any) => React.ReactNode;
}

const GISDataListItem = memo(
  ({
    item,
    type,
    currentUserId,
    currentUserRole,
    isSelected,
    onSelect,
    onViewDetails,
    onViewOnMap,
    onDelete,
    onViewElevation,
    renderUserBadge, // Pass these render props or move them to separate components if possible
    renderStorageBadge,
  }: GISDataListItemProps) => {
    // Helper to check if user can edit/delete
    const canEditDelete = (itemUserId: number) => {
      if (!currentUserId) return false;
      if (currentUserRole === "admin") return true;
      return currentUserId === itemUserId;
    };

    // Render logic based on type
    const renderContent = () => {
      switch (type) {
        case "distance":
          return (
            <>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center space-x-2">
                <span>{item.measurement_name}</span>
                {renderUserBadge(item.username)}
                {renderStorageBadge(item)}
                {item.elevation_data && item.elevation_data.length > 0 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 dark:from-green-800 dark:to-emerald-800 dark:text-green-100 border border-green-300 dark:border-green-600">
                    📊 Elevation Data
                  </span>
                )}
              </h4>
              <div className="mt-1 flex items-center flex-wrap gap-3 text-sm text-gray-500 dark:text-gray-400">
                <span>📍 {item.points?.length || 0} points</span>
                <span>📐 {formatDistance(item.total_distance)}</span>
                {item.elevation_data && item.elevation_data.length > 0 && (
                  <>
                    {item.max_elevation !== undefined && (
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        ⛰️ {Number(item.max_elevation).toFixed(1)}m
                      </span>
                    )}
                    {item.min_elevation !== undefined && (
                      <span className="text-blue-600 dark:text-blue-400 font-medium">
                        🏞️ {Number(item.min_elevation).toFixed(1)}m
                      </span>
                    )}
                  </>
                )}
                <span>🕐 {formatDate(item.created_at)}</span>
              </div>
            </>
          );
        case "polygon":
          return (
            <>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center space-x-2">
                <span>{item.polygon_name}</span>
                {renderUserBadge(item.username)}
                {renderStorageBadge(item)}
              </h4>
              <div className="mt-1 flex items-center flex-wrap gap-3 text-sm text-gray-500 dark:text-gray-400">
                <span>📍 {item.coordinates?.length || 0} vertices</span>
                {item.area && <span>📐 {formatArea(item.area)}</span>}
                <span
                  className="inline-block w-4 h-4 rounded border border-gray-300"
                  style={{ backgroundColor: item.fill_color }}
                ></span>
                <span>🕐 {formatDate(item.created_at)}</span>
              </div>
            </>
          );
        case "circle":
          return (
            <>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center space-x-2">
                <span>{item.circle_name}</span>
                {renderUserBadge(item.username)}
                {renderStorageBadge(item)}
              </h4>
              <div className="mt-1 flex items-center flex-wrap gap-3 text-sm text-gray-500 dark:text-gray-400">
                <span>
                  📍 ({Number(item.center_lat).toFixed(4)},{" "}
                  {Number(item.center_lng).toFixed(4)})
                </span>
                <span>📏 Radius: {formatDistance(item.radius)}</span>
                <span
                  className="inline-block w-4 h-4 rounded-full border border-gray-300"
                  style={{ backgroundColor: item.fill_color }}
                ></span>
                <span>🕐 {formatDate(item.created_at)}</span>
              </div>
            </>
          );
        case "sector":
          return (
            <>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center space-x-2">
                <span>{item.sector_name}</span>
                {renderUserBadge(item.username)}
                {renderStorageBadge(item)}
              </h4>
              <div className="mt-1 flex items-center flex-wrap gap-3 text-sm text-gray-500 dark:text-gray-400">
                <span>
                  📍 ({Number(item.tower_lat).toFixed(4)},{" "}
                  {Number(item.tower_lng).toFixed(4)})
                </span>
                <span>🔆 Azimuth: {item.azimuth}°</span>
                <span>📐 Beamwidth: {item.beamwidth}°</span>
                <span>📏 {formatDistance(item.radius)}</span>
                <span>📻 {item.frequency} MHz</span>
                <span>🕐 {formatDate(item.created_at)}</span>
              </div>
            </>
          );
        case "elevation":
          return (
            <>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center space-x-2">
                <span>{item.profile_name}</span>
                {renderUserBadge(item.username)}
                {renderStorageBadge(item)}
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 dark:from-green-800 dark:to-emerald-800 dark:text-green-100 border border-green-300 dark:border-green-600">
                  📊 Profile
                </span>
              </h4>
              <div className="mt-1 flex items-center flex-wrap gap-3 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center">
                  📏 {formatDistance(item.total_distance)}
                </span>
                {item.max_elevation !== undefined && (
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    ⛰️ {Number(item.max_elevation).toFixed(1)}m
                  </span>
                )}
                {item.min_elevation !== undefined && (
                  <span className="text-blue-600 dark:text-blue-400 font-medium">
                    🏞️ {Number(item.min_elevation).toFixed(1)}m
                  </span>
                )}
                {item.elevation_gain !== undefined &&
                  item.elevation_gain > 0 && (
                    <span className="text-purple-600 dark:text-purple-400 font-medium">
                      ↗️ +{Number(item.elevation_gain).toFixed(1)}m
                    </span>
                  )}
                {item.bearing !== undefined && item.bearing !== null && (
                  <span
                    className="text-orange-600 dark:text-orange-400 font-medium"
                    title="Bearing from Point A to Point B"
                  >
                    📐 {Number(item.bearing).toFixed(1)}°
                  </span>
                )}
                <span>🕐 {formatDate(item.created_at)}</span>
              </div>
              {item.notes && (
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 italic">
                  {item.notes}
                </p>
              )}
            </>
          );
        default:
          return null;
      }
    };

    return (
      <div className={`px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-200 dark:border-gray-700 last:border-0 ${isSelected ? 'bg-emerald-50 dark:bg-emerald-900/10' : ''}`}>
        <div className="flex items-center justify-between">
          {onSelect !== undefined && (
            <div className="mr-4 flex-shrink-0">
              <input
                type="checkbox"
                checked={isSelected || false}
                onChange={() => onSelect(item.id)}
                className="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500 dark:focus:ring-emerald-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
              />
            </div>
          )}
          <div className="flex-1">{renderContent()}</div>
          <div className="ml-4 flex flex-shrink-0 items-center space-x-2">
            <button
              onClick={() => onViewDetails(item, type)}
              className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900 dark:hover:bg-opacity-20 rounded-lg border border-blue-300 dark:border-blue-700 transition-all"
            >
              📋 Details
            </button>
            <button
              onClick={() => onViewOnMap(item, type)}
              className="px-3 py-1.5 text-xs font-medium text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900 dark:hover:bg-opacity-20 rounded-lg border border-green-300 dark:border-green-700 transition-all"
            >
              🗺️ Map
            </button>

            {/* Extra buttons for specific types */}
            {type === "distance" &&
              item.elevation_data &&
              item.elevation_data.length > 0 &&
              onViewElevation && (
                <button
                  onClick={() => onViewElevation(item)}
                  className="px-3 py-1.5 text-xs font-medium text-purple-600 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900 dark:hover:bg-opacity-20 rounded-lg border border-purple-300 dark:border-purple-700 transition-all flex items-center space-x-1"
                >
                  <span>📊</span>
                  <span>Elevation</span>
                </button>
              )}

            {type === "elevation" &&
              item.elevation_data &&
              item.elevation_data.length > 0 &&
              onViewElevation && (
                <button
                  onClick={() => onViewElevation(item)}
                  className="px-3 py-1.5 text-xs font-medium text-purple-600 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900 dark:hover:bg-opacity-20 rounded-lg border border-purple-300 dark:border-purple-700 transition-all flex items-center space-x-1"
                >
                  <span>📊</span>
                  <span>Graph</span>
                </button>
              )}

            {canEditDelete(item.user_id) && ( // Assuming user_id is the standard field now
              <button
                onClick={() =>
                  onDelete(
                    type,
                    item.id!,
                    item.measurement_name ||
                      item.polygon_name ||
                      item.circle_name ||
                      item.sector_name ||
                      item.name ||
                      item.profile_name ||
                      "Item",
                    item.user_id,
                  )
                }
                className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900 dark:hover:bg-opacity-20 rounded-lg border border-red-300 dark:border-red-700 transition-all"
              >
                🗑️ Delete
              </button>
            )}
          </div>
        </div>
      </div>
    );
  },
);

GISDataListItem.displayName = "GISDataListItem";

export default GISDataListItem;

