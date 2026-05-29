import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { networkPlanningService } from "../services/api";
import { NetworkFolder, NetworkFile } from "../types";
import { showToast } from "../../../utils/toastUtils";

export const useNetworkContents = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const urlPath = searchParams.get("path");
  
  // High-performance State Cache: Fetch O(1) folderId from browser history state if available
  const stateFolderId = location.state?.folderId as number | undefined;
  
  // Also support folderId from URL search params (e.g., from notification links)
  const urlFolderId = searchParams.get("folderId") ? parseInt(searchParams.get("folderId") as string) : undefined;
  const effectiveFolderId = stateFolderId || urlFolderId || null;

  const [folders, setFolders] = useState<NetworkFolder[]>([]);
  const [files, setFiles] = useState<NetworkFile[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<NetworkFolder[]>([]);
  
  // Derive currentFolderId safely from breadcrumbs (truth source of current location)
  const currentFolderId = breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].id : null;
  const [loading, setLoading] = useState(false);

  const fetchContents = useCallback(
    async (targetPath: string | null, targetId: number | null, silent = false) => {
      try {
        if (!silent) setLoading(true);
        // Admin Panel: We ALWAYS want to see approved outcomes
        const includeApproved = true;
        const target = targetId || targetPath || "root";
        
        const data = await networkPlanningService.getFolderContents(
          target,
          includeApproved,
        );
        // console.log('API Response Data:', data); // Reduced logs
        setFolders(data?.folders || []);
        setFiles(data?.files || []);
        setBreadcrumbs(data?.breadcrumbs || []);
        // Removed setCurrentFolderId since it's derived directly from URL now
      } catch (error) {
        console.error("Failed to fetch folder contents:", error);
        if (!silent) showToast.error("Failed to load folder contents");
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [],
  );

  // Initial load
  useEffect(() => {
    fetchContents(urlPath || null, effectiveFolderId);
  }, [fetchContents, urlPath, effectiveFolderId]);

  const createFolder = async (name: string, defaultIcon?: string) => {
    try {
      await networkPlanningService.createFolder(
        name,
        currentFolderId,
        defaultIcon,
      );
      showToast.success(`Folder "${name}" created successfully`);
      fetchContents(urlPath || null, currentFolderId, true); // Silent Refresh
    } catch (error) {
      console.error("Failed to create folder:", error);
      showToast.error("Failed to create folder");
      throw error;
    }
  };

  const deleteFolder = async (folder: NetworkFolder) => {
    // Optimistic Update
    setFolders((current) => current.filter((f) => f.id !== folder.id));

    try {
      await networkPlanningService.deleteFolder(folder.id);
      showToast.success(`Folder "${folder.name}" deleted successfully`);
      fetchContents(urlPath || null, currentFolderId, true); // Silent Refresh
    } catch (err) {
      console.error(err);
      showToast.error(`Failed to delete folder "${folder.name}"`);
      fetchContents(urlPath || null, currentFolderId, true);
    }
  };

  const uploadFiles = async (
    folderId: number,
    files: File[],
    iconType?: string,
  ) => {
    try {
      await networkPlanningService.uploadFiles(folderId, files, iconType);
      showToast.success("Files uploaded successfully");
      fetchContents(urlPath || null, currentFolderId, true); // Silent Refresh
    } catch (err) {
      console.error(err);
      showToast.error("Failed to upload files");
      throw err;
    }
  };

  const deleteFile = async (fileId: number) => {
    try {
      // NO optimistic update - wait for confirmation
      await networkPlanningService.deleteFile(fileId);

      // Only update UI after successful delete
      setFiles((current) =>
        current.filter((f) => String(f.id) !== String(fileId)),
      );
      showToast.success("File deleted successfully");

      // Optional: Silent refresh to ensure consistency
      fetchContents(urlPath || null, currentFolderId, true);
    } catch (err: any) {
      console.error("Delete failed:", err);
      const errorMsg = err.response?.data?.message || "Failed to delete file";
      showToast.error(errorMsg);
      throw err; // Re-throw so caller knows it failed
    }
  };

  const navigateTo = (folderId: number | null, folderName?: string) => {
    const newParams = new URLSearchParams(searchParams);
    
    // Always clear old formats
    newParams.delete("folderId");
    newParams.delete("folder");
    
    let newPathSegments: string[] = [];

    if (folderId) {
      const isBreadcrumbClick = breadcrumbs.some((b) => b.id === folderId);

      if (isBreadcrumbClick) {
        // Going backwards: Extract path up to the clicked breadcrumb
        const index = breadcrumbs.findIndex((b) => b.id === folderId);
        newPathSegments = breadcrumbs.slice(0, index + 1).map((b) => b.name);
      } else {
        // Going forwards: Append to existing path
        newPathSegments = [...breadcrumbs.map((b) => b.name)];
        let name = folderName;
        if (!name) {
          const target = folders.find((f) => f.id === folderId);
          if (target) name = target.name;
        }
        if (name) newPathSegments.push(name);
      }
      
      if (newPathSegments.length > 0) {
        newParams.set("path", newPathSegments.join("/"));
      } else {
        newParams.delete("path");
      }
    } else {
      newParams.delete("path");
    }
    
    // Push the state to browser history! Includes visual 'path', and high-perf 'state: folderId'
    navigate(
      { search: newParams.toString() },
      { state: { folderId } }
    );
  };

  return {
    currentFolderId,
    folders,
    files,
    breadcrumbs,
    loading,
    navigateTo,
    createFolder,
    deleteFolder,
    uploadFiles,
    deleteFile,
    refresh: () => fetchContents(urlPath || null, currentFolderId),
    silentRefresh: () => fetchContents(urlPath || null, currentFolderId, true),
  };
};

