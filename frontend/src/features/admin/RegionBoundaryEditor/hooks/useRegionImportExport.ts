import { useState, useCallback, useRef } from "react";
import { geojsonToGooglePaths } from "../utils/index";

export const useRegionImportExport = (
  region: any,
  boundaryData: any,
  regionId: number,
  setEditablePaths: (paths: google.maps.LatLng[][][]) => void,
  setEditMode: (mode: boolean) => void,
  setHasChanges: (hasChanges: boolean) => void,
  saveToHistory: (paths: google.maps.LatLng[][][]) => void,
  setSuccess: (msg: string | null) => void,
  setError: (msg: string | null) => void,
  getCurrentGeoJSON?: () => any
) => {
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importedFile, setImportedFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Export GeoJSON
  const handleExportGeoJSON = useCallback(() => {
    let geojsonToExport = boundaryData?.geojson;

    if (getCurrentGeoJSON) {
      const liveGeoJSON = getCurrentGeoJSON();
      if (liveGeoJSON) {
        geojsonToExport = liveGeoJSON;
      }
    }

    if (!geojsonToExport) {
      setError("No boundary data to export");
      return;
    }

    try {
      const geojsonData = {
        type: "Feature",
        properties: {
          regionId: regionId,
          regionName: region?.name || "Unknown",
          version: boundaryData?.version || 1,
          exportedAt: new Date().toISOString(),
          exportedBy: "Admin",
        },
        geometry: geojsonToExport,
      };

      const blob = new Blob([JSON.stringify(geojsonData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${region?.name || "boundary"}-${new Date().toISOString().split("T")[0]}.geojson`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSuccess("Boundary exported successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error("Export failed:", err);
      setError("Failed to export boundary");
    }
  }, [boundaryData, region, regionId, setError, setSuccess, getCurrentGeoJSON]);

  // Import File Handler
  const handleImportFile = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".geojson") && !file.name.endsWith(".json")) {
      setError("Please select a valid GeoJSON file (.geojson or .json)");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const geojson = JSON.parse(content);

        // Validate GeoJSON
        let geometry;
        if (geojson.type === "Feature" && geojson.geometry) {
          geometry = geojson.geometry;
        } else if (geojson.type === "Polygon" || geojson.type === "MultiPolygon") {
          geometry = geojson;
        } else {
          throw new Error("Invalid GeoJSON format. Must be Feature or Polygon/MultiPolygon.");
        }

        if (!["Polygon", "MultiPolygon"].includes(geometry.type)) {
           throw new Error("Geometry must be Polygon or MultiPolygon");
        }

        setImportedFile(file);
        setImportPreview(geometry);
        setShowImportDialog(true);
        setError(null);
      } catch (err: any) {
        console.error("Import validation failed:", err);
        setError(err.message || "Invalid GeoJSON file format");
        setImportedFile(null);
        setImportPreview(null);
      } finally {
        // Reset the input value so the same file can be selected again
        event.target.value = '';
      }
    };
    reader.readAsText(file);
  }, [setError]);

  // Confirm Import
  const handleConfirmImport = useCallback(() => {
    if (!importPreview) return;
    try {
      const paths = geojsonToGooglePaths(importPreview);
      setEditablePaths(paths);
      setEditMode(true);
      setHasChanges(true);
      setShowImportDialog(false);
      setImportedFile(null);
      setImportPreview(null);
      saveToHistory(paths);

      setSuccess("GeoJSON imported successfully! You can now edit and save.");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error("Import failed:", err);
      setError("Failed to import GeoJSON into editor");
    }
  }, [importPreview, setEditablePaths, setEditMode, setHasChanges, saveToHistory, setSuccess, setError]);

  return {
    showImportDialog,
    setShowImportDialog,
    importedFile,
    setImportedFile,
    importPreview,
    setImportPreview,
    fileInputRef,
    handleExportGeoJSON,
    handleImportFile,
    handleConfirmImport
  };
};

