import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, LayoutGroup, AnimatePresence, Variants } from "framer-motion";
import { useAppSelector, RootState } from "../store/index";
import UserFilterControl from "../components/ui/UserFilterControl";
import VirtualizedList from "../components/ui/VirtualizedList";
import GISDataListItem from "../features/map/components/datahub/GISDataListItem";
import { gisToolsService } from "../services/gisTools/index";
import { apiService } from "../services/api/index";
import {
  getUserAssignedRegionsSync,
  detectStateFromCoordinates,
} from "../utils/regionMapping/index";
import type {
  DistanceMeasurement,
  PolygonDrawing,
  CircleDrawing,
  SectorRF,
  ElevationProfile,
} from "../services/gisTools/index";
import { showToast, toastMessages } from "../utils/toastUtils";
import { parseUserId, rolesMatch } from "../utils/userHelpers";
import ElevationGraphModal from "../components/ui/modals/ElevationGraphModal";
import ImportDataModal from "../features/map/components/datahub/ImportDataModal";
import {
  getTemporaryData,
  deleteTemporaryItem,
  convertTempToPermanentData,
  getTimeRemaining,
  isNearExpiry,
  type TemporaryStorageItem,
  type GISToolType,
} from "../services/temporaryStorage/index";
import {
  elevationProfileService,
  distanceMeasurementService,
  polygonDrawingService,
  circleDrawingService,
  sectorRFService,
} from "../services/gisTools/index";
import { useTemporaryDataReminder } from "../hooks/useTemporaryDataReminder";

import { websocketService } from "../services/websocket/index";

import { debounce } from "../utils/gisDebounce";
import { 
  Ruler, 
  Hexagon, 
  Circle, 
  Wifi, 
  Mountain, 
  Activity,
  Layers,
  Search,
  Database,
  Trash2,
  ExternalLink,
  Info,
  ChevronRight,
  Globe,
  Home,
  X,
  Clock
} from "lucide-react";
import DataListSkeleton from "../components/ui/DataListSkeleton";

/**
 * GIS Data Hub - Complete Enhanced Version with Beautiful UI
 * All features included: Data rendering, filters, modals, actions
 */

// Format date helper
const formatDate = (dateString?: string) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Format distance helper
const formatDistance = (meters: number) => {
  if (!meters && meters !== 0) return "0 m";
  if (meters < 1000) return `${meters.toFixed(2)} m`;
  return `${(meters / 1000).toFixed(2)} km`;
};

// Format area helper
const formatArea = (sqMeters: number) => {
  if (!sqMeters && sqMeters !== 0) return "0 m²";
  if (sqMeters < 1000000) return `${sqMeters.toFixed(2)} m²`;
  return `${(sqMeters / 1000000).toFixed(2)} km²`;
};

