import { useState, useEffect, useMemo } from "react";
import { networkPlanningService } from "../services/api";

interface UseInfrastructureMapDataProps {
  activeMapFileId?: number;
  files: any[];
  importFolderFiles: any[];
  isMapView: boolean;
}

export const useInfrastructureMapData = ({
  activeMapFileId,
  files,
  importFolderFiles,
  isMapView,
}: UseInfrastructureMapDataProps) => {
  const [singleFile, setSingleFile] = useState<any>(null);
  const [globalStats, setGlobalStats] = useState<{ total: number }>({
    total: 0,
  });
  const [allFiles, setAllFiles] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      // 1. Load specific file details (Forced fetch to ensure we get 'bounds' metadata)
      if (activeMapFileId) {
        try {
          const fromService =
            await networkPlanningService.getFile(activeMapFileId);
          setSingleFile(fromService);
        } catch (e) {
          setSingleFile(null);
        }
      } else {
        setSingleFile(null);
      }

      // 2. Load Map Data (Stats & All Files)
      if (isMapView) {
        try {
          if (!activeMapFileId) {
            const stats = await networkPlanningService.getMapStats();
            setGlobalStats(stats || { total: 0 });
          }

          // Fetch all files for global selector
          const allFilesList = await networkPlanningService.getAllFiles();
          setAllFiles(allFilesList || []);
        } catch (e) {
          console.error("Failed to load map data", e);
        }
      }
    };
    loadData();
  }, [activeMapFileId, files, importFolderFiles, isMapView]);

  const currentMapFile = useMemo(() => {
    if (!activeMapFileId) return undefined;
    return (
      files.find((f) => f.id === activeMapFileId) ||
      importFolderFiles.find((f) => f.id === activeMapFileId) ||
      singleFile
    );
  }, [activeMapFileId, files, importFolderFiles, singleFile]);

  return { singleFile, globalStats, allFiles, currentMapFile };
};

