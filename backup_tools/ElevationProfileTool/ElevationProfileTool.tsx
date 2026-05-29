import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import type { ElevationProfileToolProps } from "./types/index";
import NotificationDialog from "../../../../components/ui/NotificationDialog";
import Map3DControls from "../../components/Map3DControls/Map3DControls";
import { useAppSelector } from "../../../../store/index";

import { useElevationState } from "./hooks/useElevationState";
import { useElevationLogic } from "./hooks/useElevationLogic";
import { useMapInteractions } from "./hooks/useMapInteractions";
import { use3DVisualization } from "./hooks/use3DVisualization";
import { useChartInteractions } from "./hooks/useChartInteractions";
import { useProfileSaving } from "./hooks/useProfileSaving";
import { useChartConfig } from "./hooks/useChartConfig";

// Sub-components
import {
  CloseWarningDialog,
  SaveDialog,
  FullscreenGraphModal,
  ToolbarHeader,
  ElevationChartPanel
} from "./components/index";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ElevationProfileTool: React.FC<ElevationProfileToolProps> = ({
  map,
  onSave,
  onClose,
  containerStyle
}) => {
  const { user } = useAppSelector((state: any) => state.auth);

  // Hook State
  const elevationState = useElevationState();
  const {
    points, totalDistance, highPoint, lowPoint, elevationGain,
    elevationLoss, bearing, loading, name, setName,
    description, setDescription, showSaveDialog, setShowSaveDialog,
    showCloseWarning, setShowCloseWarning, storageType, setStorageType,
    showFullGraph, setShowFullGraph, isExpanded, setIsExpanded,
    isMinimized, setIsMinimized,
    isHoverEnabled, setIsHoverEnabled,
    notification, setNotification,
    buildingData, obstacleData, losAnalysis, showLOSAnalysis, setShowLOSAnalysis,
    antennaHeight1, setAntennaHeight1, antennaHeight2, setAntennaHeight2,
    rfFrequency, setRfFrequency, loadingBuildings,
    saving, isEditMode,
    show3DView, setShow3DView, view3DControls, view3DOverlays,
    multiPointMode, setMultiPointMode, segmentElevationStats,
    elevationData, hoverMarker, hoverInfoWindow, clickMarker,
    setHoveredDataIndex
  } = elevationState;

  const { fetchElevationProfile, recalculateLOS } = useElevationLogic(elevationState, map);

  const {
    addPoint, updatePoint, toggleEditMode, clearAll,
    handleClose, handleCloseWithoutSaving, handleCloseSaveData
  } = useMapInteractions(map, elevationState, user, fetchElevationProfile, recalculateLOS, onClose);

  const { handleView3D, close3DView } = use3DVisualization(map, elevationState);

  const { handleGraphHover, handleGraphClick, removePinnedMarker } = useChartInteractions(map, elevationState);

  const { handleSave } = useProfileSaving(elevationState, user, onSave);

  const { chartData, chartOptions } = useChartConfig(elevationState, { handleGraphHover, handleGraphClick });

  // Render logic helpers
  const shouldShowGraph = elevationData.length > 0;
  const heightClass = shouldShowGraph
    ? isExpanded
      ? "h-[70vh]"
      : "h-80"
    : "h-16";

  const chartRef = elevationState.chartRef;

  // Intercept global close requests (e.g. from dropdown toggle)
  React.useEffect(() => {
    const handleRequestClose = (e: any) => {
      if (e.detail?.toolId === 'elevation') {
        handleClose();
      }
    };
    window.addEventListener('requestGISToolClose', handleRequestClose);
    return () => window.removeEventListener('requestGISToolClose', handleRequestClose);
  }, [elevationState.points, handleClose]);

  return (
    <>
      {/* Bottom Mini Graph Bar - Full Width - Auto-expands after marking 2 points */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-2xl border-t-2 border-gray-300 dark:border-gray-600 z-40 transition-all duration-300 overflow-y-auto ${
          isMinimized ? "h-12" : heightClass
        }`}
        style={containerStyle}
      >
        <div
          className={`h-full ${
            isMinimized
              ? "px-3 py-2"
              : shouldShowGraph
              ? isExpanded
                ? "p-3"
                : "p-2"
              : "p-2"
          }`}
        >
          {/* Toolbar Header with all controls */}
          <ToolbarHeader
            shouldShowGraph={shouldShowGraph}
            isExpanded={isExpanded}
            setIsExpanded={setIsExpanded}
            isHoverEnabled={isHoverEnabled}
            setIsHoverEnabled={setIsHoverEnabled}
            isMinimized={isMinimized}
            setIsMinimized={setIsMinimized}
            isEditMode={isEditMode}
            multiPointMode={multiPointMode}
            setMultiPointMode={setMultiPointMode}
            points={points}
            totalDistance={totalDistance}
            highPoint={highPoint}
            lowPoint={lowPoint}
            bearing={bearing}
            loading={loading}
            saving={saving}
            elevationData={elevationData}
            showLOSAnalysis={showLOSAnalysis}
            clearAll={clearAll}
            toggleEditMode={toggleEditMode}
            setShowSaveDialog={setShowSaveDialog}
            setShowFullGraph={setShowFullGraph}
            handleView3D={handleView3D}
            handleClose={handleClose}
            hoverMarker={hoverMarker}
            hoverInfoWindow={hoverInfoWindow}
            setHoveredDataIndex={setHoveredDataIndex}
            onClose={onClose}
          />

          {/* Content - Hidden when minimized */}
          {!isMinimized && (
            <ElevationChartPanel
              loading={loading}
              isExpanded={isExpanded}
              shouldShowGraph={shouldShowGraph}
              chartData={chartData}
              chartOptions={chartOptions}
              chartRef={chartRef}
              totalDistance={totalDistance}
              highPoint={highPoint}
              lowPoint={lowPoint}
              elevationGain={elevationGain}
              bearing={bearing}
              losAnalysis={losAnalysis}
              showLOSAnalysis={showLOSAnalysis}
              setShowLOSAnalysis={setShowLOSAnalysis}
              antennaHeight1={antennaHeight1}
              setAntennaHeight1={setAntennaHeight1}
              antennaHeight2={antennaHeight2}
              setAntennaHeight2={setAntennaHeight2}
              rfFrequency={rfFrequency}
              setRfFrequency={setRfFrequency}
              buildingData={buildingData}
              loadingBuildings={loadingBuildings}
              multiPointMode={multiPointMode}
              segmentElevationStats={segmentElevationStats}
            />
          )}
        </div>
      </div>

      {/* Fullscreen Graph Modal */}
      {showFullGraph && (
        <FullscreenGraphModal
          totalDistance={totalDistance}
          highPoint={highPoint}
          lowPoint={lowPoint}
          setShowFullGraph={setShowFullGraph}
          chartData={chartData}
          chartOptions={chartOptions}
          handleGraphHover={handleGraphHover}
        />
      )}

      {/* Close Warning Dialog */}
      {showCloseWarning && (
        <CloseWarningDialog
          handleCloseWithoutSaving={handleCloseWithoutSaving}
          setShowCloseWarning={setShowCloseWarning}
          handleCloseSaveData={handleCloseSaveData}
        />
      )}

      {/* Save Dialog */}
      {showSaveDialog && (
        <SaveDialog
          name={name}
          setName={setName}
          description={description}
          setDescription={setDescription}
          storageType={storageType}
          setStorageType={setStorageType}
          saving={saving}
          setShowSaveDialog={setShowSaveDialog}
          handleSave={handleSave}
        />
      )}

      {/* Notification Dialog */}
      <NotificationDialog
        isOpen={notification.isOpen}
        onClose={() => setNotification({ ...notification, isOpen: false })}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        autoClose={true}
        autoCloseDelay={3000}
      />

      {/* 3D Map Controls Overlay */}
      {show3DView && view3DControls && (
        <Map3DControls
          map={map}
          controls={view3DControls}
          overlays={view3DOverlays}
          onClose={() => {
            close3DView();
          }}
        />
      )}
    </>
  );
};

export default ElevationProfileTool;

