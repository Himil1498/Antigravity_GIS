/**
 * useMeasurementSave Hook
 * Manages save functionality for distance measurements
 */

import { useState } from "react";
import { useAppSelector } from "../../../../../store/index";
import { distanceMeasurementService } from "../../../../../services/gisTools/index";
import { showToast } from "../../../../../utils/toastUtils";
import { saveTemporaryData } from "../../../../../services/temporaryStorage/index";
import { trackToolUsage } from "../../../../../services/analytics/index";
import { DistanceMeasurement } from "../../../../../types/gisToolTypes/index";
import { Point, Segment, ElevationDataPoint } from "../types/distanceTypes";

interface UseMeasurementSaveProps {
  points: Point[];
  segments: Segment[];
  totalDistance: number;
  streetViewEnabled: boolean;
  elevationData: ElevationDataPoint[];
  highPoint: ElevationDataPoint | null;
  lowPoint: ElevationDataPoint | null;
  elevationGain: number;
  elevationLoss: number;
  startTime: number;
  clearAll: () => void;
  onSave?: (measurement: DistanceMeasurement) => void;
  onClose?: () => void;
}

export const useMeasurementSave = ({
  points,
  segments,
  totalDistance,
  streetViewEnabled,
  elevationData,
  highPoint,
  lowPoint,
  elevationGain,
  elevationLoss,
  startTime,
  clearAll,
  onSave,
  onClose,
}: UseMeasurementSaveProps) => {
  const { user } = useAppSelector((state) => state.auth);

  // ===========================================================================
  // STATE
  // ===========================================================================
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [storageType, setStorageType] = useState<"permanent" | "temporary">(
    "permanent",
  );
  const [showSaveDialog, setShowSaveDialog] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [showCloseWarning, setShowCloseWarning] = useState<boolean>(false);

  // ===========================================================================
  // SAVE HANDLER
  // ===========================================================================
  const handleSave = async () => {
    if (points.length < 2) {
      showToast.warning("Please add at least 2 points to measure distance");
      return;
    }
    if (!name.trim()) {
      showToast.warning("Please enter a name for this measurement");
      return;
    }

    const measurement: DistanceMeasurement = {
      id: `dist_${Date.now()}`,
      name: name.trim(),
      points,
      totalDistance,
      segments,
      createdAt: new Date(),
      updatedAt: new Date(),
      streetViewEnabled,
      color: "#FF0000",
      description: description.trim() || undefined,
    };

    if (onSave) onSave(measurement);

    setSaving(true);
    try {
      const measurementData = {
        measurement_name: name.trim(),
        points: points,
        total_distance: totalDistance,
        unit: "meters" as const,
        notes: description.trim(),
        elevation_data: elevationData.length > 0 ? elevationData : undefined,
        min_elevation: lowPoint ? lowPoint.elevation : undefined,
        max_elevation: highPoint ? highPoint.elevation : undefined,
        elevation_gain: elevationGain > 0 ? elevationGain : undefined,
        elevation_loss: elevationLoss > 0 ? elevationLoss : undefined,
      };

      if (storageType === "temporary") {
        const tempId = saveTemporaryData(
          user?.id || "guest",
          "distance",
          name.trim(),
          measurementData,
        );

        if (tempId) {
          const duration = Math.round((Date.now() - startTime) / 1000);
          trackToolUsage({
            toolName: "distance-measurement",
            userId: user?.id || "guest",
            userName: user?.name || "Guest User",
            duration,
          });

          showToast.success(
            "✓ Distance measurement saved temporarily (expires in 24 hours)",
          );
          clearAll();
          setShowSaveDialog(false);
          setName("");
          setDescription("");
          setStorageType("permanent");
          return;
        } else {
          throw new Error("Failed to save temporary data");
        }
      }

      const savedMeasurement =
        await distanceMeasurementService.create(measurementData);

      if (savedMeasurement) {
        const duration = Math.round((Date.now() - startTime) / 1000);
        trackToolUsage({
          toolName: "distance-measurement",
          userId: user?.id || "guest",
          userName: user?.name || "Guest User",
          duration,
        });
        showToast.success("Distance measurement saved with elevation data!");
        clearAll();
        setShowSaveDialog(false);
        setName("");
        setDescription("");
      }
    } catch (error) {
      showToast.error("Failed to save measurement.");
    } finally {
      setSaving(false);
    }
  };

  // ===========================================================================
  // CLOSE HANDLERS
  // ===========================================================================
  const handleCloseStart = () => {
    if (points.length > 0) {
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

  return {
    name,
    setName,
    description,
    setDescription,
    storageType,
    setStorageType,
    showSaveDialog,
    setShowSaveDialog,
    saving,
    showCloseWarning,
    setShowCloseWarning,
    handleSave,
    handleCloseStart,
    handleCloseWithoutSaving,
    handleCloseSaveData,
  };
};
