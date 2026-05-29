import { useState } from "react";
import type {
  SectorRFToolProps,
  SectorStatus,
  TechnologyType,
  StorageType,
  SectorCenter,
} from "../types/sectorTypes";
import type { SectorRFData } from "../../../../../types/gisToolTypes/index";
import { sectorRFService } from "../../../../../services/gisTools/index";
import { showToast } from "../../../../../utils/toastUtils";
import { saveTemporaryData } from "../../../../../services/temporaryStorage/index";
import { trackToolUsage } from "../../../../../services/analytics/index";

export interface UseSectorSaveParams {
  user: any;
  startTime: number;
  center: SectorCenter | null;
  radius: number;
  azimuth: number;
  beamwidth: number;
  color: string;
  fillOpacity: number;
  area: number;
  arcLength: number;
  name: string;
  description: string;
  storageType: StorageType;
  towerName: string;
  sectorName: string;
  frequency: string;
  technology: TechnologyType;
  antennaHeight: string;
  status: SectorStatus;
  onSave?: (data: SectorRFData) => void;
  clearSector: () => void;
  setShowSaveDialog: (show: boolean) => void;
  setters: {
    setName: (name: string) => void;
    setDescription: (desc: string) => void;
    setStorageType: (type: StorageType) => void;
    setTowerName: (name: string) => void;
    setSectorName: (name: string) => void;
    setFrequency: (freq: string) => void;
    setAntennaHeight: (height: string) => void;
  };
}

export const useSectorSave = (params: UseSectorSaveParams) => {
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const {
      user,
      startTime,
      center,
      radius,
      azimuth,
      beamwidth,
      color,
      fillOpacity,
      area,
      arcLength,
      name,
      description,
      storageType,
      towerName,
      sectorName,
      frequency,
      technology,
      antennaHeight,
      status,
      onSave,
      clearSector,
      setShowSaveDialog,
      setters,
    } = params;

    if (!center) {
      showToast.warning("Please place the tower location on the map");
      return;
    }

    if (!name.trim()) {
      showToast.warning("Please enter a name for this sector");
      return;
    }

    const sectorData: SectorRFData = {
      id: `sector_${Date.now()}`,
      name: name.trim(),
      center,
      radius,
      azimuth,
      beamwidth,
      area,
      arcLength,
      color,
      fillOpacity,
      strokeWeight: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: user?.id,
      description: description.trim() || undefined,
      status,
      towerName: towerName.trim() || undefined,
      sectorName: sectorName.trim() || undefined,
      frequency: frequency ? parseFloat(frequency) : undefined,
      technology: technology || undefined,
      antennaHeight: antennaHeight ? parseFloat(antennaHeight) : undefined,
    };

    setSaving(true);
    try {
      const sectorSaveData = {
        sector_name: name.trim(),
        tower_lat: center.lat,
        tower_lng: center.lng,
        azimuth: azimuth,
        beamwidth: beamwidth,
        radius: radius,
        frequency: frequency ? parseFloat(frequency) : undefined,
        antenna_height: antennaHeight ? parseFloat(antennaHeight) : undefined,
        fill_color: color,
        stroke_color: color,
        opacity: fillOpacity,
        notes: description.trim(),
      };

      // Handle Temporary Storage
      if (storageType === "temporary") {
        const tempId = saveTemporaryData(
          user?.id || "guest",
          "sector",
          name.trim(),
          sectorSaveData,
        );

        if (tempId) {
          const duration = Math.round((Date.now() - startTime) / 1000);
          trackToolUsage({
            toolName: "sector-rf",
            userId: user?.id || "guest",
            userName: user?.name || "Guest User",
            duration,
          });

          showToast.success("✓ Sector saved temporarily (expires in 24 hours)");
          clearSector();
          setShowSaveDialog(false);
          setters.setName("");
          setters.setDescription("");
          setters.setStorageType("permanent");
          return;
        } else {
          throw new Error("Failed to save temporary data");
        }
      }

      const savedSector = await sectorRFService.create(sectorSaveData);

      if (savedSector) {
        const duration = Math.round((Date.now() - startTime) / 1000);
        trackToolUsage({
          toolName: "sector-rf",
          userId: user?.id || "guest",
          userName: user?.name || "Guest User",
          duration,
        });

        showToast.success("Sector saved to database!");

        if (onSave) {
          onSave(sectorData);
        }

        clearSector();
        setShowSaveDialog(false);
        setters.setName("");
        setters.setDescription("");
        setters.setTowerName("");
        setters.setSectorName("");
        setters.setFrequency("");
        setters.setAntennaHeight("");
      }
    } catch (error) {
      console.error("Error saving sector:", error);
      showToast.error("Failed to save sector. Please try again.");
      return;
    } finally {
      setSaving(false);
    }
  };

  return { handleSave, saving };
};
