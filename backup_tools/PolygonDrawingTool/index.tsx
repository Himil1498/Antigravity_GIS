/**
 * Polygon Drawing Tool - Main Orchestrator
 * Multi-vertex polygon with area and perimeter calculation
 */

import React, { useState } from "react";
import { PolygonDrawingToolProps } from "./types";
import { usePolygonDrawing } from "./hooks/usePolygonDrawing";
import CollapsedToolbox from "./components/CollapsedToolbox";
import ExpandedToolbox from "./components/ExpandedToolbox";
import CloseWarningDialog from "./components/CloseWarningDialog";
import SaveDialog from "./components/SaveDialog";
import NotificationDialog from "../../../../components/ui/NotificationDialog";

const PolygonDrawingTool: React.FC<PolygonDrawingToolProps> = ({
  map,
  onSave,
  onClose,
  containerStyle
}) => {
  const [isToolboxCollapsed, setIsToolboxCollapsed] = useState<boolean>(false);
  const [showSaveDialog, setShowSaveDialog] = useState<boolean>(false);
  const [showCloseWarning, setShowCloseWarning] = useState<boolean>(false);
  const [notification, setNotification] = useState<{
    isOpen: boolean;
    type: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: "info",
    title: "",
    message: ""
  });

  const {
    vertices,
    markers,
    polygon,
    area,
    perimeter,
    isDrawing,
    color,
    fillOpacity,
    saving,
    setIsDrawing,
    setColor,
    setFillOpacity,
    undoLastVertex,
    completeDrawing,
    clearAll,
    savePolygon
  } = usePolygonDrawing({ map, onSave });

  const handleClose = () => {
    if (vertices.length > 0) {
      setShowCloseWarning(true);
    } else {
      if (onClose) onClose();
    }
  };

  const handleCloseWithoutSaving = () => {
    clearAll();
    setShowCloseWarning(false);
    if (onClose) onClose();
  };

  const handleCloseSaveData = () => {
    setShowCloseWarning(false);
    setShowSaveDialog(true);
  };

  // Intercept global close requests (e.g. from dropdown toggle)
  React.useEffect(() => {
    const handleRequestClose = (e: any) => {
      if (e.detail?.toolId === 'polygon') {
        handleClose();
      }
    };
    window.addEventListener('requestGISToolClose', handleRequestClose);
    return () => window.removeEventListener('requestGISToolClose', handleRequestClose);
  }, [vertices, handleClose]);

  const handleSaveFromDialog = async (
    name: string,
    description: string,
    storageType: 'permanent' | 'temporary'
  ) => {
    const success = await savePolygon(name, description, storageType);
    if (success) {
      setShowSaveDialog(false);
    }
  };

  return (
    <>
      {/* Collapsed Toolbox */}
      {isToolboxCollapsed && (
        <CollapsedToolbox
          vertices={vertices}
          area={area}
          polygon={polygon}
          markers={markers}
          onClearAll={clearAll}
          onExpand={() => setIsToolboxCollapsed(false)}
          containerStyle={containerStyle}
        />
      )}

      {/* Expanded Toolbox */}
      {!isToolboxCollapsed && (
        <ExpandedToolbox
          vertices={vertices}
          area={area}
          perimeter={perimeter}
          color={color}
          fillOpacity={fillOpacity}
          isDrawing={isDrawing}
          saving={saving}
          onColorChange={setColor}
          onOpacityChange={setFillOpacity}
          onUndoLastVertex={undoLastVertex}
          onCompleteDrawing={completeDrawing}
          onClearAll={clearAll}
          onStartDrawing={() => setIsDrawing(true)}
          onSave={() => setShowSaveDialog(true)}
          onCollapse={() => setIsToolboxCollapsed(true)}
          onClose={handleClose}
          containerStyle={containerStyle}
        />
      )}

      {/* Close Warning Dialog */}
      <CloseWarningDialog
        isOpen={showCloseWarning}
        onDiscard={handleCloseWithoutSaving}
        onCancel={() => {
          setShowCloseWarning(false);
          window.dispatchEvent(new CustomEvent('cancelGISToolClose'));
        }}
        onSave={handleCloseSaveData}
      />

      {/* Save Dialog */}
      <SaveDialog
        isOpen={showSaveDialog}
        saving={saving}
        onSave={handleSaveFromDialog}
        onCancel={() => setShowSaveDialog(false)}
      />

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
    </>
  );
};

export default PolygonDrawingTool;