const GISDataHub: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [selectedUserId, setSelectedUserId] = useState<number | "all" | "me">("me");

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTabFromUrl = searchParams.get("tab") as "distance" | "polygon" | "circle" | "sector" | "elevation" | null;
  const activeTab = activeTabFromUrl || "distance";

  const handleTabChange = (tab: "distance" | "polygon" | "circle" | "sector" | "elevation") => {
    setSearchParams({ tab });
  };

  // 🆕 Automatically set tab=distance in URL if no tab is present
  useEffect(() => {
    if (!searchParams.get("tab")) {
      setSearchParams({ tab: "distance" }, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Data states
  const [distanceMeasurements, setDistanceMeasurements] = useState<
    DistanceMeasurement[]
  >([]);
  const [polygonDrawings, setPolygonDrawings] = useState<PolygonDrawing[]>([]);
  const [circleDrawings, setCircleDrawings] = useState<CircleDrawing[]>([]);
  const [sectorRF, setSectorRF] = useState<any[]>([]);
  const [elevationProfiles, setElevationProfiles] = useState<
    ElevationProfile[]
  >([]);
  const [hasElevationFilter, setHasElevationFilter] = useState<boolean>(false);

  // Data refresh key to force UI updates
  const [dataRefreshKey, setDataRefreshKey] = useState<number>(0);

  // Temporary data states
  const [tempItems, setTempItems] = useState<TemporaryStorageItem[]>([]);
  const [tempSectionCollapsed, setTempSectionCollapsed] =
    useState<boolean>(false);

  // Modal states
  const [viewDetailsModal, setViewDetailsModal] = useState<{
    isOpen: boolean;
    data: any;
    type: string;
  }>({
    isOpen: false,
    data: null,
    type: "",
  });

  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    isOpen: boolean;
    type: string;
    id: number | null;
    itemName: string;
    userId?: number;
  }>({
    isOpen: false,
    type: "",
    id: null,
    itemName: "",
    userId: undefined,
  });

  // Bulk Delete Modal
  const [bulkDeleteModal, setBulkDeleteModal] = useState<{
    isOpen: boolean;
    category: string;
    categoryLabel: string;
  }>({
    isOpen: false,
    category: "",
    categoryLabel: "",
  });

  // Delete Selected Modal
  const [deleteSelectedModal, setDeleteSelectedModal] = useState<{
    isOpen: boolean;
    type: string;
    count: number;
    onConfirm: () => void;
  }>({
    isOpen: false,
    type: "",
    count: 0,
    onConfirm: () => {},
  });

  // Notification Modal
  const [notificationModal, setNotificationModal] = useState<{
    isOpen: boolean;
    type: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
  });

  // 🆕 Elevation Graph Modal
  const [elevationModal, setElevationModal] = useState<{
    isOpen: boolean;
    data: any;
  }>({
    isOpen: false,
    data: null,
  });

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    distanceMeasurements: 0,
    polygonDrawings: 0,
    circleDrawings: 0,
    sectorRF: 0,
    elevationProfiles: 0,
  });

  // Export states
  const [exportLoading, setExportLoading] = useState<boolean>(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Selection states - Track selected items by ID for each category
  const [selectedDistance, setSelectedDistance] = useState<Set<number>>(
    new Set(),
  );
  const [selectedPolygon, setSelectedPolygon] = useState<Set<number>>(
    new Set(),
  );
  const [selectedCircle, setSelectedCircle] = useState<Set<number>>(new Set());
  const [selectedSector, setSelectedSector] = useState<Set<number>>(new Set());
  const [selectedElevation, setSelectedElevation] = useState<Set<number>>(
    new Set(),
  );

  // Define icon variants for hover consistency
  const iconVariants: Variants = {
    idle: { scale: 1, rotate: 0, y: 0 },
    hover: { 
      scale: 1.15, 
      rotate: [0, -10, 10, 0],
      y: [0, -2, 0],
      transition: { duration: 0.4 }
    }
  };

  // Scroll to top state
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);

  // Initialize temporary data reminder system
  useTemporaryDataReminder({
    userId: user?.id?.toString(),
    isEnabled: true,
  });

  // Load data when user filter changes
  useEffect(() => {
    loadData();
  }, [selectedUserId]);

  // Scroll to top button visibility handler
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Debounce search term (500ms delay)
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  // Handle Real-time Updates via WebSocket
  useEffect(() => {
    let subscriptionId: string | null = null;
    console.log("🔌 [GISDataHub] Setting up real-time subscription...");

    // Debounced refresh function (1 second)
    const debouncedRefresh = debounce(() => {
      console.log(
        "🔄 [GISDataHub] Real-time update RECEIVED! Refreshing data hub...",
      );
      loadData();
    }, 1000);

    const setupSubscription = () => {
      // Subscribe to GIS update channel
      subscriptionId = websocketService.subscribe(
        "gis_data_updated",
        (data: any) => {
          console.log(
            "📨 [GISDataHub] WebSocket signal: GIS data changed",
            data,
          );
          debouncedRefresh();
        },
      );
      console.log(
        `✅ [GISDataHub] Subscribed to 'gis_data_updated' (SubID: ${subscriptionId})`,
      );
    };

    // Ensure connection is active
    if (!websocketService.isConnected()) {
      console.log(
        "🔄 [GISDataHub] WebSocket not connected, attempting to connect...",
      );
      websocketService.connect().then((connected: boolean) => {
        if (connected) {
          console.log(
            "✅ [GISDataHub] WebSocket connected successfully from Data Hub",
          );
          setupSubscription();
        } else {
          console.error(
            "❌ [GISDataHub] WebSocket connection FAILED from Data Hub",
          );
        }
      });
    } else {
      console.log("✅ [GISDataHub] WebSocket already connected");
      setupSubscription();
    }

    // Cleanup on unmount
    return () => {
      if (subscriptionId) {
        console.log(
          `🔌 [GISDataHub] Cleaning up subscription: ${subscriptionId}`,
        );
        websocketService.unsubscribe(subscriptionId);
      }
      debouncedRefresh.cancel();
    };
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const LIMIT = 100;
      const filters = { userId: selectedUserId, limit: LIMIT };
      const data = await gisToolsService.getAllAggregated(filters);

      // Check if any category hit the limit
      const hasTruncatedData =
        data.distanceMeasurements.length >= LIMIT ||
        data.polygonDrawings.length >= LIMIT ||
        data.circleDrawings.length >= LIMIT ||
        data.sectorRF.length >= LIMIT ||
        data.elevationProfiles.length >= LIMIT;

      if (hasTruncatedData) {
        showToast.info(
          `Showing recent ${LIMIT} items per category. Search to find older items.`,
        );
      }

      setDistanceMeasurements(data.distanceMeasurements);
      setPolygonDrawings(data.polygonDrawings);
      setCircleDrawings(data.circleDrawings);
      setSectorRF(data.sectorRF);
      setElevationProfiles(data.elevationProfiles);

      // Load temporary data from localStorage
      if (user?.id) {
        const userId = user.id.toString();
        const tempData = getTemporaryData(userId);
        setTempItems(tempData);
      }

      /* Infrastructure data loading removed */
      /*
      // Infrastructure data loading & filtering
      let infrastructureData: any[] = [];
      try {
        const rawInfraData = await apiService.getAllInfrastructure();
        // ... (removed logic)
      } catch (infraError) {
        console.error("Failed to load infrastructure data:", infraError);
        infrastructureData = [];
      }
      */

      // Force UI refresh by updating refresh key
      setDataRefreshKey((prev) => prev + 1);
      // console.log('🔄 Triggered UI refresh');

      const finalStats = {
        total: data.total,
        distanceMeasurements: data.distanceMeasurements.length,
        polygonDrawings: data.polygonDrawings.length,
        circleDrawings: data.circleDrawings.length,
        sectorRF: data.sectorRF.length,
        elevationProfiles: data.elevationProfiles.length,
      };

      setStats(finalStats);
    } catch (error) {
      console.error("Error loading GIS data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Check page access permission
  const canAccessDataHub = useMemo(() => {
    if (!user) return false;
    if (rolesMatch(user.role, "Admin")) return true;
    const hasDirect = user.directPermissions?.includes("datahub:view");
    const hasLegacy = (user.permissions as any)?.includes("datahub:view");
    return hasDirect || hasLegacy;
  }, [user]);

  // Helper to check permission (supporting both direct and legacy)
  const hasPermission = useCallback(
    (permission: string) => {
      if (!user) return false;
      if (rolesMatch(user.role, "Admin")) return true;

      return (
        user.directPermissions?.includes(permission) ||
        (user.permissions as any)?.includes(permission)
      );
    },
    [user],
  );

  // Check granular permissions
  const canFilter = useMemo(() => {
    return hasPermission("datahub:feature:filter");
  }, [hasPermission]);

  const canDeleteAll = useMemo(() => {
    return hasPermission("datahub:feature:delete_all");
  }, [hasPermission]);

  const canEditDelete = useCallback(
    (itemUserId?: number) => {
      if (!user?.id) return false;
      // Admin can delete any data
      if (rolesMatch(user?.role, "Admin")) return true;

      // Check specific delete permission
      if (!hasPermission("datahub:feature:delete")) return false;

      // Regular users can only delete their own data
      const currentUserId = parseUserId(user.id);
      return itemUserId === currentUserId;
    },
    [user, hasPermission],
  );

  // Ensure active tab is allowed
  useEffect(() => {
    // List of all tabs with permissions
    const tabs = [
      { id: "distance", permission: "map:tools:distance" },
      { id: "polygon", permission: "map:tools:polygon" },
      { id: "circle", permission: "map:tools:circle" },
      { id: "sector", permission: "map:tools:sector_rf" },
      { id: "elevation", permission: "map:tools:elevation" },
    ];

    // Find first allowed tab
    const allowedTabs = tabs.filter(
      (tab) => !tab.permission || hasPermission(tab.permission),
    );

    // If current active tab is not allowed, switch to first allowed
    const currentTabAllowed = allowedTabs.find((tab) => tab.id === activeTab);
    if (!currentTabAllowed && allowedTabs.length > 0) {
      handleTabChange(allowedTabs[0].id as any);
    }
  }, [activeTab, hasPermission]);

  const handleViewDetails = useCallback(async (data: any, type: string) => {
    // 🔍 For elevation profiles, fetch full data with JSON fields
    if (type === "elevation" && data.id) {
      try {
        const fullData = await elevationProfileService.getById(data.id);
        if (fullData) {
          setViewDetailsModal({ isOpen: true, data: fullData, type });
          return;
        }
      } catch (error) {
        console.error("Error fetching full elevation data:", error);
        // Fall back to summary data if fetch fails
      }
    }
    // For other types, use the summary data from the list
    setViewDetailsModal({ isOpen: true, data, type });
  }, []);

  const handleViewOnMap = useCallback(
    async (data: any, type: string) => {
      // 🔍 For elevation profiles, fetch full data with JSON fields
      let dataToView = data;
      if (type === "elevation" && data.id) {
        try {
          const fullData = await elevationProfileService.getById(data.id);
          if (fullData) {
            dataToView = fullData;
          }
        } catch (error) {
          console.error(
            "Error fetching full elevation data for map view:",
            error,
          );
          // Fall back to summary data if fetch fails
        }
      }

      // 🔍 For distance measurements, ensure points array exists
      if (type === "distance") {
        // 1. First check if we already have valid points (e.g. from multi-point measurement)
        let existingPoints = dataToView.points;

        // Parse points if it happens to be a string (defensive coding)
        if (existingPoints && typeof existingPoints === "string") {
          try {
            existingPoints = JSON.parse(existingPoints);
          } catch (e) {
            console.error("Error parsing points string:", e);
            existingPoints = null;
          }
        }

        if (Array.isArray(existingPoints) && existingPoints.length > 0) {
          // ensure points are numbers
          const processedPoints = existingPoints.map((p: any, idx: number) => ({
            lat: Number(p.lat),
            lng: Number(p.lng),
            label:
              p.label ||
              (idx === 0
                ? "A"
                : idx === existingPoints.length - 1
                  ? "B"
                  : undefined),
          }));

          dataToView = {
            ...dataToView,
            points: processedPoints,
          };
        }
        // 2. Fallback: Reconstruct from start/end coordinates (legacy/simple data)
        else if (
          data.start_lat !== undefined &&
          data.start_lat !== null &&
          data.end_lat !== undefined &&
          data.end_lat !== null
        ) {
          // Always reconstruct points array from start/end coordinates
          dataToView = {
            ...data,
            points: [
              {
                lat: Number(data.start_lat),
                lng: Number(data.start_lng),
                label: "A",
              },
              {
                lat: Number(data.end_lat),
                lng: Number(data.end_lng),
                label: "B",
              },
            ],
          };
        } else {
          console.warn("⚠️ Distance measurement missing coordinates:", data);
        }

        // Parse elevation_data if it's a string
        if (
          dataToView.elevation_data &&
          typeof dataToView.elevation_data === "string"
        ) {
          try {
            dataToView = {
              ...dataToView,
              elevation_data: JSON.parse(dataToView.elevation_data),
            };
          } catch (error) {
            console.error("Error parsing elevation data:", error);
          }
        }
      }

      sessionStorage.setItem(
        "viewOnMapData",
        JSON.stringify({ data: dataToView, type }),
      );
      navigate("/map");
    },
    [navigate],
  );

  const handleDeleteClick = useCallback(
    (type: string, id: number, itemName: string, itemUserId?: number) => {
      if (!canEditDelete(itemUserId)) {
        setNotificationModal({
          isOpen: true,
          type: "warning",
          title: "Permission Denied",
          message: "You can only delete your own data!",
        });
        return;
      }

      setDeleteConfirmModal({
        isOpen: true,
        type,
        id,
        itemName,
        userId: itemUserId,
      });
    },
    [canEditDelete, user],
  );

  const handleConfirmDelete = useCallback(async () => {
    const { type, id } = deleteConfirmModal;

    if (!id) return;

    console.log(`🗑️ Deleting single ${type} item with ID: ${id}...`);

    // Close modal immediately for better UX
    setDeleteConfirmModal({
      isOpen: false,
      type: "",
      id: null,
      itemName: "",
      userId: undefined,
    });

    try {
      // ✅ OPTIMISTIC UPDATE - Remove item from UI immediately
      if (type === "distance") {
        setDistanceMeasurements((prev) =>
          prev.filter((item) => item.id !== id),
        );
      } else if (type === "polygon") {
        setPolygonDrawings((prev) => prev.filter((item) => item.id !== id));
      } else if (type === "circle") {
        setCircleDrawings((prev) => prev.filter((item) => item.id !== id));
      } else if (type === "sector") {
        setSectorRF((prev) => prev.filter((item) => item.id !== id));
      } else if (type === "elevation") {
        setElevationProfiles((prev) => prev.filter((item) => item.id !== id));
      }

      // Now delete from backend
      // Now delete from backend
      if (
        type === "distance" ||
        type === "polygon" ||
        type === "circle" ||
        type === "sector" ||
        type === "elevation"
      ) {
        await apiService.deleteSingleData(type, id);
      }

      console.log(`✅ Successfully deleted ${type} item from backend`);
      showToast.success(toastMessages.gisData.deleted);
    } catch (error: any) {
      console.error("Error deleting item:", error);

      // ❌ ROLLBACK - If delete fails, reload data to restore state
      console.log("❌ Delete failed, reloading data to restore state...");
      await loadData();

      const errorMessage =
        error?.response?.data?.error ||
        "An error occurred while deleting the item.";
      showToast.error(errorMessage);
    }
  }, [deleteConfirmModal, loadData]);

  const handleBulkDeleteClick = useCallback(
    (category: string, categoryLabel: string) => {
      setBulkDeleteModal({
        isOpen: true,
        category,
        categoryLabel,
      });
    },
    [],
  );

  const handleConfirmBulkDelete = useCallback(async () => {
    const { category } = bulkDeleteModal;

    if (!category) return;

    console.log(`🗑️ Bulk deleting all ${category} items...`);

    try {
      // Set loading to show user something is happening
      setLoading(true);

      // Get the userId to delete (if viewing specific user as admin)
      let targetUserId: number | undefined = undefined;
      if (
        rolesMatch(user?.role, "Admin") &&
        selectedUserId !== "all" &&
        selectedUserId !== "me"
      ) {
        targetUserId = selectedUserId;
      }

      let apiCategory = category;
      // if (category === "distance") apiCategory = "measurements"; // FIX: Backend expects "distance"

      const result = await apiService.deleteBulkData(apiCategory, targetUserId);
      console.log(
        `✅ Successfully deleted ${result.deletedCount} items from backend`,
      );

      // Close modal first
      setBulkDeleteModal({
        isOpen: false,
        category: "",
        categoryLabel: "",
      });

      // Force reload data to update UI in real-time
      console.log("🔄 Reloading data...");
      await loadData();
      console.log("✅ Data reloaded successfully");

      // Show success message after data is reloaded
      showToast.success(
        toastMessages.gisData.bulkDeleted(result.deletedCount, category),
      );
    } catch (error: any) {
      console.error("Error bulk deleting items:", error);
      setBulkDeleteModal({
        isOpen: false,
        category: "",
        categoryLabel: "",
      });
      const errorMessage =
        error?.response?.data?.error ||
        "An error occurred while bulk deleting items.";
      showToast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [bulkDeleteModal, user, selectedUserId, loadData]);

  const renderUserBadge = useCallback(
    (username?: string) => {
      if (!username || selectedUserId === "me") return null;
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
              clipRule="evenodd"
            />
          </svg>
          {username}
        </span>
      );
    },
    [selectedUserId],
  );

  // Render storage type badge
  const renderStorageBadge = useCallback((item: any) => {
    if (item.storageType === "temporary") {
      const nearExpiry = isNearExpiry(item as TemporaryStorageItem);
      const timeRemaining = getTimeRemaining(item as TemporaryStorageItem);
      return (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
            nearExpiry
              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border border-red-300 dark:border-red-700"
              : "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 border border-orange-300 dark:border-orange-700"
          }`}
        >
          🕐 Temp ({timeRemaining})
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border border-green-300 dark:border-green-700">
        ♾️ Permanent
      </span>
    );
  }, []);

  // Removed convertTempToDisplayFormat and handleConvertToPermanent
  // Temporary data is now only shown in the temporary section

  // Filter items based on search term (debounced)
  const filterItems = <T extends Record<string, any>>(
    items: T[],
    nameField: string,
  ): T[] => {
    if (!debouncedSearchTerm.trim()) return items;
    const searchLower = debouncedSearchTerm.toLowerCase().trim();
    return items.filter((item) => {
      const name = (item[nameField] || "").toString().toLowerCase();
      const notes = (item.notes || "").toString().toLowerCase();
      const username = (item.username || "").toString().toLowerCase();
      return (
        name.includes(searchLower) ||
        notes.includes(searchLower) ||
        username.includes(searchLower)
      );
    });
  };

  // Temporary data is now only shown in the temporary section above
  // No longer merging temporary data with permanent data

  // ====================
  // Export Handlers
  // ====================
  const handleExportData = async (type: string, format: 'csv' | 'xlsx' = 'xlsx') => {
    try {
      setExportLoading(true);
      const scope = selectedUserId === 'all' ? 'all' : 'me';
      
      let selectedIds: number[] = [];
      if (type === 'distance') selectedIds = Array.from(selectedDistance);
      else if (type === 'polygon') selectedIds = Array.from(selectedPolygon);
      else if (type === 'circle') selectedIds = Array.from(selectedCircle);
      else if (type === 'sector') selectedIds = Array.from(selectedSector);
      else if (type === 'elevation') selectedIds = Array.from(selectedElevation);

      const payload: any = {
         export_type: type,
         export_scope: scope,
         export_settings: { format }
      };

      if (selectedIds.length > 0) {
         payload.selected_ids = selectedIds;
      }
      
      const response = await apiService.post('/datahub/export', payload, { responseType: 'blob' }); // Expecting a binary file buffer
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `export_${type}_${Date.now()}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      showToast.success(`Successfully exported ${type} data`);
    } catch (e: any) {
      console.error("Export failed", e);
      showToast.error('Failed to export data');
    } finally {
      setExportLoading(false);
    }
  };

  // ====================
  // Selection Handlers
  // ====================

  const toggleSelection = useCallback(
    (
      id: number,
      selected: Set<number>,
      setSelected: React.Dispatch<React.SetStateAction<Set<number>>>,
    ) => {
      const newSelected = new Set(selected);
      if (newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }
      setSelected(newSelected);
    },
    [],
  );

  const selectAll = useCallback(
    (
      items: any[],
      setSelected: React.Dispatch<React.SetStateAction<Set<number>>>,
    ) => {
      const allIds = new Set(items.map((item) => item.id));
      setSelected(allIds);
    },
    [],
  );

  const deselectAll = useCallback(
    (setSelected: React.Dispatch<React.SetStateAction<Set<number>>>) => {
      setSelected(new Set());
    },
    [],
  );

  const handleBulkDeleteSelected = useCallback(
    (type: string, selectedIds: Set<number>, clearSelection: () => void) => {
      if (selectedIds.size === 0) {
        showToast.warning("No items selected");
        return;
      }

      // Show confirmation modal
      setDeleteSelectedModal({
        isOpen: true,
        type: type,
        count: selectedIds.size,
        onConfirm: async () => {
          const count = selectedIds.size;
          console.log(`🗑️ Deleting ${count} selected ${type} items...`);

          // Close modal immediately for better UX
          setDeleteSelectedModal({
            isOpen: false,
            type: "",
            count: 0,
            onConfirm: () => {},
          });

          try {
            // ✅ OPTIMISTIC UPDATE - Remove items immediately
            if (type === "distance") {
              setDistanceMeasurements((prev) =>
                prev.filter((item) => !selectedIds.has(item.id!)),
              );
            } else if (type === "polygon") {
              setPolygonDrawings((prev) =>
                prev.filter((item) => !selectedIds.has(item.id!)),
              );
            } else if (type === "circle") {
              setCircleDrawings((prev) =>
                prev.filter((item) => !selectedIds.has(item.id!)),
              );
            } else if (type === "sector") {
              setSectorRF((prev) =>
                prev.filter((item) => !selectedIds.has(item.id!)),
              );
            } else if (type === "elevation") {
              setElevationProfiles((prev) =>
                prev.filter((item) => !selectedIds.has(item.id!)),
              );
            }

            // Clear selection
            clearSelection();

            // Delete from backend
            const deletePromises = Array.from(selectedIds).map((id) =>
              apiService.deleteSingleData(type, id),
            );

            await Promise.all(deletePromises);
            console.log(`✅ Successfully deleted ${count} items from backend`);

            showToast.success(`Successfully deleted ${count} items`);
          } catch (error) {
            console.error("Bulk delete error:", error);

            // ❌ ROLLBACK - Reload on error
            console.log("❌ Bulk delete failed, reloading data...");
            await loadData();

            showToast.error("Failed to delete some items");
          }
        },
      });
    },
    [loadData],
  );

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 🚀 PERFORMANCE: Memoized filtering operations
  const filteredDistanceMeasurements = useMemo(() => {
    return filterItems(distanceMeasurements, "measurement_name").filter(
      (item) => {
        // Apply elevation filter if enabled
        if (hasElevationFilter) {
          return item.elevation_data && item.elevation_data.length > 0;
        }
        return true;
      },
    );
  }, [distanceMeasurements, debouncedSearchTerm, hasElevationFilter]);

  const filteredPolygonDrawings = useMemo(() => {
    return filterItems(polygonDrawings, "polygon_name");
  }, [polygonDrawings, debouncedSearchTerm]);

  const filteredCircleDrawings = useMemo(() => {
    return filterItems(circleDrawings, "circle_name");
  }, [circleDrawings, debouncedSearchTerm]);

  const filteredSectorRF = useMemo(() => {
    return filterItems(sectorRF, "sector_name");
  }, [sectorRF, debouncedSearchTerm]);

  const filteredElevationProfiles = useMemo(() => {
    return filterItems(elevationProfiles, "profile_name");
  }, [elevationProfiles, debouncedSearchTerm]);

  // 🚀 PERFORMANCE: Memoized stats calculation
  const displayStats = useMemo(
    () => ({
      total:
        (hasPermission("map:tools:distance")
          ? filteredDistanceMeasurements.length
          : 0) +
        (hasPermission("map:tools:polygon")
          ? filteredPolygonDrawings.length
          : 0) +
        (hasPermission("map:tools:circle")
          ? filteredCircleDrawings.length
          : 0) +
        (hasPermission("map:tools:sector_rf") ? filteredSectorRF.length : 0) +
        (hasPermission("map:tools:elevation")
          ? filteredElevationProfiles.length
          : 0),
      distanceMeasurements: hasPermission("map:tools:distance")
        ? filteredDistanceMeasurements.length
        : 0,
      polygonDrawings: hasPermission("map:tools:polygon")
        ? filteredPolygonDrawings.length
        : 0,
      circleDrawings: hasPermission("map:tools:circle")
        ? filteredCircleDrawings.length
        : 0,
      sectorRF: hasPermission("map:tools:sector_rf")
        ? filteredSectorRF.length
        : 0,
      elevationProfiles: hasPermission("map:tools:elevation")
        ? filteredElevationProfiles.length
        : 0,
    }),
    [
      filteredDistanceMeasurements.length,
      filteredPolygonDrawings.length,
      filteredCircleDrawings.length,
      filteredSectorRF.length,
      filteredElevationProfiles.length,
      hasPermission,
    ],
  );

  // 🚀 PERFORMANCE: Memoized render callbacks for VirtualizedList
  const handleViewElevation = useCallback((item: any) => {
    setElevationModal({ isOpen: true, data: item });
  }, []);

  const renderDistanceItem = useCallback(
    (item: any) => (
      <GISDataListItem
        item={item}
        type="distance"
        isSelected={selectedDistance.has(item.id)}
        onSelect={(id) => toggleSelection(id, selectedDistance, setSelectedDistance)}
        currentUserId={user ? parseUserId(user.id) : undefined}
        currentUserRole={user?.role}
        onViewDetails={handleViewDetails}
        onViewOnMap={handleViewOnMap}
        onDelete={handleDeleteClick}
        onViewElevation={handleViewElevation}
        renderUserBadge={renderUserBadge}
        renderStorageBadge={renderStorageBadge}
      />
    ),
    [
      user,
      handleViewDetails,
      handleViewOnMap,
      handleDeleteClick,
      handleViewElevation,
      renderUserBadge,
      renderStorageBadge,
      selectedDistance,
      toggleSelection,
    ],
  );

  const renderPolygonItem = useCallback(
    (item: any) => (
      <GISDataListItem
        item={item}
        type="polygon"
        isSelected={selectedPolygon.has(item.id)}
        onSelect={(id) => toggleSelection(id, selectedPolygon, setSelectedPolygon)}
        currentUserId={user ? parseUserId(user.id) : undefined}
        currentUserRole={user?.role}
        onViewDetails={handleViewDetails}
        onViewOnMap={handleViewOnMap}
        onDelete={handleDeleteClick}
        renderUserBadge={renderUserBadge}
        renderStorageBadge={renderStorageBadge}
      />
    ),
    [
      user,
      handleViewDetails,
      handleViewOnMap,
      handleDeleteClick,
      renderUserBadge,
      renderStorageBadge,
      selectedPolygon,
      toggleSelection,
    ],
  );

  const renderCircleItem = useCallback(
    (item: any) => (
      <GISDataListItem
        item={item}
        type="circle"
        isSelected={selectedCircle.has(item.id)}
        onSelect={(id) => toggleSelection(id, selectedCircle, setSelectedCircle)}
        currentUserId={user ? parseUserId(user.id) : undefined}
        currentUserRole={user?.role}
        onViewDetails={handleViewDetails}
        onViewOnMap={handleViewOnMap}
        onDelete={handleDeleteClick}
        renderUserBadge={renderUserBadge}
        renderStorageBadge={renderStorageBadge}
      />
    ),
    [
      user,
      handleViewDetails,
      handleViewOnMap,
      handleDeleteClick,
      renderUserBadge,
      renderStorageBadge,
      selectedCircle,
      toggleSelection,
    ],
  );

  const renderSectorItem = useCallback(
    (item: any) => (
      <GISDataListItem
        item={item}
        type="sector"
        isSelected={selectedSector.has(item.id)}
        onSelect={(id) => toggleSelection(id, selectedSector, setSelectedSector)}
        currentUserId={user ? parseUserId(user.id) : undefined}
        currentUserRole={user?.role}
        onViewDetails={handleViewDetails}
        onViewOnMap={handleViewOnMap}
        onDelete={handleDeleteClick}
        renderUserBadge={renderUserBadge}
        renderStorageBadge={renderStorageBadge}
      />
    ),
    [
      user,
      handleViewDetails,
      handleViewOnMap,
      handleDeleteClick,
      renderUserBadge,
      renderStorageBadge,
      selectedSector,
      toggleSelection,
    ],
  );

  const renderElevationItem = useCallback(
    (item: any) => (
      <GISDataListItem
        item={item}
        type="elevation"
        isSelected={selectedElevation.has(item.id)}
        onSelect={(id) => toggleSelection(id, selectedElevation, setSelectedElevation)}
        currentUserId={user ? parseUserId(user.id) : undefined}
        currentUserRole={user?.role}
        onViewDetails={handleViewDetails}
        onViewOnMap={handleViewOnMap}
        onDelete={handleDeleteClick}
        onViewElevation={handleViewElevation}
        renderUserBadge={renderUserBadge}
        renderStorageBadge={renderStorageBadge}
      />
    ),
    [
      user,
      handleViewDetails,
      handleViewOnMap,
      handleDeleteClick,
      handleViewElevation,
      renderUserBadge,
      renderStorageBadge,
      selectedElevation,
      toggleSelection,
    ],
  );



  if (!canAccessDataHub) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-xl font-medium text-gray-900 dark:text-white">
            Access Denied
          </h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            You do not have permission to view the GIS Data Hub.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 flex flex-col overflow-hidden">
      {/* Header - Matching Analytics Dashboard Style */}
      <div 
        className="bg-white dark:bg-gray-800 border-b border-gray-200/60 dark:border-gray-700/60 relative overflow-hidden"
        style={{
          boxShadow: '0 2px 8px rgba(0,0,0,0.06), 0 6px 24px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,1), inset 0 -1px 2px rgba(0,0,0,0.03)',
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-[60%] pointer-events-none z-0 bg-gradient-to-b from-white/60 to-transparent dark:from-white/5" />
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-[1]">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center py-5 gap-4">
            <div className="flex items-center space-x-4">
              <motion.div 
                className="flex-shrink-0 cursor-pointer"
                initial="idle"
                whileHover="hover"
              >
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 dark:from-emerald-500 dark:to-emerald-600 flex items-center justify-center" style={{ boxShadow: '0 3px 10px rgba(0,0,0,0.2), 0 1px 3px rgba(0,0,0,0.15), inset 0 1px 2px rgba(255,255,255,0.3), inset 0 -2px 4px rgba(0,0,0,0.12)' }}>
                  <motion.svg
                    variants={iconVariants}
                    className="h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
                    />
                  </motion.svg>
                </div>
              </motion.div>
              <div>
                <h1 className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  GIS Data Hub
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                  Centralized repository for all your GIS tool data
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Import Button */}
              <button
                onClick={() => setIsImportModalOpen(true)}
                disabled={loading || exportLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-[0_4px_12px_rgba(37,99,235,0.3),inset_0_1px_1px_rgba(255,255,255,0.3)] disabled:opacity-50 transform hover:-translate-y-0.5 active:translate-y-px"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                <span>Import</span>
              </button>
              
              {/* Export Button */}
              <button
                onClick={() => handleExportData(activeTab as any, 'xlsx')}
                disabled={loading || exportLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-b from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-xl font-bold text-sm transition-all shadow-[0_4px_12px_rgba(79,70,229,0.3),inset_0_1px_1px_rgba(255,255,255,0.3)] disabled:opacity-50 transform hover:-translate-y-0.5 active:translate-y-px"
              >
                {exportLoading ? (
                   <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                ) : (
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                )}
                <span>
                  {(() => {
                    let count = 0;
                    if (activeTab === 'distance') count = selectedDistance.size;
                    else if (activeTab === 'polygon') count = selectedPolygon.size;
                    else if (activeTab === 'circle') count = selectedCircle.size;
                    else if (activeTab === 'sector') count = selectedSector.size;
                    else if (activeTab === 'elevation') count = selectedElevation.size;
                    return count > 0 ? `Export ${count} Selected` : 'Export All XLSX';
                  })()}
                </span>
              </button>

              {/* Refresh Button */}
              <button
                onClick={loadData}
                disabled={loading}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl font-bold text-sm transition-all shadow-[0_4px_12px_rgba(16,185,129,0.3),inset_0_1px_1px_rgba(255,255,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-px"
              >
                <svg
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 flex flex-col min-h-0 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
          {/* Left Sidebar - Filters & Statistics */}
          <div className="lg:col-span-1 h-full flex flex-col min-h-0">
            {/* Mobile Toggle Button (Visible only on lg:hidden) */}
            <div className="lg:hidden mb-4">
              <button 
                onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                className="w-full flex items-center justify-between bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-200/60 dark:border-gray-700/60 transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-3 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  <span className="font-bold text-gray-900 dark:text-white">
                     Filter & Statistics Dashboard
                  </span>
                </div>
                <svg className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${isMobileSidebarOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            <div className={`${isMobileSidebarOpen ? 'block' : 'hidden'} lg:block flex-1 min-h-0`}>
              <div 
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-y border-r border-l-4 border-l-emerald-500 border-y-gray-200/60 border-r-gray-200/60 dark:border-y-gray-700/60 dark:border-r-gray-700/60 shadow-[0_4px_24px_rgba(0,0,0,0.06)] relative overflow-y-auto overflow-x-hidden h-full transition-all duration-200"
              >
                {/* Glossy reflection in the sidebar */}
                <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-gray-50/80 to-transparent dark:from-white/10 pointer-events-none z-0" />
                
                {/* 1. Filters Section */}
                <div className="relative z-10 bg-gray-50/50 dark:bg-gray-900/30 p-4 rounded-xl border border-gray-100 dark:border-gray-700/50 mb-6 shadow-inner">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-black text-gray-900 dark:text-white flex items-center tracking-wide uppercase">
                      <div className="p-1.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-md mr-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                      </div>
                      Filters
                      {((selectedUserId !== "me" && selectedUserId !== "all" ? 1 : 0) + (searchTerm ? 1 : 0) + (hasElevationFilter && activeTab === "distance" ? 1 : 0)) > 0 && (
                        <span className="ml-2 px-2 py-0.5 bg-emerald-500 text-white text-[10px] rounded-full font-bold shadow-sm flex items-center justify-center">
                          {((selectedUserId !== "me" && selectedUserId !== "all" ? 1 : 0) + (searchTerm ? 1 : 0) + (hasElevationFilter && activeTab === "distance" ? 1 : 0))} Active
                        </span>
                      )}
                    </h2>
                    {((selectedUserId !== "me" && selectedUserId !== "all" ? 1 : 0) + (searchTerm ? 1 : 0) + (hasElevationFilter && activeTab === "distance" ? 1 : 0)) > 0 && (
                      <button 
                        onClick={() => { setSelectedUserId("me"); setSearchTerm(""); setHasElevationFilter(false); }}
                        className="text-[11px] px-2 py-1 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400 rounded-md font-bold transition-colors"
                      >
                        Reset All
                      </button>
                    )}
                  </div>

                  {/* User Filter */}
                  {canFilter && (
                    <UserFilterControl
                      onFilterChange={(userId: number | "all" | "me") => setSelectedUserId(userId)}
                      defaultValue="me"
                      showLabel={true}
                    />
                  )}
                </div>

                {/* 2. Search Box Section */}
                <div className="relative z-10 bg-gray-50/50 dark:bg-gray-900/30 p-4 rounded-xl border border-gray-100 dark:border-gray-700/50 mb-6 shadow-inner">
                  <label className="block text-xs font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wide">
                    Search Records
                  </label>
                  <div className="relative group">
                    <input
                      type="text"
                      placeholder="Search by name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-2.5 pl-10 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-medium placeholder-gray-400 shadow-sm"
                    />
                    <svg className="absolute left-3.5 top-3 w-4 h-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    {searchTerm && (
                      <button onClick={() => setSearchTerm("")} className="absolute right-2 top-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" aria-label="Clear search" title="Clear search">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    )}
                  </div>
                  {debouncedSearchTerm && (
                     <div className="mt-2 text-[11px] font-semibold text-gray-500 dark:text-gray-400 text-right">
                       Showing {displayStats.total} result{displayStats.total !== 1 ? 's' : ''}
                     </div>
                  )}

                  <AnimatePresence>
                    {activeTab === "distance" && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: "auto", marginTop: 12 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        className="overflow-hidden"
                      >
                        <label className={`w-full flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${hasElevationFilter ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/30 dark:border-indigo-700 shadow-sm' : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={hasElevationFilter}
                              onChange={(e) => setHasElevationFilter(e.target.checked)}
                              className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer transition-colors"
                            />
                            <span className={`text-sm font-bold transition-colors ${hasElevationFilter ? 'text-indigo-900 dark:text-indigo-200' : 'text-gray-700 dark:text-gray-300'}`}>
                              Has Elevation Data
                            </span>
                          </div>
                          {hasElevationFilter && (
                            <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)] animate-pulse" />
                          )}
                        </label>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 3. Statistics Section */}
                <div className="relative z-10 bg-gray-50/50 dark:bg-gray-900/30 p-4 rounded-xl border border-gray-100 dark:border-gray-700/50 shadow-inner">
                  <h3 className="text-sm font-black text-gray-900 dark:text-white mb-4 flex items-center tracking-wide uppercase">
                    <div className="p-1.5 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-md mr-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    Overview & Stats
                  </h3>
                  
                  {/* Total Stat Box */}
                  <div className="mb-4 text-center p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Total Data Items</div>
                    <div className="text-4xl font-black bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent transform hover:scale-105 transition-transform duration-300">
                      {displayStats.total}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {hasPermission("map:tools:distance") && (
                      <button onClick={() => handleTabChange("distance")} className="w-full relative overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg py-2.5 px-3 hover:shadow-md hover:-translate-y-0.5 transition-all group focus:outline-none text-left flex flex-col justify-between h-full">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 group-hover:w-1.5 transition-all"></div>
                        <div className="flex justify-between items-center w-full mb-2 pl-2">
                          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Distance</span>
                          <span className="text-sm font-black text-gray-900 dark:text-white">{displayStats.distanceMeasurements}</span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1 ml-2">
                          <div className="bg-emerald-500 h-1 rounded-full transition-all duration-700 ease-out" style={{ width: `${displayStats.total > 0 ? (displayStats.distanceMeasurements / displayStats.total) * 100 : 0}%` }}></div>
                        </div>
                      </button>
                    )}

                    {hasPermission("map:tools:polygon") && (
                      <button onClick={() => handleTabChange("polygon")} className="w-full relative overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg py-2.5 px-3 hover:shadow-md hover:-translate-y-0.5 transition-all group focus:outline-none text-left flex flex-col justify-between h-full">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500 group-hover:w-1.5 transition-all"></div>
                        <div className="flex justify-between items-center w-full mb-2 pl-2">
                          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Polygons</span>
                          <span className="text-sm font-black text-gray-900 dark:text-white">{displayStats.polygonDrawings}</span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1 ml-2">
                          <div className="bg-purple-500 h-1 rounded-full transition-all duration-700 ease-out" style={{ width: `${displayStats.total > 0 ? (displayStats.polygonDrawings / displayStats.total) * 100 : 0}%` }}></div>
                        </div>
                      </button>
                    )}

                    {hasPermission("map:tools:circle") && (
                      <button onClick={() => handleTabChange("circle")} className="w-full relative overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg py-2.5 px-3 hover:shadow-md hover:-translate-y-0.5 transition-all group focus:outline-none text-left flex flex-col justify-between h-full">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 group-hover:w-1.5 transition-all"></div>
                        <div className="flex justify-between items-center w-full mb-2 pl-2">
                          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Circles</span>
                          <span className="text-sm font-black text-gray-900 dark:text-white">{displayStats.circleDrawings}</span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1 ml-2">
                          <div className="bg-amber-500 h-1 rounded-full transition-all duration-700 ease-out" style={{ width: `${displayStats.total > 0 ? (displayStats.circleDrawings / displayStats.total) * 100 : 0}%` }}></div>
                        </div>
                      </button>
                    )}

                    {hasPermission("map:tools:sector_rf") && (
                      <button onClick={() => handleTabChange("sector")} className="w-full relative overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg py-2.5 px-3 hover:shadow-md hover:-translate-y-0.5 transition-all group focus:outline-none text-left flex flex-col justify-between h-full">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 group-hover:w-1.5 transition-all"></div>
                        <div className="flex justify-between items-center w-full mb-2 pl-2">
                          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">RF Sectors</span>
                          <span className="text-sm font-black text-gray-900 dark:text-white">{displayStats.sectorRF}</span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1 ml-2">
                          <div className="bg-blue-500 h-1 rounded-full transition-all duration-700 ease-out" style={{ width: `${displayStats.total > 0 ? (displayStats.sectorRF / displayStats.total) * 100 : 0}%` }}></div>
                        </div>
                      </button>
                    )}

                    {hasPermission("map:tools:elevation") && (
                      <button onClick={() => handleTabChange("elevation")} className="w-full relative overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg py-2.5 px-3 hover:shadow-md hover:-translate-y-0.5 transition-all group focus:outline-none text-left flex flex-col justify-between h-full">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 group-hover:w-1.5 transition-all"></div>
                        <div className="flex justify-between items-center w-full mb-2 pl-2">
                          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Elevation</span>
                          <span className="text-sm font-black text-gray-900 dark:text-white">{displayStats.elevationProfiles}</span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1 ml-2">
                          <div className="bg-indigo-500 h-1 rounded-full transition-all duration-700 ease-out" style={{ width: `${displayStats.total > 0 ? (displayStats.elevationProfiles / displayStats.total) * 100 : 0}%` }}></div>
                        </div>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 h-full flex flex-col min-h-0 overflow-hidden">
            {/* Temporary Data Section - Collapsible */}
            {tempItems.length > 0 && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900 dark:to-orange-900 dark:bg-opacity-30 border border-yellow-200 dark:border-orange-700 rounded-lg shadow-md mb-6 overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-800 dark:to-orange-800 border-b border-yellow-200 dark:border-orange-700">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() =>
                        setTempSectionCollapsed(!tempSectionCollapsed)
                      }
                      className="flex items-center text-lg font-bold text-yellow-900 dark:text-yellow-100 hover:text-yellow-700 dark:hover:text-yellow-200 transition-colors"
                    >
                      <span className="text-2xl mr-2">⏱️</span>
                      <span>
                        Temporary Data ({tempItems.length}) - Expires in 24
                        Hours
                      </span>
                      <span
                        className={`ml-2 transform transition-transform ${
                          tempSectionCollapsed ? "rotate-180" : ""
                        }`}
                      >
                        ▼
                      </span>
                    </button>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          setTempSectionCollapsed(!tempSectionCollapsed)
                        }
                        className="px-3 py-1.5 text-sm font-medium text-yellow-700 hover:bg-yellow-200 dark:text-yellow-300 dark:hover:bg-yellow-800 rounded-lg border border-yellow-400 dark:border-yellow-600 transition-all"
                      >
                        {tempSectionCollapsed ? "👁️ Show" : "🙈 Hide"}
                      </button>
                      <button
                        onClick={() => {
                          // Clear all temporary data
                          tempItems.forEach((item) =>
                            deleteTemporaryItem(
                              user?.id?.toString() || "guest",
                              item.id,
                            ),
                          );
                          setTempItems([]);
                          showToast.success("All temporary data cleared");
                        }}
                        className="px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-900 dark:hover:bg-opacity-20 rounded-lg border border-red-400 dark:border-red-600 transition-all"
                      >
                        🗑️ Clear All ({tempItems.length})
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-orange-800 dark:text-orange-300">
                    <span className="flex items-center">
                      <span className="mr-1">⚠️</span>
                      Data below expires in 24 hours • Transfer to permanent
                      storage to keep • Separate from permanent data below
                    </span>
                  </div>
                </div>

                {!tempSectionCollapsed && (
                  <div className="divide-y divide-yellow-200 dark:divide-orange-700 max-h-64 overflow-y-auto">
                    {tempItems.map((item) => (
                      <div
                        key={item.id}
                        className="px-6 py-4 hover:bg-yellow-50 dark:hover:bg-orange-900 dark:hover:bg-opacity-30 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
                                  isNearExpiry(item)
                                    ? "bg-red-500"
                                    : "bg-orange-500"
                                }`}
                              >
                                {item.toolType === "distance" && "📏"}
                                {item.toolType === "polygon" && "🔷"}
                                {item.toolType === "sector" && "📡"}
                                {item.toolType === "elevation" && "⛰️"}
                              </div>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                                {item.name}
                              </h4>
                              <div className="flex items-center space-x-2 text-xs text-yellow-700 dark:text-yellow-300">
                                <span>
                                  {item.toolType.charAt(0).toUpperCase() +
                                    item.toolType.slice(1)}
                                </span>
                                <span>•</span>
                                <span
                                  className={
                                    isNearExpiry(item)
                                      ? "text-red-700 dark:text-red-300 font-semibold"
                                      : ""
                                  }
                                >
                                  Expires in {getTimeRemaining(item)}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={async () => {
                                try {
                                  // Convert to permanent and delete from temporary
                                  const permanentData =
                                    convertTempToPermanentData(item);

                                  // Save to appropriate service based on toolType
                                  switch (item.toolType) {
                                    case "distance":
                                      await distanceMeasurementService.create(
                                        permanentData,
                                      );
                                      break;
                                    case "polygon":
                                      await polygonDrawingService.create(
                                        permanentData,
                                      );
                                      break;
                                    case "circle":
                                      await circleDrawingService.create(
                                        permanentData,
                                      );
                                      break;
                                    case "sector":
                                      await sectorRFService.create(
                                        permanentData,
                                      );
                                      break;
                                    case "elevation":
                                      await elevationProfileService.create(
                                        permanentData,
                                      );
                                      break;
                                    default:
                                      throw new Error(
                                        `Unsupported tool type: ${item.toolType}`,
                                      );
                                  }

                                  // Delete from temporary storage
                                  deleteTemporaryItem(
                                    user?.id?.toString() || "guest",
                                    item.id,
                                  );
                                  setTempItems(
                                    tempItems.filter((t) => t.id !== item.id),
                                  );

                                  // Reload permanent data to show the transferred item
                                  await loadData();

                                  showToast.success(
                                    `${item.name} transferred to permanent storage`,
                                  );
                                } catch (error) {
                                  console.error(
                                    "Error transferring to permanent storage:",
                                    error,
                                  );
                                  showToast.error(
                                    `Failed to transfer ${item.name} to permanent storage`,
                                  );
                                }
                              }}
                              className="px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100 dark:text-green-300 dark:hover:bg-green-900 dark:hover:bg-opacity-20 rounded-lg border border-green-400 dark:border-green-600 transition-all"
                            >
                              💾 Save Permanently
                            </button>
                            <button
                              onClick={() => {
                                deleteTemporaryItem(
                                  user?.id?.toString() || "guest",
                                  item.id,
                                );
                                setTempItems(
                                  tempItems.filter((t) => t.id !== item.id),
                                );
                                showToast.success(`${item.name} deleted`);
                              }}
                              className="px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 dark:text-red-300 dark:hover:bg-red-900 dark:hover:bg-opacity-20 rounded-lg border border-red-400 dark:border-red-600 transition-all"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Premium Breadcrumbs Section */}
            <div className="mb-4 flex-shrink-0 flex items-center gap-2 text-sm font-medium text-gray-400 dark:text-gray-500 overflow-x-auto whitespace-nowrap scrollbar-hide py-1">
              <motion.div 
                className="flex items-center gap-2 hover:text-blue-500 dark:hover:text-blue-400 cursor-pointer transition-colors group"
                onClick={() => navigate("/")}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/40 transition-colors">
                  <Home className="w-3.5 h-3.5" />
                </div>
                <span>Home</span>
              </motion.div>
              
              <ChevronRight className="w-4 h-4 opacity-50" />
              
              <motion.div 
                className="flex items-center gap-2 hover:text-purple-500 dark:hover:text-purple-400 cursor-pointer transition-colors group"
                onClick={() => handleTabChange("distance")}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 group-hover:bg-purple-50 dark:group-hover:bg-purple-900/40 transition-colors">
                  <Database className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-gray-900 dark:text-gray-100 font-bold">GIS Data Hub</span>
              </motion.div>

              <ChevronRight className="w-4 h-4 opacity-50" />

              <motion.div 
                key={activeTab}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 text-blue-600 dark:text-blue-400"
              >
                <span className="capitalize font-bold tracking-tight">
                  {activeTab === 'sector' ? 'RF Sector Analysis' : `${activeTab} Measurements`}
                </span>
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50 animate-pulse" />
              </motion.div>
            </div>

            {/* Permanent Data Section Header */}
            {tempItems.length > 0 && (
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                  <span className="text-2xl mr-2">💾</span>
                  Permanent Data Storage
                  <span className="ml-2 text-sm text-gray-500 dark:text-gray-400 font-normal">
                    (Saved to database, accessible from any device)
                  </span>
                </h2>
              </div>
            )}

            {/* Premium Tab Navigation */}
            <div className="mb-4 flex-shrink-0 relative z-20">
              <div 
                className="flex p-1.5 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-full border border-gray-200/60 dark:border-gray-700/60 shadow-sm"
                style={{
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)'
                }}
              >
                <nav className="flex w-full items-center gap-1">
                  <LayoutGroup id="gisTabDataHub">
                    {[
                      {
                        id: "distance",
                        label: "Distance",
                        icon: <Ruler className="w-5 h-5" />,
                        activeColor: "bg-emerald-500",
                        iconColor: "text-emerald-500",
                        count: displayStats.distanceMeasurements,
                        permission: "map:tools:distance",
                      },
                      {
                        id: "polygon",
                        label: "Polygon",
                        icon: <Hexagon className="w-5 h-5" />,
                        activeColor: "bg-purple-500",
                        iconColor: "text-purple-500",
                        count: displayStats.polygonDrawings,
                        permission: "map:tools:polygon",
                      },
                      {
                        id: "circle",
                        label: "Circle",
                        icon: <Circle className="w-5 h-5" />,
                        activeColor: "bg-amber-500",
                        iconColor: "text-amber-500",
                        count: displayStats.circleDrawings,
                        permission: "map:tools:circle",
                      },
                      {
                        id: "sector",
                        label: "RF Sector",
                        icon: <Wifi className="w-5 h-5" />,
                        activeColor: "bg-blue-500",
                        iconColor: "text-blue-500",
                        count: displayStats.sectorRF,
                        permission: "map:tools:sector_rf",
                      },
                      {
                        id: "elevation",
                        label: "Elevation",
                        icon: <Mountain className="w-5 h-5" />,
                        activeColor: "bg-indigo-500",
                        iconColor: "text-indigo-500",
                        count: displayStats.elevationProfiles,
                        permission: "map:tools:elevation",
                      },
                    ]
                    .filter((tab) => !tab.permission || hasPermission(tab.permission))
                    .map((tab) => {
                      const isActive = activeTab === tab.id;
                      return (
                        <motion.button
                          key={tab.id}
                          onClick={() => handleTabChange(tab.id as any)}
                          initial="idle"
                          whileTap={{ scale: 0.96, y: 1 }}
                          whileHover={!isActive ? "hover" : "idle"}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          className={`relative flex-1 flex items-center justify-center gap-2.5 px-5 py-2.5 text-sm font-bold rounded-full whitespace-nowrap cursor-pointer select-none z-10 transition-colors duration-200 ${
                            isActive
                              ? "text-white"
                              : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
                          }`}
                        >
                          <motion.span
                            className={`${isActive ? "text-white" : tab.iconColor} flex-shrink-0 relative z-20`}
                            variants={iconVariants}
                            animate={isActive ? { scale: [1, 1.05, 1], transition: { duration: 2, repeat: Infinity } } : "idle"}
                          >
                            {tab.icon}
                          </motion.span>
                          
                          <span className={`relative z-20 ${isActive ? "drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]" : ""}`}>
                            {tab.label}
                            {tab.count > 0 && (
                              <span className={`ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                                isActive ? "bg-white/20 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-500"
                              }`}>
                                {tab.count}
                              </span>
                            )}
                          </span>

                          {isActive && (
                            <>
                              <motion.div 
                                layoutId="gis-pill-color" 
                                className={`absolute inset-0 rounded-full -z-10 ${tab.activeColor}`} 
                                initial={false} 
                                transition={{ layout: { type: "spring", stiffness: 400, damping: 32 } }} 
                                style={{ 
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.1), inset 0 1px 2px rgba(255,255,255,0.2), inset 0 -2px 4px rgba(0,0,0,0.12)' 
                                }} 
                              />
                              <motion.div 
                                layoutId="gis-pill-gloss" 
                                className="absolute inset-0 rounded-full -z-[5] pointer-events-none" 
                                initial={false} 
                                transition={{ layout: { type: "spring", stiffness: 400, damping: 32 } }} 
                                style={{ 
                                  background: 'linear-gradient(180deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.08) 45%, transparent 50%, rgba(0,0,0,0.05) 100%)' 
                                }} 
                              />
                            </>
                          )}
                        </motion.button>
                      );
                    })}
                  </LayoutGroup>
                </nav>
              </div>
            </div>

            {/* Data Display */}
            <div className="flex-1 min-h-0 overflow-hidden flex flex-col space-y-4">
              {loading ? (
                <DataListSkeleton />
              ) : (
                <>
                  {/* Distance Measurements */}
                  {activeTab === "distance" && (
                    <div 
                      className="flex-1 bg-white dark:bg-gray-800 rounded-3xl overflow-hidden border border-gray-200/60 dark:border-gray-700/60 relative flex flex-col min-h-0"
                      style={{ boxShadow: '0 6px 30px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,0.8)' }}
                    >
                      <div className="px-6 py-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/20 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-3">
                          <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg">
                            <Ruler className="w-5 h-5" />
                          </div>
                          <span>Distance Measurements ({filteredDistanceMeasurements.length})</span>
                        </h3>
                        <div className="flex items-center space-x-2">
                          {filteredDistanceMeasurements.length > 0 && (
                            <button
                              onClick={() => selectedDistance.size === filteredDistanceMeasurements.length ? deselectAll(setSelectedDistance) : selectAll(filteredDistanceMeasurements, setSelectedDistance)}
                              className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg text-xs font-medium transition-colors"
                            >
                              {selectedDistance.size === filteredDistanceMeasurements.length ? "Deselect All" : "Select All"}
                            </button>
                          )}
                          {selectedDistance.size > 0 && (
                            <button
                              onClick={() => handleBulkDeleteSelected("distance", selectedDistance, () => setSelectedDistance(new Set()))}
                              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium transition-colors flex items-center space-x-1"
                            >
                              <span>🗑️</span>
                              <span>Delete Selected ({selectedDistance.size})</span>
                            </button>
                          )}
                          {filteredDistanceMeasurements.length > 0 && canDeleteAll && (
                            <button
                              onClick={() => handleBulkDeleteClick("distance", "Distance Measurements")}
                              className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-medium transition-colors flex items-center space-x-1"
                            >
                              <span>🗑️</span>
                              <span>Delete All</span>
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="flex-1 divide-y divide-gray-200 dark:divide-gray-700 overflow-y-auto">
                        <VirtualizedList
                          items={filteredDistanceMeasurements}
                          itemHeight={90}
                          emptyMessage={
                            <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                              <div className="mb-4">
                                <div className="p-5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl shadow-sm inline-block">
                                  <Ruler className="w-10 h-10" />
                                </div>
                              </div>
                              <p className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                                No distance measurements
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[250px] mx-auto">
                                Create distance measurements to see them organized here
                              </p>
                            </div>
                          }
                          renderItem={renderDistanceItem}
                        />
                      </div>
                    </div>
                  )}

                  {/* Polygon Drawings */}
                  {activeTab === "polygon" && (
                    <div 
                      className="flex-1 bg-white dark:bg-gray-800 rounded-3xl overflow-hidden border border-gray-200/60 dark:border-gray-700/60 relative flex flex-col min-h-0"
                      style={{ boxShadow: '0 6px 30px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,0.8)' }}
                    >
                      <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/20 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-3">
                          <div className="p-2 bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-lg">
                            <Hexagon className="w-5 h-5" />
                          </div>
                          <span>Polygon Drawings ({filteredPolygonDrawings.length})</span>
                        </h3>
                        <div className="flex items-center space-x-2">
                          {filteredPolygonDrawings.length > 0 && (
                            <button
                              onClick={() => selectedPolygon.size === filteredPolygonDrawings.length ? deselectAll(setSelectedPolygon) : selectAll(filteredPolygonDrawings, setSelectedPolygon)}
                              className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg text-xs font-medium transition-colors"
                            >
                              {selectedPolygon.size === filteredPolygonDrawings.length ? "Deselect All" : "Select All"}
                            </button>
                          )}
                          {selectedPolygon.size > 0 && (
                            <button
                              onClick={() => handleBulkDeleteSelected("polygon", selectedPolygon, () => setSelectedPolygon(new Set()))}
                              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium transition-colors flex items-center space-x-1"
                            >
                              <span>🗑️</span>
                              <span>Delete Selected ({selectedPolygon.size})</span>
                            </button>
                          )}
                          {filteredPolygonDrawings.length > 0 && canDeleteAll && (
                            <button
                              onClick={() => handleBulkDeleteClick("polygon", "Polygon Drawings")}
                              className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-medium transition-colors flex items-center space-x-1"
                            >
                              <span>🗑️</span>
                              <span>Delete All</span>
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="flex-1 divide-y divide-gray-200 dark:divide-gray-700 overflow-y-auto">
                        <VirtualizedList
                          items={filteredPolygonDrawings}
                          itemHeight={90}
                          emptyMessage={
                            <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                              <div className="mb-4">
                                <div className="p-5 bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-2xl shadow-sm inline-block">
                                  <Hexagon className="w-10 h-10" />
                                </div>
                              </div>
                              <p className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                                No polygon drawings
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[250px] mx-auto">
                                Draw polygons on the map to see them listed here
                              </p>
                            </div>
                          }
                          renderItem={renderPolygonItem}
                        />
                      </div>
                    </div>
                  )}

                  {/* Circle Drawings */}
                  {activeTab === "circle" && (
                    <div 
                      className="flex-1 bg-white dark:bg-gray-800 rounded-3xl overflow-hidden border border-gray-200/60 dark:border-gray-700/60 relative flex flex-col min-h-0"
                      style={{ boxShadow: '0 6px 30px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,0.8)' }}
                    >
                      <div className="px-6 py-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/20 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-3">
                          <div className="p-2 bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-lg">
                            <Circle className="w-5 h-5" />
                          </div>
                          <span>Circle Drawings ({filteredCircleDrawings.length})</span>
                        </h3>
                        <div className="flex items-center space-x-2">
                          {filteredCircleDrawings.length > 0 && (
                            <button
                              onClick={() => selectedCircle.size === filteredCircleDrawings.length ? deselectAll(setSelectedCircle) : selectAll(filteredCircleDrawings, setSelectedCircle)}
                              className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg text-xs font-medium transition-colors"
                            >
                              {selectedCircle.size === filteredCircleDrawings.length ? "Deselect All" : "Select All"}
                            </button>
                          )}
                          {selectedCircle.size > 0 && (
                            <button
                              onClick={() => handleBulkDeleteSelected("circle", selectedCircle, () => setSelectedCircle(new Set()))}
                              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium transition-colors flex items-center space-x-1"
                            >
                              <span>🗑️</span>
                              <span>Delete Selected ({selectedCircle.size})</span>
                            </button>
                          )}
                          {filteredCircleDrawings.length > 0 && canDeleteAll && (
                            <button
                              onClick={() => handleBulkDeleteClick("circle", "Circle Drawings")}
                              className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-medium transition-colors flex items-center space-x-1"
                            >
                              <span>🗑️</span>
                              <span>Delete All</span>
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="flex-1 divide-y divide-gray-200 dark:divide-gray-700 overflow-y-auto">
                        <VirtualizedList
                          items={filteredCircleDrawings}
                          itemHeight={90}
                          emptyMessage={
                            <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                              <div className="mb-4">
                                <div className="p-5 bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-2xl shadow-sm inline-block">
                                  <Circle className="w-10 h-10" />
                                </div>
                              </div>
                              <p className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                                No circle drawings
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[250px] mx-auto">
                                Draw circles on the map to see them listed here
                              </p>
                            </div>
                          }
                          renderItem={renderCircleItem}
                        />
                      </div>
                    </div>
                  )}

                  {/* RF Sectors */}
                  {activeTab === "sector" && (
                    <div 
                      className="flex-1 bg-white dark:bg-gray-800 rounded-3xl overflow-hidden border border-gray-200/60 dark:border-gray-700/60 relative flex flex-col min-h-0"
                      style={{ boxShadow: '0 6px 30px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,0.8)' }}
                    >
                      <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/20 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-3">
                          <div className="p-2 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg">
                            <Wifi className="w-5 h-5" />
                          </div>
                          <span>RF Sectors ({filteredSectorRF.length})</span>
                        </h3>
                        <div className="flex items-center space-x-2">
                          {filteredSectorRF.length > 0 && (
                            <button
                              onClick={() => selectedSector.size === filteredSectorRF.length ? deselectAll(setSelectedSector) : selectAll(filteredSectorRF, setSelectedSector)}
                              className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg text-xs font-medium transition-colors"
                            >
                              {selectedSector.size === filteredSectorRF.length ? "Deselect All" : "Select All"}
                            </button>
                          )}
                          {selectedSector.size > 0 && (
                            <button
                              onClick={() => handleBulkDeleteSelected("sector", selectedSector, () => setSelectedSector(new Set()))}
                              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium transition-colors flex items-center space-x-1"
                            >
                              <span>🗑️</span>
                              <span>Delete Selected ({selectedSector.size})</span>
                            </button>
                          )}
                          {filteredSectorRF.length > 0 && canDeleteAll && (
                            <button
                              onClick={() => handleBulkDeleteClick("sector", "RF Sectors")}
                              className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-medium transition-colors flex items-center space-x-1"
                            >
                              <span>🗑️</span>
                              <span>Delete All</span>
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="flex-1 divide-y divide-gray-200 dark:divide-gray-700 overflow-y-auto">
                        <VirtualizedList
                          items={filteredSectorRF}
                          itemHeight={100}
                          emptyMessage={
                            <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                              <div className="mb-4">
                                <div className="p-5 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-2xl shadow-sm inline-block">
                                  <Wifi className="w-10 h-10" />
                                </div>
                              </div>
                              <p className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                                No RF sectors
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[250px] mx-auto">
                                Configure RF sectors to analyze them here
                              </p>
                            </div>
                          }
                          renderItem={renderSectorItem}
                        />
                      </div>
                    </div>
                  )}

                  {/* Elevation Profiles */}
                  {activeTab === "elevation" && (
                    <div 
                      className="flex-1 bg-white dark:bg-gray-800 rounded-3xl overflow-hidden border border-gray-200/60 dark:border-gray-700/60 relative flex flex-col min-h-0"
                      style={{ boxShadow: '0 6px 30px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,0.8)' }}
                    >
                      <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/20 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-3">
                          <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-lg">
                            <Mountain className="w-5 h-5" />
                          </div>
                          <span>Elevation Profiles ({filteredElevationProfiles.length})</span>
                        </h3>
                        <div className="flex items-center space-x-2">
                          {filteredElevationProfiles.length > 0 && (
                            <button
                              onClick={() => selectedElevation.size === filteredElevationProfiles.length ? deselectAll(setSelectedElevation) : selectAll(filteredElevationProfiles, setSelectedElevation)}
                              className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg text-xs font-medium transition-colors"
                            >
                              {selectedElevation.size === filteredElevationProfiles.length ? "Deselect All" : "Select All"}
                            </button>
                          )}
                          {selectedElevation.size > 0 && (
                            <button
                              onClick={() => handleBulkDeleteSelected("elevation", selectedElevation, () => setSelectedElevation(new Set()))}
                              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium transition-colors flex items-center space-x-1"
                            >
                              <span>🗑️</span>
                              <span>Delete Selected ({selectedElevation.size})</span>
                            </button>
                          )}
                          {filteredElevationProfiles.length > 0 && canDeleteAll && (
                            <button
                              onClick={() => handleBulkDeleteClick("elevation", "Elevation Profiles")}
                              className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-medium transition-colors flex items-center space-x-1"
                            >
                              <span>🗑️</span>
                              <span>Delete All</span>
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="flex-1 divide-y divide-gray-200 dark:divide-gray-700 overflow-y-auto">
                        <VirtualizedList
                          items={filteredElevationProfiles}
                          itemHeight={100}
                          emptyMessage={
                            <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                              <div className="mb-4">
                                <div className="p-5 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-2xl shadow-sm inline-block">
                                  <Mountain className="w-10 h-10" />
                                </div>
                              </div>
                              <p className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                                No elevation profiles
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[250px] mx-auto">
                                Generate elevation profiles to see them listed here
                              </p>
                            </div>
                          }
                          renderItem={renderElevationItem}
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* VIEW DETAILS MODAL */}
      {viewDetailsModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden transform transition-all">
            {/* Modal Header */}
            <div className="relative px-6 py-5 bg-gradient-to-r from-emerald-600 to-emerald-700 dark:from-emerald-600 dark:to-emerald-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                    <span className="text-2xl">📋</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {viewDetailsModal.type.charAt(0).toUpperCase() +
                        viewDetailsModal.type.slice(1)}{" "}
                      Details
                    </h2>
                    <p className="text-emerald-100 text-sm mt-0.5">
                      Complete information and metadata
                    </p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    setViewDetailsModal({ isOpen: false, data: null, type: "" })
                  }
                  className="w-10 h-10 rounded-full bg-white bg-opacity-10 hover:bg-opacity-20 backdrop-blur-sm flex items-center justify-center transition-all duration-200 group"
                  aria-label="Close details modal"
                  title="Close details modal"
                >
                  <svg
                    className="w-5 h-5 text-white group-hover:rotate-90 transition-transform duration-200"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="px-6 py-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              {/* Render details based on type */}
              {(() => {
                const data = viewDetailsModal.data;
                const type = viewDetailsModal.type;

                // Infrastructure Details
                if (type === "infrastructure") {
                  return (
                    <div className="space-y-5">
                      {/* Basic Information */}
                      <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-5 border border-emerald-200 dark:border-emerald-800">
                        <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100 mb-4 flex items-center">
                          <svg
                            className="w-5 h-5 mr-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Basic Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-white dark:bg-gray-800 rounded p-3">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                              Item Name
                            </p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {data.item_name}
                            </p>
                          </div>
                          <div className="bg-white dark:bg-gray-800 rounded p-3">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                              Type
                            </p>
                            <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-100">
                              {data.item_type}
                            </span>
                          </div>
                          {data.unique_id && (
                            <div className="bg-white dark:bg-gray-800 rounded p-3">
                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                Unique ID
                              </p>
                              <p className="text-sm font-mono font-semibold text-gray-900 dark:text-white">
                                {data.unique_id}
                              </p>
                            </div>
                          )}
                          {data.status && (
                            <div className="bg-white dark:bg-gray-800 rounded p-3">
                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                Status
                              </p>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {data.status}
                              </p>
                            </div>
                          )}
                          {data.network_id && (
                            <div className="bg-white dark:bg-gray-800 rounded p-3">
                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                Network ID
                              </p>
                              <p className="text-sm font-mono font-semibold text-gray-900 dark:text-white">
                                {data.network_id}
                              </p>
                            </div>
                          )}
                          {data.ref_code && (
                            <div className="bg-white dark:bg-gray-800 rounded p-3">
                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                Reference Code
                              </p>
                              <p className="text-sm font-mono font-semibold text-gray-900 dark:text-white">
                                {data.ref_code}
                              </p>
                            </div>
                          )}
                          {data.source && (
                            <div className="bg-white dark:bg-gray-800 rounded p-3">
                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                Source
                              </p>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {data.source}
                              </p>
                            </div>
                          )}
                          {data.username && (
                            <div className="bg-white dark:bg-gray-800 rounded p-3">
                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                Created By
                              </p>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {data.username}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Location */}
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-5 border border-blue-200 dark:border-blue-800">
                        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4 flex items-center">
                          <svg
                            className="w-5 h-5 mr-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          Location
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-white dark:bg-gray-800 rounded p-3">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                              Latitude
                            </p>
                            <p className="text-sm font-mono font-bold text-blue-600 dark:text-blue-400">
                              {Number(data.latitude).toFixed(6)}°
                            </p>
                          </div>
                          <div className="bg-white dark:bg-gray-800 rounded p-3">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                              Longitude
                            </p>
                            <p className="text-sm font-mono font-bold text-blue-600 dark:text-blue-400">
                              {Number(data.longitude).toFixed(6)}°
                            </p>
                          </div>
                          {data.height && (
                            <div className="bg-white dark:bg-gray-800 rounded p-3 md:col-span-2">
                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                Height
                              </p>
                              <p className="text-sm font-bold text-gray-900 dark:text-white">
                                {data.height} meters
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Address */}
                      {(data.address_street ||
                        data.address_city ||
                        data.address_state ||
                        data.address_pincode) && (
                        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-5 border border-purple-200 dark:border-purple-800">
                          <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-4 flex items-center">
                            <svg
                              className="w-5 h-5 mr-2"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                              />
                            </svg>
                            Address
                          </h3>
                          <div className="bg-white dark:bg-gray-800 rounded p-4">
                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                              {[
                                data.address_street,
                                data.address_city,
                                data.address_state,
                                data.address_pincode,
                              ]
                                .filter(Boolean)
                                .join(", ")}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Contact Information */}
                      {(data.contact_name ||
                        data.contact_phone ||
                        data.contact_email) && (
                        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-5 border border-orange-200 dark:border-orange-800">
                          <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-4 flex items-center">
                            <svg
                              className="w-5 h-5 mr-2"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                              />
                            </svg>
                            Contact Information
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {data.contact_name && (
                              <div className="bg-white dark:bg-gray-800 rounded p-3">
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                  Name
                                </p>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                  {data.contact_name}
                                </p>
                              </div>
                            )}
                            {data.contact_phone && (
                              <div className="bg-white dark:bg-gray-800 rounded p-3">
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                  Phone
                                </p>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                  {data.contact_phone}
                                </p>
                              </div>
                            )}
                            {data.contact_email && (
                              <div className="bg-white dark:bg-gray-800 rounded p-3 md:col-span-2">
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                  Email
                                </p>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                  {data.contact_email}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Technical Details */}
                      {(data.structure_type ||
                        data.power_source ||
                        data.ups_availability !== undefined ||
                        data.bandwidth ||
                        data.ups_capacity ||
                        data.backup_capacity) && (
                        <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-lg p-5 border border-cyan-200 dark:border-cyan-800">
                          <h3 className="text-lg font-semibold text-cyan-900 dark:text-cyan-100 mb-4 flex items-center">
                            <svg
                              className="w-5 h-5 mr-2"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            Technical Details
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {data.structure_type && (
                              <div className="bg-white dark:bg-gray-800 rounded p-3">
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                  Structure Type
                                </p>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                  {data.structure_type}
                                </p>
                              </div>
                            )}
                            {data.power_source && (
                              <div className="bg-white dark:bg-gray-800 rounded p-3">
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                  Power Source
                                </p>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                  {data.power_source}
                                </p>
                              </div>
                            )}
                            {data.ups_availability !== undefined && (
                              <div className="bg-white dark:bg-gray-800 rounded p-3">
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                  UPS
                                </p>
                                <span
                                  className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                    data.ups_availability
                                      ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                                      : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                                  }`}
                                >
                                  {data.ups_availability
                                    ? "Available"
                                    : "Not Available"}
                                </span>
                              </div>
                            )}
                            {data.ups_capacity && (
                              <div className="bg-white dark:bg-gray-800 rounded p-3">
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                  UPS Capacity
                                </p>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                  {data.ups_capacity}
                                </p>
                              </div>
                            )}
                            {data.backup_capacity && (
                              <div className="bg-white dark:bg-gray-800 rounded p-3">
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                  Backup Capacity
                                </p>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                  {data.backup_capacity}
                                </p>
                              </div>
                            )}
                            {data.bandwidth && (
                              <div className="bg-white dark:bg-gray-800 rounded p-3">
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                  Bandwidth
                                </p>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                  {data.bandwidth}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Rental Information */}
                      {(data.is_rented ||
                        data.rent_amount ||
                        data.landlord_name ||
                        data.landlord_contact ||
                        data.agreement_start_date ||
                        data.agreement_end_date) && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-5 border border-yellow-200 dark:border-yellow-800">
                          <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-4 flex items-center">
                            <svg
                              className="w-5 h-5 mr-2"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            Rental Information
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {data.is_rented !== undefined && (
                              <div className="bg-white dark:bg-gray-800 rounded p-3">
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                  Is Rented
                                </p>
                                <span
                                  className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                    data.is_rented
                                      ? "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
                                      : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100"
                                  }`}
                                >
                                  {data.is_rented ? "Yes" : "No"}
                                </span>
                              </div>
                            )}
                            {data.rent_amount && (
                              <div className="bg-white dark:bg-gray-800 rounded p-3">
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                  Rent Amount
                                </p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">
                                  ₹
                                  {Number(data.rent_amount).toLocaleString(
                                    "en-IN",
                                  )}
                                </p>
                              </div>
                            )}
                            {data.landlord_name && (
                              <div className="bg-white dark:bg-gray-800 rounded p-3">
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                  Landlord Name
                                </p>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                  {data.landlord_name}
                                </p>
                              </div>
                            )}
                            {data.landlord_contact && (
                              <div className="bg-white dark:bg-gray-800 rounded p-3">
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                  Landlord Contact
                                </p>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                  {data.landlord_contact}
                                </p>
                              </div>
                            )}
                            {data.agreement_start_date && (
                              <div className="bg-white dark:bg-gray-800 rounded p-3">
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                  Agreement Start
                                </p>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                  {formatDate(data.agreement_start_date)}
                                </p>
                              </div>
                            )}
                            {data.agreement_end_date && (
                              <div className="bg-white dark:bg-gray-800 rounded p-3">
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                  Agreement End
                                </p>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                  {formatDate(data.agreement_end_date)}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Equipment Details */}
                      {(data.ofc_details || data.equipment_details) && (
                        <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-5 border border-indigo-200 dark:border-indigo-800">
                          <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100 mb-4 flex items-center">
                            <svg
                              className="w-5 h-5 mr-2"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                              />
                            </svg>
                            Equipment Details
                          </h3>
                          {data.ofc_details && (
                            <div className="mb-3">
                              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                                OFC Details:
                              </p>
                              <div className="bg-white dark:bg-gray-800 rounded p-3">
                                <pre className="text-xs text-gray-700 dark:text-gray-300 overflow-auto whitespace-pre-wrap">
                                  {typeof data.ofc_details === "string"
                                    ? data.ofc_details
                                    : JSON.stringify(data.ofc_details, null, 2)}
                                </pre>
                              </div>
                            </div>
                          )}
                          {data.equipment_details && (
                            <div>
                              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                                Equipment Details:
                              </p>
                              <div className="bg-white dark:bg-gray-800 rounded p-3">
                                <pre className="text-xs text-gray-700 dark:text-gray-300 overflow-auto whitespace-pre-wrap">
                                  {typeof data.equipment_details === "string"
                                    ? data.equipment_details
                                    : JSON.stringify(
                                        data.equipment_details,
                                        null,
                                        2,
                                      )}
                                </pre>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Notes */}
                      {data.notes && (
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                            <svg
                              className="w-5 h-5 mr-2"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                            Notes
                          </h3>
                          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                            {data.notes}
                          </p>
                        </div>
                      )}

                      {/* System Information */}
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-5 border border-gray-300 dark:border-gray-600">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                          <svg
                            className="w-5 h-5 mr-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                            />
                          </svg>
                          System Information
                        </h3>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="bg-white dark:bg-gray-700 rounded p-2">
                            <p className="text-gray-500 dark:text-gray-400 mb-1">
                              ID
                            </p>
                            <p className="font-mono font-semibold text-gray-900 dark:text-white">
                              {data.id}
                            </p>
                          </div>
                          <div className="bg-white dark:bg-gray-700 rounded p-2">
                            <p className="text-gray-500 dark:text-gray-400 mb-1">
                              User ID
                            </p>
                            <p className="font-mono font-semibold text-gray-900 dark:text-white">
                              {data.user_id}
                            </p>
                          </div>
                          {data.region_id && (
                            <div className="bg-white dark:bg-gray-700 rounded p-2">
                              <p className="text-gray-500 dark:text-gray-400 mb-1">
                                Region ID
                              </p>
                              <p className="font-mono font-semibold text-gray-900 dark:text-white">
                                {data.region_id}
                              </p>
                            </div>
                          )}
                          {data.created_by && (
                            <div className="bg-white dark:bg-gray-700 rounded p-2">
                              <p className="text-gray-500 dark:text-gray-400 mb-1">
                                Created By
                              </p>
                              <p className="font-mono font-semibold text-gray-900 dark:text-white">
                                {data.created_by}
                              </p>
                            </div>
                          )}
                          <div className="bg-white dark:bg-gray-700 rounded p-2 col-span-2">
                            <p className="text-gray-500 dark:text-gray-400 mb-1">
                              Created At
                            </p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {formatDate(data.created_at)}
                            </p>
                          </div>
                          {data.updated_at && (
                            <div className="bg-white dark:bg-gray-700 rounded p-2 col-span-2">
                              <p className="text-gray-500 dark:text-gray-400 mb-1">
                                Last Updated
                              </p>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {formatDate(data.updated_at)}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }

                // Customer Details
                if (type === "customer") {
                  return (
                    <div className="space-y-5">
                      {/* Basic Information */}
                      <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-lg p-5 border border-cyan-200 dark:border-cyan-800">
                        <h3 className="text-lg font-semibold text-cyan-900 dark:text-cyan-100 mb-4 flex items-center">
                          <svg
                            className="w-5 h-5 mr-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                          Basic Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-white dark:bg-gray-800 rounded p-3">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                              Item Name
                            </p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {data.item_name}
                            </p>
                          </div>
                          <div className="bg-white dark:bg-gray-800 rounded p-3">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                              Type
                            </p>
                            <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-cyan-100 text-cyan-800 dark:bg-cyan-800 dark:text-cyan-100">
                              {data.item_type || "Customer"}
                            </span>
                          </div>
                          {data.unique_id && (
                            <div className="bg-white dark:bg-gray-800 rounded p-3">
                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                Unique ID
                              </p>
                              <p className="text-sm font-mono font-semibold text-gray-900 dark:text-white">
                                {data.unique_id}
                              </p>
                            </div>
                          )}
                          {data.status && (
                            <div className="bg-white dark:bg-gray-800 rounded p-3">
                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                Status
                              </p>
                              <span
                                className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                  data.status === "Active"
                                    ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                                    : data.status === "Inactive"
                                      ? "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100"
                                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100"
                                }`}
                              >
                                {data.status}
                              </span>
                            </div>
                          )}
                          {data.network_id && (
                            <div className="bg-white dark:bg-gray-800 rounded p-3">
                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                Network ID
                              </p>
                              <p className="text-sm font-mono font-semibold text-gray-900 dark:text-white">
                                {data.network_id}
                              </p>
                            </div>
                          )}
                          {data.ref_code && (
                            <div className="bg-white dark:bg-gray-800 rounded p-3">
                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                Reference Code
                              </p>
                              <p className="text-sm font-mono font-semibold text-gray-900 dark:text-white">
                                {data.ref_code}
                              </p>
                            </div>
                          )}
                          {data.source && (
                            <div className="bg-white dark:bg-gray-800 rounded p-3">
                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                Source
                              </p>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {data.source}
                              </p>
                            </div>
                          )}
                          {data.customer_name && (
                            <div className="bg-white dark:bg-gray-800 rounded p-3">
                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                Customer Name
                              </p>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {data.customer_name}
                              </p>
                            </div>
                          )}
                          {data.nature_of_business && (
                            <div className="bg-white dark:bg-gray-800 rounded p-3">
                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                Business Type
                              </p>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {data.nature_of_business}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Location Information */}
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-5 border border-blue-200 dark:border-blue-800">
                        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4 flex items-center">
                          <svg
                            className="w-5 h-5 mr-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          Location Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {data.location_name && (
                            <div className="bg-white dark:bg-gray-800 rounded p-3 md:col-span-2">
                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                Location Name
                              </p>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {data.location_name}
                              </p>
                            </div>
                          )}
                          <div className="bg-white dark:bg-gray-800 rounded p-3">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                              Latitude
                            </p>
                            <p className="text-sm font-mono font-semibold text-gray-900 dark:text-white">
                              {Number(data.latitude).toFixed(6)}
                            </p>
                          </div>
                          <div className="bg-white dark:bg-gray-800 rounded p-3">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                              Longitude
                            </p>
                            <p className="text-sm font-mono font-semibold text-gray-900 dark:text-white">
                              {Number(data.longitude).toFixed(6)}
                            </p>
                          </div>
                          {(data.address_street ||
                            data.address_city ||
                            data.address_state) && (
                            <div className="bg-white dark:bg-gray-800 rounded p-3 md:col-span-2">
                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                Address
                              </p>
                              <p className="text-sm text-gray-900 dark:text-white">
                                {data.address_street && (
                                  <span>
                                    {data.address_street}
                                    <br />
                                  </span>
                                )}
                                {(data.address_city || data.address_state) && (
                                  <span>
                                    {data.address_city}
                                    {data.address_city &&
                                      data.address_state &&
                                      ", "}
                                    {data.address_state}
                                    {data.address_pincode &&
                                      ` - ${data.address_pincode}`}
                                  </span>
                                )}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Contact Information */}
                      {(data.contact_name ||
                        data.contact_phone ||
                        data.contact_email) && (
                        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-5 border border-purple-200 dark:border-purple-800">
                          <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-4 flex items-center">
                            <svg
                              className="w-5 h-5 mr-2"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                              />
                            </svg>
                            Contact Information
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {data.contact_name && (
                              <div className="bg-white dark:bg-gray-800 rounded p-3">
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                  Name
                                </p>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                  {data.contact_name}
                                </p>
                              </div>
                            )}
                            {data.contact_phone && (
                              <div className="bg-white dark:bg-gray-800 rounded p-3">
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                  Phone
                                </p>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                  {data.contact_phone}
                                </p>
                              </div>
                            )}
                            {data.contact_email && (
                              <div className="bg-white dark:bg-gray-800 rounded p-3">
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                  Email
                                </p>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                  {data.contact_email}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Service Details */}
                      {(data.bandwidth || data.connected_to) && (
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-5 border border-green-200 dark:border-green-800">
                          <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-4 flex items-center">
                            <svg
                              className="w-5 h-5 mr-2"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 10V3L4 14h7v7l9-11h-7z"
                              />
                            </svg>
                            Service Details
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {data.bandwidth && (
                              <div className="bg-white dark:bg-gray-800 rounded p-3">
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                  Bandwidth
                                </p>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                  {data.bandwidth}
                                </p>
                              </div>
                            )}
                            {data.connected_to && (
                              <div className="bg-white dark:bg-gray-800 rounded p-3">
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                  Connected To
                                </p>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                  {data.connected_to}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      {data.notes && (
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                            <svg
                              className="w-5 h-5 mr-2"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                            Notes
                          </h3>
                          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                            {data.notes}
                          </p>
                        </div>
                      )}

                      {/* System Information */}
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-5 border border-gray-300 dark:border-gray-600">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                          <svg
                            className="w-5 h-5 mr-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                            />
                          </svg>
                          System Information
                        </h3>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="bg-white dark:bg-gray-700 rounded p-2">
                            <p className="text-gray-500 dark:text-gray-400 mb-1">
                              ID
                            </p>
                            <p className="font-mono font-semibold text-gray-900 dark:text-white">
                              {data.id}
                            </p>
                          </div>
                          <div className="bg-white dark:bg-gray-700 rounded p-2">
                            <p className="text-gray-500 dark:text-gray-400 mb-1">
                              User ID
                            </p>
                            <p className="font-mono font-semibold text-gray-900 dark:text-white">
                              {data.user_id}
                            </p>
                          </div>
                          {data.region_id && (
                            <div className="bg-white dark:bg-gray-700 rounded p-2">
                              <p className="text-gray-500 dark:text-gray-400 mb-1">
                                Region ID
                              </p>
                              <p className="font-mono font-semibold text-gray-900 dark:text-white">
                                {data.region_id}
                              </p>
                            </div>
                          )}
                          {data.username && (
                            <div className="bg-white dark:bg-gray-700 rounded p-2">
                              <p className="text-gray-500 dark:text-gray-400 mb-1">
                                Created By
                              </p>
                              <p className="font-mono font-semibold text-gray-900 dark:text-white">
                                {data.username}
                              </p>
                            </div>
                          )}
                          <div className="bg-white dark:bg-gray-700 rounded p-2 col-span-2">
                            <p className="text-gray-500 dark:text-gray-400 mb-1">
                              Created At
                            </p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {formatDate(data.created_at)}
                            </p>
                          </div>
                          {data.updated_at && (
                            <div className="bg-white dark:bg-gray-700 rounded p-2 col-span-2">
                              <p className="text-gray-500 dark:text-gray-400 mb-1">
                                Last Updated
                              </p>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {formatDate(data.updated_at)}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }

                // Distance Measurement Details
                if (type === "distance") {
                  return (
                    <div className="space-y-5">
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-5 border border-blue-200 dark:border-blue-800">
                        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
                          📏 Measurement Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-white dark:bg-gray-800 rounded p-3">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                              Name
                            </p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {data.measurement_name}
                            </p>
                          </div>
                          <div className="bg-white dark:bg-gray-800 rounded p-3">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                              Distance
                            </p>
                            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                              {formatDistance(data.total_distance)}
                            </p>
                          </div>
                          <div className="bg-white dark:bg-gray-800 rounded p-3">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                              Points
                            </p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {data.points?.length || 0}
                            </p>
                          </div>
                          <div className="bg-white dark:bg-gray-800 rounded p-3">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                              Created
                            </p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {formatDate(data.created_at)}
                            </p>
                          </div>
                          {data.notes && (
                            <div className="bg-white dark:bg-gray-800 rounded p-3 md:col-span-2">
                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                Notes
                              </p>
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                {data.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }

                // Polygon Drawing Details
                if (type === "polygon") {
                  return (
                    <div className="space-y-5">
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-5 border border-green-200 dark:border-green-800">
                        <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-4">
                          🔷 Polygon Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-white dark:bg-gray-800 rounded p-3">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                              Name
                            </p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {data.polygon_name}
                            </p>
                          </div>
                          <div className="bg-white dark:bg-gray-800 rounded p-3">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                              Area
                            </p>
                            <p className="text-lg font-bold text-green-600 dark:text-green-400">
                              {formatArea(data.area)}
                            </p>
                          </div>
                          <div className="bg-white dark:bg-gray-800 rounded p-3">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                              Vertices
                            </p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {data.coordinates?.length || 0}
                            </p>
                          </div>
                          <div className="bg-white dark:bg-gray-800 rounded p-3">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                              Fill Color
                            </p>
                            <div className="flex items-center space-x-2">
                              <div
                                className="w-6 h-6 rounded border border-gray-300"
                                style={{ backgroundColor: data.fill_color }}
                              ></div>
                              <span className="text-xs font-mono text-gray-700 dark:text-gray-300">
                                {data.fill_color}
                              </span>
                            </div>
                          </div>
                          {data.notes && (
                            <div className="bg-white dark:bg-gray-800 rounded p-3 md:col-span-2">
                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                Notes
                              </p>
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                {data.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }

                // Circle Drawing Details
                if (type === "circle") {
                  return (
                    <div className="space-y-5">
                      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-5 border border-purple-200 dark:border-purple-800">
                        <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-4">
                          ⭕ Circle Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-white dark:bg-gray-800 rounded p-3">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                              Name
                            </p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {data.circle_name}
                            </p>
                          </div>
                          <div className="bg-white dark:bg-gray-800 rounded p-3">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                              Radius
                            </p>
                            <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                              {formatDistance(data.radius)}
                            </p>
                          </div>
                          <div className="bg-white dark:bg-gray-800 rounded p-3">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                              Center Latitude
                            </p>
                            <p className="text-sm font-mono font-semibold text-gray-900 dark:text-white">
                              {Number(data.center_lat).toFixed(6)}°
                            </p>
                          </div>
                          <div className="bg-white dark:bg-gray-800 rounded p-3">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                              Center Longitude
                            </p>
                            <p className="text-sm font-mono font-semibold text-gray-900 dark:text-white">
                              {Number(data.center_lng).toFixed(6)}°
                            </p>
                          </div>
                          <div className="bg-white dark:bg-gray-800 rounded p-3">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                              Fill Color
                            </p>
                            <div className="flex items-center space-x-2">
                              <div
                                className="w-6 h-6 rounded-full border border-gray-300"
                                style={{ backgroundColor: data.fill_color }}
                              ></div>
                              <span className="text-xs font-mono text-gray-700 dark:text-gray-300">
                                {data.fill_color}
                              </span>
                            </div>
                          </div>
                          <div className="bg-white dark:bg-gray-800 rounded p-3">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                              Created
                            </p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {formatDate(data.created_at)}
                            </p>
                          </div>
                          {data.notes && (
                            <div className="bg-white dark:bg-gray-800 rounded p-3 md:col-span-2">
                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                Notes
                              </p>
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                {data.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }

                // Sector RF Details
                if (type === "sector") {
                  return (
                    <div className="space-y-5">
                      <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-5 border border-orange-200 dark:border-orange-800">
                        <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-4">
                          📡 RF Sector Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-white dark:bg-gray-800 rounded p-3">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                              Name
                            </p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {data.sector_name}
                            </p>
                          </div>
                          <div className="bg-white dark:bg-gray-800 rounded p-3">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                              Frequency
                            </p>
                            <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                              {data.frequency} MHz
                            </p>
                          </div>
                          <div className="bg-white dark:bg-gray-800 rounded p-3">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                              Azimuth
                            </p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {data.azimuth}°
                            </p>
                          </div>
                          <div className="bg-white dark:bg-gray-800 rounded p-3">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                              Beamwidth
                            </p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {data.beamwidth}°
                            </p>
                          </div>
                          <div className="bg-white dark:bg-gray-800 rounded p-3">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                              Radius
                            </p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {formatDistance(data.radius)}
                            </p>
                          </div>
                          <div className="bg-white dark:bg-gray-800 rounded p-3">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                              Tower Location
                            </p>
                            <p className="text-xs font-mono text-gray-700 dark:text-gray-300">
                              {Number(data.tower_lat).toFixed(4)}°,{" "}
                              {Number(data.tower_lng).toFixed(4)}°
                            </p>
                          </div>
                          {data.notes && (
                            <div className="bg-white dark:bg-gray-800 rounded p-3 md:col-span-2">
                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                Notes
                              </p>
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                {data.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }


                // Elevation Profile Details
                if (type === "elevation") {
                  return (
                    <div className="space-y-5">
                      <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-5 border border-indigo-200 dark:border-indigo-800">
                        <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100 mb-4">
                          ⛰️ Elevation Profile Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-white dark:bg-gray-800 rounded p-3">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                              Name
                            </p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {data.profile_name}
                            </p>
                          </div>
                          <div className="bg-white dark:bg-gray-800 rounded p-3">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                              Total Distance
                            </p>
                            <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                              {formatDistance(data.total_distance)}
                            </p>
                          </div>
                          <div className="bg-white dark:bg-gray-800 rounded p-3">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                              Max Elevation
                            </p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {data.max_elevation}m
                            </p>
                          </div>
                          <div className="bg-white dark:bg-gray-800 rounded p-3">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                              Min Elevation
                            </p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {data.min_elevation}m
                            </p>
                          </div>
                          <div className="bg-white dark:bg-gray-800 rounded p-3">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                              Created
                            </p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {formatDate(data.created_at)}
                            </p>
                          </div>
                          {data.notes && (
                            <div className="bg-white dark:bg-gray-800 rounded p-3 md:col-span-2">
                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                Notes
                              </p>
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                {data.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* ✨ LOS Analysis Section */}
                      {data.los_analysis && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-5 border border-blue-200 dark:border-blue-800">
                          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4 flex items-center">
                            <svg
                              className="w-5 h-5 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                            Line-of-Sight Analysis
                          </h3>

                          {/* LOS Status Banner */}
                          <div
                            className={`p-3 rounded-lg mb-4 ${
                              (
                                typeof data.los_analysis === "string"
                                  ? JSON.parse(data.los_analysis).isClear
                                  : data.los_analysis.isClear
                              )
                                ? "bg-green-100 dark:bg-green-900/30 border border-green-300"
                                : "bg-red-100 dark:bg-red-900/30 border border-red-300"
                            }`}
                          >
                            <p
                              className={`font-bold text-lg ${
                                (
                                  typeof data.los_analysis === "string"
                                    ? JSON.parse(data.los_analysis).isClear
                                    : data.los_analysis.isClear
                                )
                                  ? "text-green-700 dark:text-green-300"
                                  : "text-red-700 dark:text-red-300"
                              }`}
                            >
                              {(
                                typeof data.los_analysis === "string"
                                  ? JSON.parse(data.los_analysis).isClear
                                  : data.los_analysis.isClear
                              )
                                ? "✓ CLEAR LINE OF SIGHT"
                                : "✗ OBSTRUCTED PATH"}
                            </p>
                            <p className="text-sm mt-1 text-gray-700 dark:text-gray-300">
                              {(typeof data.los_analysis === "string"
                                ? JSON.parse(data.los_analysis)
                                    .clearancePercentage
                                : data.los_analysis.clearancePercentage
                              ).toFixed(1)}
                              % Fresnel clearance
                            </p>
                          </div>

                          {/* LOS Stats Grid */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="bg-white dark:bg-gray-800 rounded p-3">
                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                Obstructions
                              </p>
                              <p className="text-lg font-bold text-gray-900 dark:text-white">
                                {typeof data.los_analysis === "string"
                                  ? JSON.parse(data.los_analysis).obstructions
                                      .length
                                  : data.los_analysis.obstructions.length}
                              </p>
                            </div>
                            <div className="bg-white dark:bg-gray-800 rounded p-3">
                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                Buildings
                              </p>
                              <p className="text-lg font-bold text-gray-900 dark:text-white">
                                {typeof data.los_analysis === "string"
                                  ? JSON.parse(data.los_analysis).statistics
                                      .buildingsDetected
                                  : data.los_analysis.statistics
                                      .buildingsDetected}
                              </p>
                            </div>
                            <div className="bg-white dark:bg-gray-800 rounded p-3">
                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                Start Antenna
                              </p>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {data.antenna_height_1}m
                              </p>
                            </div>
                            <div className="bg-white dark:bg-gray-800 rounded p-3">
                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                End Antenna
                              </p>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {data.antenna_height_2}m
                              </p>
                            </div>
                            <div className="bg-white dark:bg-gray-800 rounded p-3">
                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                RF Frequency
                              </p>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {data.rf_frequency} MHz
                              </p>
                            </div>
                            <div className="bg-white dark:bg-gray-800 rounded p-3 md:col-span-3">
                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                Worst Clearance
                              </p>
                              <p
                                className={`text-lg font-bold ${
                                  (typeof data.los_analysis === "string"
                                    ? JSON.parse(data.los_analysis)
                                        .worstClearance
                                    : data.los_analysis.worstClearance) >= 0
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {(typeof data.los_analysis === "string"
                                  ? JSON.parse(data.los_analysis).worstClearance
                                  : data.los_analysis.worstClearance
                                ).toFixed(1)}
                                m
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                // Fallback for unknown types
                return (
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <pre className="text-xs text-gray-700 dark:text-gray-300 overflow-auto">
                      {JSON.stringify(data, null, 2)}
                    </pre>
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 dark:bg-opacity-50 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button
                onClick={() =>
                  setViewDetailsModal({ isOpen: false, data: null, type: "" })
                }
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full transform transition-all">
            <div className="relative px-6 py-5 bg-gradient-to-r from-red-600 to-rose-600 dark:from-red-700 dark:to-rose-700 rounded-t-2xl">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <svg
                    className="w-7 h-7 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Confirm Delete
                  </h2>
                  <p className="text-red-100 text-sm mt-0.5">
                    This action cannot be undone
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-6 space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                Are you sure you want to permanently delete this item?
              </p>

              <div className="relative overflow-hidden bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900 dark:from-opacity-30 dark:to-rose-900 dark:to-opacity-30 rounded-xl p-4 border-2 border-red-200 dark:border-red-800">
                <div className="relative">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-red-600 dark:bg-red-500 rounded-lg flex items-center justify-center mr-2">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </div>
                    <p className="text-xs font-bold text-red-900 dark:text-red-100 uppercase tracking-wide">
                      {deleteConfirmModal.type}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white break-words">
                    {deleteConfirmModal.itemName}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-2 bg-amber-50 dark:bg-amber-900 dark:bg-opacity-20 rounded-lg p-3 border border-amber-200 dark:border-amber-800">
                <svg
                  className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <p className="text-xs text-amber-900 dark:text-amber-100 font-medium">
                  All associated data will be permanently removed from the
                  system.
                </p>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 dark:bg-opacity-50 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3 rounded-b-2xl">
              <button
                onClick={() =>
                  setDeleteConfirmModal({
                    isOpen: false,
                    type: "",
                    id: null,
                    itemName: "",
                    userId: undefined,
                  })
                }
                className="px-5 py-2.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg font-medium border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transform hover:scale-105 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BULK DELETE CONFIRMATION MODAL */}
      {bulkDeleteModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full transform transition-all">
            <div className="relative px-6 py-5 bg-gradient-to-r from-red-600 to-rose-600 dark:from-red-700 dark:to-rose-700 rounded-t-2xl">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <svg
                    className="w-7 h-7 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Bulk Delete Warning
                  </h2>
                  <p className="text-red-100 text-sm mt-0.5">
                    This will delete ALL items in this category
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-6 space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                Are you sure you want to permanently delete ALL items in this
                category?
              </p>

              <div className="relative overflow-hidden bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900 dark:from-opacity-30 dark:to-rose-900 dark:to-opacity-30 rounded-xl p-4 border-2 border-red-200 dark:border-red-800">
                <div className="relative">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-red-600 dark:bg-red-500 rounded-lg flex items-center justify-center mr-2">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </div>
                    <p className="text-xs font-bold text-red-900 dark:text-red-100 uppercase tracking-wide">
                      Category: {bulkDeleteModal.categoryLabel}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {selectedUserId === "me" &&
                      "All YOUR items in this category will be deleted"}
                    {selectedUserId === "all" &&
                      rolesMatch(user?.role, "Admin") &&
                      "ALL USERS' items in this category will be deleted"}
                    {typeof selectedUserId === "number" &&
                      rolesMatch(user?.role, "Admin") &&
                      "All items from the selected user in this category will be deleted"}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-2 bg-amber-50 dark:bg-amber-900 dark:bg-opacity-20 rounded-lg p-3 border border-amber-200 dark:border-amber-800">
                <svg
                  className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <p className="text-xs text-amber-900 dark:text-amber-100 font-medium">
                  This action cannot be undone! All data will be permanently
                  removed from the database.
                </p>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 dark:bg-opacity-50 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3 rounded-b-2xl">
              <button
                onClick={() =>
                  setBulkDeleteModal({
                    isOpen: false,
                    category: "",
                    categoryLabel: "",
                  })
                }
                className="px-5 py-2.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg font-medium border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transform hover:scale-105 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBulkDelete}
                className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                Delete All Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NOTIFICATION MODAL */}
      {notificationModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full transform transition-all">
            <div className="p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  {notificationModal.type === "success" && (
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                      <svg
                        className="w-8 h-8 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  )}
                  {notificationModal.type === "error" && (
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg">
                      <svg
                        className="w-8 h-8 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </div>
                  )}
                  {notificationModal.type === "warning" && (
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
                      <svg
                        className="w-8 h-8 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                    </div>
                  )}
                  {notificationModal.type === "info" && (
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                      <svg
                        className="w-8 h-8 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="flex-1 pt-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    {notificationModal.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {notificationModal.message}
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 dark:bg-opacity-50 border-t border-gray-200 dark:border-gray-700 flex justify-end rounded-b-2xl">
              <button
                onClick={() =>
                  setNotificationModal({
                    isOpen: false,
                    type: "success",
                    title: "",
                    message: "",
                  })
                }
                className={`px-6 py-2.5 text-sm font-medium text-white rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 ${
                  notificationModal.type === "success"
                    ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    : notificationModal.type === "error"
                      ? "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700"
                      : notificationModal.type === "warning"
                        ? "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                        : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                }`}
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🆕 Elevation Graph Modal */}
      {elevationModal.isOpen && elevationModal.data && (
        <ElevationGraphModal
          isOpen={elevationModal.isOpen}
          onClose={() => setElevationModal({ isOpen: false, data: null })}
          measurementData={elevationModal.data}
        />
      )}

      {/* Delete Selected Confirmation Modal */}
      {deleteSelectedModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-fadeIn">
            {/* Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-orange-500 to-red-500">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Delete Selected Items
                  </h3>
                  <p className="text-orange-100 text-sm mt-1">
                    This action cannot be undone
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-6">
              <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">
                Are you sure you want to delete{" "}
                <span className="font-bold text-red-600 dark:text-red-400">
                  {deleteSelectedModal.count}
                </span>{" "}
                selected{" "}
                <span className="font-semibold">
                  {deleteSelectedModal.type}
                </span>{" "}
                {deleteSelectedModal.count === 1 ? "item" : "items"}?
              </p>
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900 dark:bg-opacity-20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-300 flex items-start">
                  <svg
                    className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>
                    All selected items will be permanently deleted from the
                    database.
                  </span>
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 flex items-center justify-end space-x-3">
              <button
                onClick={() =>
                  setDeleteSelectedModal({
                    isOpen: false,
                    type: "",
                    count: 0,
                    onConfirm: () => {},
                  })
                }
                className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={deleteSelectedModal.onConfirm}
                className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 rounded-lg shadow-lg hover:shadow-xl transition-all"
              >
                Delete {deleteSelectedModal.count}{" "}
                {deleteSelectedModal.count === 1 ? "Item" : "Items"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl z-50 flex items-center justify-center"
          aria-label="Scroll to top"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </button>
      )}

      {/* Import Modal */}
      <ImportDataModal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)} 
        onImportSuccess={loadData} 
      />
    </div>
  );
};

export default GISDataHub;
