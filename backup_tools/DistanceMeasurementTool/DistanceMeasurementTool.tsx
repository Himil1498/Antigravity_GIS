import React from "react";
import { DistanceMeasurementToolProps } from "./types/distanceTypes";
import { useDistanceMeasurement } from "./hooks/useDistanceMeasurement";
import { useDistanceChart } from "./hooks/useDistanceChart";
import { CollapsedToolbox, ElevationDrawer, FullscreenGraphModal, ExpandedToolbox } from "./components/index";

/**
 * Distance Measurement Tool - Enhanced with Advanced Street View
 * Features:
 * - Multi-point distance measurement with real-time labels
 * - Street View integration with availability checking
 * - Advanced navigation between points in Street View
 * - Keyboard shortcuts for Street View navigation
 * - Coverage layer visualization
 */
const DistanceMeasurementTool: React.FC<DistanceMeasurementToolProps> = ({ map, onSave, onClose, initialData, containerStyle }) => {
  const measurement = useDistanceMeasurement(map, initialData, onSave, onClose);
  const { chartData, chartOptions } = useDistanceChart({
    elevationData: measurement.elevationData,
    totalDistance: measurement.totalDistance,
    pointToElevationIndexMap: measurement.pointToElevationIndexMap,
    hoveredDataIndex: measurement.hoveredDataIndex,
    highPoint: measurement.highPoint,
    lowPoint: measurement.lowPoint,
    handleGraphHover: measurement.handleGraphHover,
    handleGraphClick: measurement.handleGraphClick
  });

  // Intercept global close requests (e.g. from dropdown toggle)
  React.useEffect(() => {
    const handleRequestClose = (e: any) => {
      if (e.detail?.toolId === 'distance') {
        measurement.handleCloseStart();
      }
    };
    window.addEventListener('requestGISToolClose', handleRequestClose);
    return () => window.removeEventListener('requestGISToolClose', handleRequestClose);
  }, [measurement]);

  return (
    <>
      {/* Collapsed Toolbox */}
      {measurement.isToolboxCollapsed && (
        <CollapsedToolbox
          points={measurement.points}
          totalDistance={measurement.totalDistance}
          elevationData={measurement.elevationData}
          showElevationDrawer={measurement.showElevationDrawer}
          setShowElevationDrawer={measurement.setShowElevationDrawer}
          undoLastPoint={measurement.undoLastPoint}
          clearAll={measurement.clearAll}
          setIsToolboxCollapsed={measurement.setIsToolboxCollapsed}
          containerStyle={containerStyle}
        />
      )}

      {/* Expanded Toolbox */}
      {!measurement.isToolboxCollapsed && (
        <ExpandedToolbox
          points={measurement.points}
          totalDistance={measurement.totalDistance}
          segments={measurement.segments}
          segmentElevationStats={measurement.segmentElevationStats}
          streetViewEnabled={measurement.streetViewEnabled}
          setStreetViewEnabled={measurement.setStreetViewEnabled}
          streetViewAvailability={measurement.streetViewAvailability}
          currentStreetViewPoint={measurement.currentStreetViewPoint}
          showStreetViewCoverage={measurement.showStreetViewCoverage}
          setShowStreetViewCoverage={measurement.setShowStreetViewCoverage}
          showElevationPrompt={measurement.showElevationPrompt}
          setShowElevationPrompt={measurement.setShowElevationPrompt}
          showElevationGraph={measurement.showElevationGraph}
          loadingElevation={measurement.loadingElevation}
          fetchElevationForPoints={measurement.fetchElevationForPoints}
          elevationData={measurement.elevationData}
          highPoint={measurement.highPoint}
          lowPoint={measurement.lowPoint}
          elevationGain={measurement.elevationGain}
          elevationLoss={measurement.elevationLoss}
          showCloseWarning={measurement.showCloseWarning}
          setShowCloseWarning={measurement.setShowCloseWarning}
          showSaveDialog={measurement.showSaveDialog}
          setShowSaveDialog={measurement.setShowSaveDialog}
          name={measurement.name}
          setName={measurement.setName}
          description={measurement.description}
          setDescription={measurement.setDescription}
          storageType={measurement.storageType}
          setStorageType={measurement.setStorageType}
          saving={measurement.saving}
          notification={measurement.notification}
          setNotification={measurement.setNotification}
          setIsToolboxCollapsed={measurement.setIsToolboxCollapsed}
          setShowElevationDrawer={measurement.setShowElevationDrawer}
          setShowFullGraph={measurement.setShowFullGraph}
          handleCloseStart={measurement.handleCloseStart}
          handleCloseWithoutSaving={measurement.handleCloseWithoutSaving}
          handleCloseSaveData={measurement.handleCloseSaveData}
          handleSave={measurement.handleSave}
          undoLastPoint={measurement.undoLastPoint}
          clearAll={measurement.clearAll}
          openStreetView={measurement.openStreetView}
          navigateToNextPoint={measurement.navigateToNextPoint}
          navigateToPreviousPoint={measurement.navigateToPreviousPoint}
          exitStreetView={measurement.exitStreetView}
          onClose={onClose}
          containerStyle={containerStyle}
        />
      )}

      {/* Collapsible Bottom Drawer for Elevation Graph */}
      {measurement.showElevationDrawer && measurement.elevationData.length > 0 && (
        <ElevationDrawer
          elevationData={measurement.elevationData}
          totalDistance={measurement.totalDistance}
          highPoint={measurement.highPoint}
          lowPoint={measurement.lowPoint}
          isDrawerMinimized={measurement.isDrawerMinimized}
          setIsDrawerMinimized={measurement.setIsDrawerMinimized}
          setShowElevationDrawer={measurement.setShowElevationDrawer}
          isHoverEnabled={measurement.isHoverEnabled}
          setIsHoverEnabled={measurement.setIsHoverEnabled}
          chartData={chartData}
          chartOptions={chartOptions}
          chartRef={measurement.chartRef}
          exportKML={measurement.exportKML}
          exportGPX={measurement.exportGPX}
          exportCSV={measurement.exportCSV}
        />
      )}

      {/* Fullscreen Elevation Graph Modal */}
      {measurement.showFullGraph && measurement.elevationData.length > 0 && (
        <FullscreenGraphModal
          elevationData={measurement.elevationData}
          totalDistance={measurement.totalDistance}
          highPoint={measurement.highPoint}
          lowPoint={measurement.lowPoint}
          setShowFullGraph={measurement.setShowFullGraph}
          chartData={chartData}
          chartOptions={chartOptions}
          handleGraphHover={measurement.handleGraphHover}
          handleGraphClick={measurement.handleGraphClick}
          exportKML={measurement.exportKML}
          exportGPX={measurement.exportGPX}
          exportCSV={measurement.exportCSV}
        />
      )}
    </>
  );
};

export default DistanceMeasurementTool;

