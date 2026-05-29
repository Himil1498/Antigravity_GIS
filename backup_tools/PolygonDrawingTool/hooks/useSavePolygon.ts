/**
 * Custom hook for saving polygon data
 */

import { useState } from "react";
import { useAppSelector, RootState } from "../../../../../store/index";
import { PolygonData, PolygonSaveData } from "../types";
import { polygonDrawingService } from "../../../../../services/gisTools/index";
import { showToast } from "../../../../../utils/toastUtils";
import { trackToolUsage } from "../../../../../services/analytics/index";
import { saveTemporaryData } from "../../../../../services/temporaryStorage/index";

interface UseSavePolygonProps {
  vertices: Array<{ lat: number; lng: number }>;
  area: number;
  perimeter: number;
  color: string;
  fillOpacity: number;
  startTime: number;
  onSave?: (polygon: PolygonData) => void;
  onClearAll: () => void;
}

export const useSavePolygon = ({
  vertices,
  area,
  perimeter,
  color,
  fillOpacity,
  startTime,
  onSave,
  onClearAll,
}: UseSavePolygonProps) => {
  const { user } = useAppSelector((state: RootState) => state.auth);
  const [saving, setSaving] = useState<boolean>(false);

  const savePolygon = async (
    name: string,
    description: string,
    storageType: "permanent" | "temporary",
  ): Promise<boolean> => {
    if (vertices.length < 3) {
      showToast.warning("Please add at least 3 vertices to create a polygon");
      return false;
    }

    if (!name.trim()) {
      showToast.warning("Please enter a name for this polygon");
      return false;
    }

    const polygonData: PolygonData = {
      id: `poly_${Date.now()}`,
      name: name.trim(),
      vertices,
      area,
      perimeter,
      color,
      fillOpacity,
      strokeWeight: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
      description: description.trim() || undefined,
    };

    setSaving(true);
    try {
      const polygonSaveData: PolygonSaveData = {
        polygon_name: name.trim(),
        coordinates: vertices,
        area: area,
        perimeter: perimeter,
        fill_color: color,
        stroke_color: color,
        opacity: fillOpacity,
        notes: description.trim(),
      };

      // Handle Temporary Storage
      if (storageType === "temporary") {
        const tempId = saveTemporaryData(
          user?.id || "guest",
          "polygon",
          name.trim(),
          polygonSaveData,
        );

        if (tempId) {
          const duration = Math.round((Date.now() - startTime) / 1000);
          trackToolUsage({
            toolName: "polygon-drawing",
            userId: user?.id || "guest",
            userName: user?.name || "Guest User",
            duration,
          });

          showToast.success(
            "✓ Polygon saved temporarily (expires in 24 hours)",
          );
          onClearAll();
          return true;
        } else {
          throw new Error("Failed to save temporary data");
        }
      }

      const savedPolygon = await polygonDrawingService.create(polygonSaveData);

      if (savedPolygon) {
        const duration = Math.round((Date.now() - startTime) / 1000);
        trackToolUsage({
          toolName: "polygon-drawing",
          userId: user?.id || "guest",
          userName: user?.name || "Guest User",
          duration,
        });

        showToast.success("Polygon saved to database!");
        if (onSave) {
          onSave(polygonData);
        }
        onClearAll();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error saving polygon:", error);
      showToast.error("Failed to save polygon. Please try again.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  return { savePolygon, saving };
};
