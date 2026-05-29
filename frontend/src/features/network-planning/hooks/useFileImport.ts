import { useState, useCallback, useRef, useEffect } from "react";
import { NetworkFolder } from "../types";
import { showToast } from "../../../utils/toastUtils";

interface UseFileImportProps {
  folder: NetworkFolder | null;
  onUpload: (files: File[], iconType: string) => Promise<void>;
  files?: any[]; // New prop for smart checking
}

export const useFileImport = ({
  folder,
  onUpload,
  files = [],
}: UseFileImportProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState("layer-group");
  const [pendingFileNames, setPendingFileNames] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-select category based on folder name or configuration
  useEffect(() => {
    if (!folder) return;

    // 1. Explicit Configuration (Custom Folders or System Configured)
    if (folder.default_icon && folder.default_icon !== "DEFAULT") {
      setSelectedIcon(folder.default_icon);
      return;
    }

    const name = folder.name.toUpperCase();

    // 2. Inherit Parent Icon based on Name (Legacy/System)
    if (name.includes("ASCEND")) {
      setSelectedIcon("ASCEND");
      return;
    }
    if (name.includes("ELEVOR")) {
      setSelectedIcon("ELEVOR");
      return;
    }
    if (name.includes("INDUS")) {
      setSelectedIcon("INDUS");
      return;
    }
    if (name.includes("INFRA")) {
      setSelectedIcon("INFRA-PROVIDER");
      return;
    }

    // ISPs
    if (name.includes("AIRTEL")) {
      setSelectedIcon("AIRTEL");
      return;
    }
    if (name.includes("JIO")) {
      setSelectedIcon("JIO");
      return;
    }
    if (name.includes("TATA")) {
      setSelectedIcon("TATA");
      return;
    }
    if (name.includes("VODA")) {
      setSelectedIcon("VODAFONE");
      return;
    }
    if (name.includes("BSNL")) {
      setSelectedIcon("BSNL");
      return;
    }

    // System Folders Explicit Match
    if (name.includes("BANDWIDTH")) {
      setSelectedIcon("BANDWIDTH-DROP-BTS");
      return;
    }
    if (name.includes("NODE")) {
      setSelectedIcon("NODE");
      return;
    }
    if (name.includes("BTS")) {
      setSelectedIcon("BTS-STATION");
      return;
    }
    if (name.includes("DATA CENTER")) {
      setSelectedIcon("DATACENTER");
      return;
    }
    if (name.includes("OFFICE")) {
      setSelectedIcon("OFFICE-LOCATIONS");
      return;
    }
    // Explicit Provider Rules (Safety Net)
    if (name.includes("SUB POP") || name.includes("SUB-POP")) {
      setSelectedIcon("SUB-POP");
      return;
    }
    if (name.includes("POP")) {
      setSelectedIcon("POP");
      return;
    }

    if (name.includes("RAIL") || name.includes("RAILTAIL")) {
      setSelectedIcon("RAILTAIL");
      return;
    }
    if (name.includes("PGCIL")) {
      setSelectedIcon("PGCIL");
      return;
    }
    if (name.includes("RCOM")) {
      setSelectedIcon("RCOM");
      return;
    }
    if (name.includes("SIFY")) {
      setSelectedIcon("SIFY");
      return;
    }
    if (name.includes("TTSL")) {
      setSelectedIcon("TTSL");
      return;
    }
    if (name.includes("JTM")) {
      setSelectedIcon("JTM");
      return;
    }
    if (name.includes("OPTIMAL")) {
      setSelectedIcon("OPTIMAL");
      return;
    }
    if (name.includes("NNI")) {
      setSelectedIcon("NNI");
      return;
    }
    if (name.includes("SUB POP") || name.includes("SUB-POP")) {
      setSelectedIcon("SUB-POP");
      return;
    }

    // 3. Category Fallback
    if (name.includes("CUSTOMER")) {
      setSelectedIcon("customer");
    } else {
      setSelectedIcon("layer-group");
    }
  }, [folder]);

  // Helper to normalize filenames for comparison (ignores case, spaces, special chars)
  const normalize = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]/g, "");

  // SMART CHECK: If uploading, check if the files have appeared in the list
  useEffect(() => {
    if (uploading && pendingFileNames.length > 0 && files.length > 0) {
      // Check if ALL pending files are present in the 'files' list AND completed processing
      const allPendingFound = pendingFileNames.every((pendingName) =>
        files.some((f) => {
          // Normalize names
          const nameMatch =
            f.name === pendingName ||
            normalize(f.name) === normalize(pendingName);
          const isCompleted = f.processing_status === "completed";
          return nameMatch && isCompleted; // ✅ Wait for actual completion
        }),
      );

      if (allPendingFound) {
        console.log(
          "✅ Smart Check: Files detected & completed. Stopping loader.",
        );
        setUploading(false);
        setPendingFileNames([]);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    }
  }, [files, uploading, pendingFileNames]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const processFiles = useCallback(
    async (selectedFiles: File[]) => {
      // 1. Size Validation (50MB)
      const MAX_SIZE = 50 * 1024 * 1024;
      const oversized = selectedFiles.filter((f) => f.size > MAX_SIZE);
      if (oversized.length > 0) {
        showToast.warning(
          `Files exceed 50MB limit: ${oversized.map((f) => f.name).join(", ")}`,
        );
        return;
      }

      const validFiles = selectedFiles.filter(
        (file) =>
          file.name.toLowerCase().endsWith(".kml") ||
          file.name.toLowerCase().endsWith(".kmz"),
      );

      if (validFiles.length === 0) {
        showToast.warning("Please upload .kml or .kmz files only.");
        return;
      }

      setUploading(true);
      setPendingFileNames(validFiles.map((f) => f.name));

      try {
        // Enforce a safety timeout to prevent infinite loading state
        const TIMEOUT_MS = 305000; // 5m 5s (Backend timeout is 5m)
        await Promise.race([
          onUpload(validFiles, selectedIcon),
          new Promise((_, reject) =>
            setTimeout(
              () =>
                reject(
                  new Error("Upload timed out - please check the file list"),
                ),
              TIMEOUT_MS,
            ),
          ),
        ]);
      } catch (e) {
        console.error("Upload error:", e);
        // Optional: Show error to user via alert or toast if not handled upstream
      } finally {
        // If Smart Check hasn't already stopped it
        setUploading(false);
        setPendingFileNames([]);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [onUpload, selectedIcon],
  );

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      if (e.dataTransfer.files?.length > 0) {
        await processFiles(Array.from(e.dataTransfer.files));
      }
    },
    [processFiles],
  );

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.length) {
        await processFiles(Array.from(e.target.files));
      }
    },
    [processFiles],
  );

  return {
    isDragging,
    uploading,
    selectedIcon,
    setSelectedIcon,
    fileInputRef,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileSelect,
  };
};

