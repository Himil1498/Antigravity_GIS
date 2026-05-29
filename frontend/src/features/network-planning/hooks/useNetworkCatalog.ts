import { useState, useEffect, useRef } from "react";
import { FolderItem, CatalogData } from "../types";
import { networkPlanningService } from "../services/api";

export const useNetworkCatalog = (
  isOpen: boolean,
  token: string | null,
  userId: number | undefined,
  selectedRegionIds: number[], // Re-added for Stats Calculation
  visibleFolderIds: number[], 
  visibleFileIds: number[] = [],
  onCatalogLoaded?: (folderMap: any) => void,
  searchQuery: string = "",
) => {
  const [rawData, setRawData] = useState<CatalogData | null>(null);
  const [data, setData] = useState<CatalogData | null>(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<{ total: number } | null>(null);

  const lastFetchKey = useRef<string>("");
  const errorRetryCount = useRef(0);
  const MAX_AUTO_RETRIES = 2;

  // Fetch Catalog
  useEffect(() => {
    const fetchKey = `${isOpen}-${token}-${userId}`;
    if (isOpen && token && fetchKey !== lastFetchKey.current) {
      setLoading(true);
      lastFetchKey.current = fetchKey;
      errorRetryCount.current = 0; // Reset retries for a genuinely new key
      
      networkPlanningService
        .getUnifiedCatalog(userId || 0)
        .then((res) => {
          // Recursive Sanitization Helper
          const sanitize = (items: FolderItem[]): FolderItem[] => {
            return items.map((item) => ({
              ...item,
              children: item.children ? sanitize(item.children) : [],
              files: item.files
                ? item.files.filter(
                    (f: any) =>
                      !(
                        (f.metadata &&
                          (f.metadata.is_outcome === true ||
                            f.metadata.is_outcome === "true")) ||
                        (f.properties &&
                          (f.properties.is_outcome === true ||
                            f.properties.is_outcome === "true"))
                      ),
                  )
                : [],
            }));
          };

          const cleanData = {
            infrastructure: sanitize(res.infrastructure || []),
            customers: sanitize(res.customers || []),
            others: sanitize(res.others || []),
          };

          setRawData(cleanData);
          setData(cleanData); // Initial set
          errorRetryCount.current = 0;
        })
        .catch((err) => {
          console.error("[NetworkCatalog] Fetch failed:", err);
          // Do NOT reset lastFetchKey — prevents infinite retry storms on re-render.
          // Allow limited automatic retries with delay instead.
          if (errorRetryCount.current < MAX_AUTO_RETRIES) {
            errorRetryCount.current += 1;
            const delay = 2000 * errorRetryCount.current; // 2s, 4s backoff
            setTimeout(() => {
              lastFetchKey.current = ""; // Only reset after delay
            }, delay);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, token, userId]);

  // Filtering Logic
  useEffect(() => {
    if (!rawData) {
      setData(null);
      return;
    }

    if (!searchQuery.trim()) {
      setData(rawData);
      return;
    }

    // Multi-term search logic: Split by comma and trim terms
    const searchTerms = searchQuery
      .toLowerCase()
      .split(",")
      .map((term) => term.trim())
      .filter((term) => term.length > 0);

    const filterTree = (items: FolderItem[]): FolderItem[] => {
      return items.reduce<FolderItem[]>((acc, item) => {
        const folderNameLower = item.name.toLowerCase();
        
        // Match if ANY of the terms are included in the folder name
        const matchesSelf = searchTerms.some((term) => 
          folderNameLower.includes(term)
        );

        if (matchesSelf) {
          // If folder matches any term, keep it and its entire subtree
          acc.push(item);
        } else if (item.children) {
          // If folder doesn't match, recursively check children
          const filteredChildren = filterTree(item.children);
          if (filteredChildren.length > 0) {
            acc.push({ ...item, children: filteredChildren });
          }
        }
        return acc;
      }, []);
    };

    setData({
      infrastructure: filterTree(rawData.infrastructure),
      customers: filterTree(rawData.customers),
      others: filterTree(rawData.others),
    });
  }, [rawData, searchQuery]);

  // Stats Calculation (Server-side to account for region filtering)
  useEffect(() => {
    if (!visibleFileIds || visibleFileIds.length === 0) {
      setStats({ total: 0 });
      return;
    }

    // Debounce to prevent rapid API calls
    const timer = setTimeout(() => {
      networkPlanningService
        .getMapStats(selectedRegionIds, visibleFileIds)
        .then((res) => setStats(res))
        .catch((e) => console.error("Failed to fetch map stats", e));
    }, 300);

    return () => clearTimeout(timer);
  }, [visibleFileIds, selectedRegionIds]);

  // Bubble up folder names (Use Raw Data to ensure we map ALL folders for legend, not just filtered ones)
  useEffect(() => {
    if (rawData && onCatalogLoaded) {
      const map: Record<number, any> = {};

      const traverse = (
        folders: FolderItem[],
        type: "infrastructure" | "customer",
        parentPath: string = "",
      ) => {
        folders.forEach((f) => {
          const fullPath = parentPath ? `${parentPath} > ${f.name}` : f.name;

          map[f.id] = {
            name: fullPath,
            type: type,
            iconType: f.default_icon || f.category, // Pass Folder Icon
            files: f.files
              ? f.files
                  .filter(
                    (file: any) =>
                      !(
                        (file.metadata &&
                          (file.metadata.is_outcome === true ||
                            file.metadata.is_outcome === "true")) ||
                        (file.properties &&
                          (file.properties.is_outcome === true ||
                            file.properties.is_outcome === "true"))
                      ),
                  )
                  .map((file) => ({
                    id: file.id,
                    name: file.name,
                    iconType: file.icon_type,
                    properties: file.properties,
                    metadata: file.metadata,
                  }))
              : [],
          };

          if (f.children && f.children.length > 0) {
            traverse(f.children, type, fullPath);
          }
        });
      };

      if (rawData.infrastructure)
        traverse(rawData.infrastructure, "infrastructure");
      if (rawData.customers) traverse(rawData.customers, "customer");
      if (rawData.others)
        traverse(rawData.others, "infrastructure");

      onCatalogLoaded(map);
    }
  }, [rawData, onCatalogLoaded]);

  return {
    data, // Returns filtered data
    loading,
    stats,
  };
};

