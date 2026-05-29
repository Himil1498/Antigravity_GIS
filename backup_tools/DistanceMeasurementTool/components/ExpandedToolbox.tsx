import React from "react";
import NotificationDialog from "../../../../../components/ui/NotificationDialog";
import { Point, Segment, NotificationState, ElevationDataPoint } from "../types/distanceTypes";
import { SegmentElevation } from "../../../../../types/gisToolTypes/index";
import { formatDistance } from "../utils/distanceUtils";
import {
  ToolboxHeader,
  SegmentAnalysisTable,
  PointsList,
  StreetViewControls,
  ElevationPrompt,
  ElevationButton,
  ElevationStats,
  CloseWarningDialog,
  SaveDialog
} from "./index";

interface ExpandedToolboxProps {
  points: Point[];
  totalDistance: number;
  segments: Segment[];
  segmentElevationStats: SegmentElevation[];
  streetViewEnabled: boolean;
  setStreetViewEnabled: (enabled: boolean) => void;
  streetViewAvailability: Map<number, boolean>;
  currentStreetViewPoint: number | null;
  showStreetViewCoverage: boolean;
  setShowStreetViewCoverage: (show: boolean) => void;
  showElevationPrompt: boolean;
  setShowElevationPrompt: (show: boolean) => void;
  showElevationGraph: boolean;
  loadingElevation: boolean;
  fetchElevationForPoints: () => void;
  elevationData: ElevationDataPoint[];
  highPoint: ElevationDataPoint | null;
  lowPoint: ElevationDataPoint | null;
  elevationGain: number;
  elevationLoss: number;
  showCloseWarning: boolean;
  setShowCloseWarning: (show: boolean) => void;
  showSaveDialog: boolean;
  setShowSaveDialog: (show: boolean) => void;
  name: string;
  setName: (name: string) => void;
  description: string;
  setDescription: (desc: string) => void;
  storageType: "permanent" | "temporary";
  setStorageType: (type: "permanent" | "temporary") => void;
  saving: boolean;
  notification: NotificationState;
  setNotification: (notification: NotificationState) => void;
  setIsToolboxCollapsed: (collapsed: boolean) => void;
  setShowElevationDrawer: (show: boolean) => void;
  setShowFullGraph: (show: boolean) => void;
  handleCloseStart: () => void;
  handleCloseWithoutSaving: () => void;
  handleCloseSaveData: () => void;
  handleSave: () => void;
  undoLastPoint: () => void;
  clearAll: () => void;
  openStreetView: (lat: number, lng: number, index?: number) => void;
  navigateToNextPoint: () => void;
  navigateToPreviousPoint: () => void;
  exitStreetView: () => void;
  onClose?: () => void;
  containerStyle?: React.CSSProperties;
}

export const ExpandedToolbox: React.FC<ExpandedToolboxProps> = ({
  points, totalDistance, segments, segmentElevationStats,
  streetViewEnabled, setStreetViewEnabled, streetViewAvailability, currentStreetViewPoint,
  showStreetViewCoverage, setShowStreetViewCoverage,
  showElevationPrompt, setShowElevationPrompt, showElevationGraph, loadingElevation, fetchElevationForPoints,
  elevationData, highPoint, lowPoint, elevationGain, elevationLoss,
  showCloseWarning, setShowCloseWarning, showSaveDialog, setShowSaveDialog,
  name, setName, description, setDescription, storageType, setStorageType, saving,
  notification, setNotification, setIsToolboxCollapsed, setShowElevationDrawer, setShowFullGraph,
  handleCloseStart, handleCloseWithoutSaving, handleCloseSaveData, handleSave,
  undoLastPoint, clearAll, openStreetView, navigateToNextPoint, navigateToPreviousPoint, exitStreetView, onClose,
  containerStyle
}) => {
  return (
    <div 
      className="fixed top-16 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-3 max-w-sm z-40 max-h-[90vh] overflow-y-auto transition-all duration-300 ease-in-out"
      style={containerStyle}
    >
      <ToolboxHeader setIsToolboxCollapsed={setIsToolboxCollapsed} handleCloseStart={handleCloseStart} onClose={onClose} />

      <div className="mb-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md">
        <p className="text-xs text-blue-800 dark:text-blue-200">
          Click on the map to add measurement points. Points will be labeled A, B, C, etc.
        </p>
      </div>

      {points.length >= 2 && (
        <div className="mb-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-0.5">Total Distance</div>
          <div className="text-xl font-bold text-green-600 dark:text-green-400">{formatDistance(totalDistance)}</div>
        </div>
      )}

      <SegmentAnalysisTable segments={segments} segmentElevationStats={segmentElevationStats} />
      <PointsList points={points} streetViewEnabled={streetViewEnabled} streetViewAvailability={streetViewAvailability} currentStreetViewPoint={currentStreetViewPoint} openStreetView={openStreetView} />
      <StreetViewControls streetViewEnabled={streetViewEnabled} setStreetViewEnabled={setStreetViewEnabled} showStreetViewCoverage={showStreetViewCoverage} setShowStreetViewCoverage={setShowStreetViewCoverage} currentStreetViewPoint={currentStreetViewPoint} points={points} navigateToPreviousPoint={navigateToPreviousPoint} navigateToNextPoint={navigateToNextPoint} exitStreetView={exitStreetView} />

      {showElevationPrompt && points.length >= 2 && !showElevationGraph && (
        <ElevationPrompt loadingElevation={loadingElevation} fetchElevationForPoints={fetchElevationForPoints} setShowElevationPrompt={setShowElevationPrompt} />
      )}

      {points.length >= 2 && !showElevationGraph && !showElevationPrompt && (
        <ElevationButton loadingElevation={loadingElevation} fetchElevationForPoints={fetchElevationForPoints} />
      )}

      {showElevationGraph && elevationData.length > 0 && (
        <ElevationStats highPoint={highPoint} lowPoint={lowPoint} elevationGain={elevationGain} elevationLoss={elevationLoss} setShowElevationDrawer={setShowElevationDrawer} setShowFullGraph={setShowFullGraph} />
      )}

      <div className="flex space-x-2 pt-2 mt-2 border-t border-gray-100 dark:border-gray-700">
        <button onClick={undoLastPoint} disabled={points.length === 0} className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">Undo</button>
        <button onClick={clearAll} disabled={points.length === 0} className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">Clear</button>
        <button onClick={() => setShowSaveDialog(true)} disabled={points.length < 2 || saving} className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">{saving ? "Saving..." : "Save"}</button>
      </div>

      {showCloseWarning && <CloseWarningDialog handleCloseWithoutSaving={handleCloseWithoutSaving} setShowCloseWarning={setShowCloseWarning} handleCloseSaveData={handleCloseSaveData} />}
      {showSaveDialog && <SaveDialog name={name} setName={setName} description={description} setDescription={setDescription} storageType={storageType} setStorageType={setStorageType} saving={saving} setShowSaveDialog={setShowSaveDialog} handleSave={handleSave} />}
      <NotificationDialog isOpen={notification.isOpen} onClose={() => setNotification({ ...notification, isOpen: false })} type={notification.type} title={notification.title} message={notification.message} autoClose={true} autoCloseDelay={3000} />
    </div>
  );
};

