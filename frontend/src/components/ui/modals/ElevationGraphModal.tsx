import React, { useMemo } from "react";
import { useAppSelector } from "../../../store/index";
import { use3DElevationView } from "./hooks/use3DElevationView";
import { useElevationData } from "./hooks/useElevationData";
import Map3DControls from "../../../features/map/components/Map3DControls/Map3DControls";

// Extracted Components
import ModalHeader from "./elevation/ModalHeader";
import StatsSummary from "./elevation/StatsSummary";
import ElevationChart from "./elevation/ElevationChart";
import LOSAnalysisSection from "./elevation/LOSAnalysisSection";
import SegmentStatistics from "./elevation/SegmentStatistics";
import ElevationLegend from "./elevation/ElevationLegend";
import ActionButtons from "./elevation/ActionButtons";

// ============================================================================
// TYPES
// ============================================================================

interface ElevationGraphModalProps {
  isOpen: boolean;
  onClose: () => void;
  measurementData: {
    measurement_name: string;
    total_distance: number;
    points?: Array<{ lat: number; lng: number; label?: string }>;
    elevation_data?: Array<{
      elevation: number;
      resolution: number;
      location: { lat: number; lng: number };
      distance: number;
    }>;
    max_elevation?: number;
    min_elevation?: number;
    elevation_gain?: number;
    elevation_loss?: number;
    building_data?: any[];
    obstacle_data?: any[];
    los_analysis?: any;
    antenna_height_1?: number;
    antenna_height_2?: number;
    rf_frequency?: number;
  };
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Elevation Graph Modal Component
 * Displays elevation profile with interactive chart and statistics
 * Used in GISDataHub to view saved measurements with elevation data
 */
const ElevationGraphModal: React.FC<ElevationGraphModalProps> = ({
  isOpen,
  onClose,
  measurementData
}) => {
  const mapInstance = useAppSelector((state) => state.map.mapInstance);

  const {
    measurement_name,
    total_distance,
    points = [],
    elevation_data = [],
    max_elevation,
    min_elevation,
    elevation_gain,
    elevation_loss,
    building_data,
    obstacle_data,
    los_analysis,
    antenna_height_1,
    antenna_height_2,
    rf_frequency
  } = measurementData;

  // Safeguard against null values (defaults in destructuring only handle undefined)
  const safePoints = points || [];
  const safeElevationData = elevation_data || [];

  // Check if we have LOS data
  const hasLOSData = useMemo(() =>
    !!(los_analysis || building_data || antenna_height_1),
    [los_analysis, building_data, antenna_height_1]
  );

  // Use custom hooks for data processing and 3D view management
  const {
    pointToIndexMap,
    segmentStats,
    highPoint,
    lowPoint,
    handleExportElevation,
    handleExportSegments
  } = useElevationData({
    elevationData: safeElevationData,
    points: safePoints,
    measurementName: measurement_name,
    totalDistance: total_distance,
    maxElevation: max_elevation,
    minElevation: min_elevation,
    elevationGain: elevation_gain,
    elevationLoss: elevation_loss
  });

  const {
    view3DOverlays,
    view3DControls,
    show3DControls,
    handleView3D,
    handle3DControlsClose
  } = use3DElevationView({
    mapInstance,
    points: safePoints,
    totalDistance: total_distance,
    elevationData: safeElevationData,
    hasLOSData,
    losAnalysis: los_analysis,
    antennaHeight1: antenna_height_1,
    antennaHeight2: antenna_height_2
  });

  if (!isOpen || safeElevationData.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <ModalHeader
          measurementName={measurement_name}
          totalDistance={total_distance}
          onClose={onClose}
        />

        {/* Stats Summary */}
        <StatsSummary
          totalDistance={total_distance}
          maxElevation={Number(max_elevation) || Number(highPoint?.elevation) || 0}
          minElevation={Number(min_elevation) || Number(lowPoint?.elevation) || 0}
          elevationGain={Number(elevation_gain) || 0}
          elevationLoss={Number(elevation_loss) || 0}
        />

        {/* Chart */}
        <ElevationChart
          elevationData={safeElevationData}
          totalDistance={total_distance}
          pointToIndexMap={pointToIndexMap}
          highPoint={highPoint}
          lowPoint={lowPoint}
          hasLOSData={hasLOSData}
          losAnalysis={los_analysis}
        />

        {/* LOS Analysis Statistics */}
        {hasLOSData && los_analysis && (
          <LOSAnalysisSection
            losAnalysis={los_analysis}
            antennaHeight1={antenna_height_1}
            antennaHeight2={antenna_height_2}
            rfFrequency={rf_frequency}
          />
        )}

        {/* Segment Statistics */}
        <SegmentStatistics segmentStats={segmentStats} />

        {/* Legend */}
        <ElevationLegend />

        {/* Action Buttons */}
        <ActionButtons
          hasSegments={segmentStats.length > 0}
          hasLOSData={hasLOSData}
          hasMultiplePoints={safePoints.length >= 2}
          onExportElevation={handleExportElevation}
          onExportSegments={handleExportSegments}
          onView3D={handleView3D}
          onClose={onClose}
        />

        {/* 3D Map Controls Overlay */}
        {show3DControls && view3DControls && (
          <div className="fixed inset-0 z-[60] pointer-events-none">
            <div className="pointer-events-auto">
              <Map3DControls
                map={mapInstance}
                controls={view3DControls}
                overlays={view3DOverlays}
                onClose={handle3DControlsClose}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ElevationGraphModal;

