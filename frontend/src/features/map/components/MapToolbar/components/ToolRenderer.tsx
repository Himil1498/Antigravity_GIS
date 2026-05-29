/**
 * Tool Renderer Component
 * Conditionally renders the active GIS tool component
 */

import React from "react";
import type { GISToolType } from "../../../../../types/gisToolTypes/index";
import MeasurementSuiteTool from "../../../../../features/map/tools/MeasurementSuiteTool";

interface ToolRendererProps {
  activeTool: GISToolType | null;
  toolInitialData: any;
  map: google.maps.Map | null;
  onDataSaved?: () => void;
  onCloseTool: () => void;
  onCloseToolWithData: () => void;
  networkCatalogOpen?: boolean;
  networkCatalogMinimized?: boolean;
}

const ToolRenderer: React.FC<ToolRendererProps> = ({
  activeTool,
  toolInitialData,
  map,
  onDataSaved,
  onCloseTool,
  onCloseToolWithData,
  networkCatalogOpen,
  networkCatalogMinimized,
}) => {
  if (!activeTool) return null;

  // Dynamic styling removed since tools are permanently anchored to the left side
  const containerStyle: React.CSSProperties = {
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
  };

  switch (activeTool) {
    case "distance":
    case "polygon":
    case "circle":
    case "elevation":
    case "sectorRF":
    case "measurementSuite":
      return (
        <MeasurementSuiteTool
          map={map}
          onSave={onDataSaved}
          onClose={onCloseTool}
          containerStyle={containerStyle}
          networkCatalogOpen={networkCatalogOpen}
        />
      );
    default:
      return null;
  }
};

export default ToolRenderer;

