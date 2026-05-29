import { showToast } from "../../../../../utils/toastUtils";
import { circleDrawingService } from "../../../../../services/gisTools/index";
import { saveTemporaryData } from "../../../../../services/temporaryStorage/index";
import { trackToolUsage } from "../../../../../services/analytics/index";
import type { CircleData } from "../../../../../types/gisToolTypes/index";
import type { User } from "../../../../../types/auth/index";

interface UseCirclePersistenceProps {
  center: { lat: number; lng: number } | null;
  name: string;
  radius: number;
  area: number;
  perimeter: number;
  color: string;
  fillOpacity: number;
  description: string;
  storageType: "permanent" | "temporary";
  user: User | null;
  startTime: number;
  onSave?: (circle: CircleData) => void;
  setSaving: (saving: boolean) => void;
  clearCircle: () => void;
  setShowSaveDialog: (show: boolean) => void;
  setName: (name: string) => void;
  setDescription: (desc: string) => void;
  setStorageType: (type: "permanent" | "temporary") => void;
}

export const useCirclePersistence = ({
  center,
  name,
  radius,
  area,
  perimeter,
  color,
  fillOpacity,
  description,
  storageType,
  user,
  startTime,
  onSave,
  setSaving,
  clearCircle,
  setShowSaveDialog,
  setName,
  setDescription,
  setStorageType,
}: UseCirclePersistenceProps) => {
  const handleSave = async () => {
    if (!center) {
      showToast.warning("Please place the circle center on the map");
      return;
    }

    if (!name.trim()) {
      showToast.warning("Please enter a name for this circle");
      return;
    }

    if (radius <= 0 || !isFinite(radius)) {
      showToast.error("Invalid radius value");
      return;
    }

    if (area <= 0 || !isFinite(area)) {
      showToast.error("Invalid area calculation");
      return;
    }

    const circleData: CircleData = {
      id: `circle_${Date.now()}`,
      name: name.trim(),
      center,
      radius,
      perimeter,
      area,
      color,
      fillOpacity,
      strokeWeight: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
      description: description.trim() || undefined,
    };

    setSaving(true);

    try {
      const circleSaveData = {
        circle_name: name.trim(),
        center_lat: center.lat,
        center_lng: center.lng,
        radius: radius,
        fill_color: color,
        stroke_color: color,
        opacity: fillOpacity,
        notes: description.trim(),
      };

      // Temporary storage
      if (storageType === "temporary") {
        try {
          const tempId = saveTemporaryData(
            user?.id?.toString() || "guest",
            "circle",
            name.trim(),
            circleSaveData,
          );

          if (!tempId) {
            throw new Error("Failed to save temporary data");
          }

          const duration = Math.round((Date.now() - startTime) / 1000);
          trackToolUsage({
            toolName: "circle-drawing",
            userId: user?.id || "guest",
            userName: user?.name || "Guest User",
            duration,
          });

          showToast.success("✓ Circle saved temporarily (expires in 24 hours)");

          clearCircle();
          setShowSaveDialog(false);
          setName("");
          setDescription("");
          setStorageType("permanent");
        } catch (tempError) {
          console.error("Temporary storage error:", tempError);
          showToast.error("Failed to save temporarily. Try permanent storage.");
        }
        return;
      }

      // Permanent storage
      try {
        const savedCircle = await circleDrawingService.create(circleSaveData);

        if (!savedCircle) {
          throw new Error("No response from server");
        }

        const duration = Math.round((Date.now() - startTime) / 1000);
        trackToolUsage({
          toolName: "circle-drawing",
          userId: user?.id || "guest",
          userName: user?.name || "Guest User",
          duration,
        });

        showToast.success("✓ Circle saved to database!");

        if (onSave) {
          onSave(circleData);
        }

        clearCircle();
        setShowSaveDialog(false);
        setName("");
        setDescription("");
      } catch (dbError) {
        console.error("Database save error:", dbError);
        showToast.error("Failed to save to database. Please try again.");
      }
    } catch (error) {
      console.error("Error saving circle:", error);
      showToast.error("Failed to save circle. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return { handleSave };
};
