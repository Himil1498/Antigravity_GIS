import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { createPortal } from "react-dom";
import {
  GoogleMap,
  Polyline,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import {
  Trash2,
  Plus,
  Info,
  Database,
  Layers,
  Edit2,
  Save,
  PlusSquare,
  PenTool,
  Undo,
  Check,
  CheckCircle2,
  Navigation,
  Activity,
  Upload,
  X,
  MapPin,
  Search,
  RefreshCw,
  User,
  Building2,
  ChevronRight,
  ChevronLeft,
  Eye,
  EyeOff,
  FileText,
  Link,
  Settings,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useGoogleMaps } from "../../contexts/GoogleMapsContext";
import {
  darkFiberApiService,
  DarkFiberDataResponse,
  DarkFiberFolder,
  DarkFiberRouteFeature,
  DarkFiberNodeFeature,
} from "../../services/darkFiberApiService";
import { toast } from "react-toastify";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { useTheme } from "../../contexts/ThemeContext";
import { darkMapStyle } from "../../features/map/utils/mapStyles";
import { useAddressInspector } from "../../features/map/hooks/useAddressInspector";
import LiveCoordinates from "../../features/map/components/LiveCoordinates";
import MapToolbar from "../../features/map/components/MapToolbar/MapToolbar";
import { useMapUser } from "../../features/map/hooks/useMapUser";
import { useMapLayers } from "../../features/map/hooks/useMapLayers";
import { BoundarySettings } from "../../features/map/types";
import {
  getFolderIconKey,
  ICON_DEFS,
} from "../../features/network-planning/components/NetworkMap/MapIcons";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const center = {
  lat: 23.0225,
  lng: 72.5714, // Default to Ahmedabad
};

// Red Color
const DARF_FIBER_COLOR = "#ef4444";

interface DarkFiberPageProps {
  jumpToFeature?: any;
  onJumpFinished?: () => void;
  selectedFolderId?: number;
  folders?: DarkFiberFolder[];
  onBackToDashboard?: () => void;
}

const INDIAN_REGIONS: {
  [key: string]: { lat: number; lng: number; zoom: number };
} = {
  // States
  "ANDHRA PRADESH": { lat: 15.9129, lng: 79.74, zoom: 7 },
  "ARUNACHAL PRADESH": { lat: 28.218, lng: 94.7278, zoom: 7 },
  ASSAM: { lat: 26.2006, lng: 92.9376, zoom: 7 },
  BIHAR: { lat: 25.0961, lng: 85.3131, zoom: 7 },
  CHHATTISGARH: { lat: 21.2787, lng: 81.8661, zoom: 7 },
  GOA: { lat: 15.2993, lng: 74.124, zoom: 10 },
  GUJARAT: { lat: 22.2587, lng: 71.1924, zoom: 7 },
  HARYANA: { lat: 29.0588, lng: 76.0856, zoom: 8 },
  "HIMACHAL PRADESH": { lat: 31.1048, lng: 77.1734, zoom: 8 },
  JHARKHAND: { lat: 23.6102, lng: 85.2799, zoom: 7 },
  KARNATAKA: { lat: 15.3173, lng: 75.7139, zoom: 7 },
  KERALA: { lat: 10.8505, lng: 76.2711, zoom: 7 },
  "MADHYA PRADESH": { lat: 22.9734, lng: 78.6569, zoom: 7 },
  MAHARASHTRA: { lat: 19.7515, lng: 75.7139, zoom: 7 },
  MANIPUR: { lat: 24.6637, lng: 93.9063, zoom: 8 },
  MEGHALAYA: { lat: 25.467, lng: 91.3662, zoom: 8 },
  MIZORAM: { lat: 23.1645, lng: 92.9376, zoom: 8 },
  NAGALAND: { lat: 26.1584, lng: 94.5624, zoom: 8 },
  ODISHA: { lat: 20.9517, lng: 83.3074, zoom: 7 },
  PUNJAB: { lat: 31.1471, lng: 75.3412, zoom: 8 },
  RAJASTHAN: { lat: 27.0238, lng: 74.2179, zoom: 7 },
  SIKKIM: { lat: 27.533, lng: 88.5122, zoom: 9 },
  "TAMIL NADU": { lat: 11.1271, lng: 78.6569, zoom: 7 },
  TELANGANA: { lat: 18.1124, lng: 79.0193, zoom: 7 },
  TRIPURA: { lat: 23.9408, lng: 91.9882, zoom: 9 },
  "UTTAR PRADESH": { lat: 26.8467, lng: 80.9462, zoom: 7 },
  UTTARAKHAND: { lat: 30.0668, lng: 79.0193, zoom: 8 },
  "WEST BENGAL": { lat: 22.9868, lng: 87.855, zoom: 7 },

  // Union Territories
  "ANDAMAN AND NICOBAR": { lat: 11.7401, lng: 92.6586, zoom: 7 },
  CHANDIGARH: { lat: 30.7333, lng: 76.7794, zoom: 12 },
  "DADRA AND NAGAR HAVELI": { lat: 20.1809, lng: 73.0169, zoom: 10 },
  "DAMAN AND DIU": { lat: 20.3974, lng: 72.8328, zoom: 11 },
  DELHI: { lat: 28.7041, lng: 77.1025, zoom: 11 },
  "JAMMU AND KASHMIR": { lat: 33.7782, lng: 76.5762, zoom: 7 },
  LADAKH: { lat: 34.1526, lng: 77.5771, zoom: 7 },
  LAKSHADWEEP: { lat: 10.5667, lng: 72.6417, zoom: 9 },
  PUDUCHERRY: { lat: 11.9416, lng: 79.8083, zoom: 11 },

  // Major Cities / Hubs
  MUMBAI: { lat: 19.076, lng: 72.8777, zoom: 11 },
  BANGALORE: { lat: 12.9716, lng: 77.5946, zoom: 11 },
  BENGALURU: { lat: 12.9716, lng: 77.5946, zoom: 11 },
  CHENNAI: { lat: 13.0827, lng: 80.2707, zoom: 11 },
  KOLKATA: { lat: 22.5726, lng: 88.3639, zoom: 11 },
  HYDERABAD: { lat: 17.385, lng: 78.4867, zoom: 11 },
  PUNE: { lat: 18.5204, lng: 73.8567, zoom: 11 },
  AHMEDABAD: { lat: 23.0225, lng: 72.5714, zoom: 11 },
  SURAT: { lat: 21.1702, lng: 72.8311, zoom: 11 },
  JAIPUR: { lat: 26.9124, lng: 75.7873, zoom: 11 },
  LUCKNOW: { lat: 26.8467, lng: 80.9462, zoom: 11 },
  KANPUR: { lat: 26.4499, lng: 80.3319, zoom: 11 },
  NAGPUR: { lat: 21.1458, lng: 79.0882, zoom: 11 },
  INDORE: { lat: 22.7196, lng: 75.8577, zoom: 11 },
  THANE: { lat: 19.2183, lng: 72.9781, zoom: 11 },
  BHOPAL: { lat: 23.2599, lng: 77.4126, zoom: 11 },
  VISAKHAPATNAM: { lat: 17.6868, lng: 83.2185, zoom: 11 },
  PATNA: { lat: 25.5941, lng: 85.1376, zoom: 11 },
  VADODARA: { lat: 22.3072, lng: 73.1812, zoom: 11 },
  GHAZIABAD: { lat: 28.6692, lng: 77.4538, zoom: 11 },
  LUDHIANA: { lat: 30.901, lng: 75.8573, zoom: 11 },
  AGRA: { lat: 27.1767, lng: 78.0081, zoom: 11 },
  NASHIK: { lat: 19.9975, lng: 73.7898, zoom: 11 },
  FARIDABAD: { lat: 28.4089, lng: 77.3178, zoom: 11 },
  MEERUT: { lat: 28.9845, lng: 77.7064, zoom: 11 },
  RAJKOT: { lat: 22.3039, lng: 70.8022, zoom: 11 },
  KALYAN: { lat: 19.2354, lng: 73.1306, zoom: 11 },
  DOMBIVLI: { lat: 19.2354, lng: 73.1306, zoom: 11 },
  VIRAR: { lat: 19.3913, lng: 72.8397, zoom: 11 },
  VARANASI: { lat: 25.3176, lng: 82.9739, zoom: 11 },
  SRINAGAR: { lat: 34.0837, lng: 74.7973, zoom: 11 },
  AURANGABAD: { lat: 19.8762, lng: 75.3433, zoom: 11 },
  DHANBAD: { lat: 23.7957, lng: 86.4304, zoom: 11 },
  AMRITSAR: { lat: 31.634, lng: 74.8723, zoom: 11 },
  "NAVI MUMBAI": { lat: 19.033, lng: 73.0297, zoom: 11 },
  ALLAHABAD: { lat: 25.4358, lng: 81.8463, zoom: 11 },
  RANCHI: { lat: 23.3441, lng: 85.3096, zoom: 11 },
  HOWRAH: { lat: 22.5769, lng: 88.3186, zoom: 11 },
  COIMBATORE: { lat: 11.0168, lng: 76.9558, zoom: 11 },
  JABALPUR: { lat: 23.1815, lng: 79.9864, zoom: 11 },
  GWALIOR: { lat: 26.2183, lng: 78.1828, zoom: 11 },
  VIJAYAWADA: { lat: 16.5062, lng: 80.648, zoom: 11 },
  JODHPUR: { lat: 26.2389, lng: 73.0243, zoom: 11 },
  MADURAI: { lat: 9.9252, lng: 78.1198, zoom: 11 },
  RAIPUR: { lat: 21.2514, lng: 81.6296, zoom: 11 },
  KOTA: { lat: 25.1825, lng: 75.8648, zoom: 11 },
  GUWAHATI: { lat: 26.1445, lng: 91.7362, zoom: 11 },
  SOLAPUR: { lat: 17.6599, lng: 75.9064, zoom: 11 },
  BAREILLY: { lat: 28.367, lng: 79.4304, zoom: 11 },
  MORADABAD: { lat: 28.835, lng: 78.7749, zoom: 11 },
  MYSORE: { lat: 12.2958, lng: 76.6394, zoom: 11 },
  GURGAON: { lat: 28.4595, lng: 77.0266, zoom: 11 },
  GURUGRAM: { lat: 28.4595, lng: 77.0266, zoom: 11 },
  NOIDA: { lat: 28.5355, lng: 77.391, zoom: 11 },
  ALIGARH: { lat: 27.8974, lng: 78.088, zoom: 11 },
  JALANDHAR: { lat: 31.326, lng: 75.5762, zoom: 11 },
  TIRUCHIRAPPALLI: { lat: 10.7905, lng: 78.7047, zoom: 11 },
  BHUBANESWAR: { lat: 20.2961, lng: 85.8245, zoom: 11 },
  SALEM: { lat: 11.6643, lng: 78.146, zoom: 11 },
  WARANGAL: { lat: 17.9784, lng: 79.5941, zoom: 11 },
  THIRUVANANTHAPURAM: { lat: 8.5241, lng: 76.9366, zoom: 11 },
  BHIWANDI: { lat: 19.2813, lng: 73.0483, zoom: 11 },
  SAHARANPUR: { lat: 29.964, lng: 77.546, zoom: 11 },
  AMRAVATI: { lat: 20.9374, lng: 77.7796, zoom: 11 },
  GORAKHPUR: { lat: 26.7606, lng: 83.3731, zoom: 11 },
  BIKANER: { lat: 28.0196, lng: 73.3119, zoom: 11 },
  FIROZABAD: { lat: 27.15, lng: 78.3942, zoom: 11 },
  KOCHI: { lat: 9.9312, lng: 76.2673, zoom: 11 },
  BHAVNAGAR: { lat: 21.7645, lng: 72.1519, zoom: 11 },
  DEHRADUN: { lat: 30.3165, lng: 78.0322, zoom: 11 },
  DURGAPUR: { lat: 23.5204, lng: 87.3119, zoom: 11 },
  ASANSOL: { lat: 23.6889, lng: 86.9749, zoom: 11 },
  ROURKELA: { lat: 22.2604, lng: 84.8536, zoom: 11 },
  NANDED: { lat: 19.1383, lng: 77.321, zoom: 11 },
  KOLHAPUR: { lat: 16.705, lng: 74.2433, zoom: 11 },
  AJMER: { lat: 26.4498, lng: 74.6399, zoom: 11 },
  AKOLA: { lat: 20.7002, lng: 77.0082, zoom: 11 },
  GULBARGA: { lat: 17.3294, lng: 76.8343, zoom: 11 },
  JAMNAGAR: { lat: 22.4707, lng: 70.0577, zoom: 11 },
  UJJAIN: { lat: 23.176, lng: 75.7885, zoom: 11 },
  LONI: { lat: 28.7513, lng: 77.2882, zoom: 11 },
  JHANSI: { lat: 25.4484, lng: 78.5685, zoom: 11 },
  ULHASNAGAR: { lat: 19.2215, lng: 73.1644, zoom: 11 },
  NELLORE: { lat: 14.4426, lng: 79.9864, zoom: 11 },
  JAMMU: { lat: 32.7266, lng: 74.857, zoom: 11 },
  BELGAUM: { lat: 15.8497, lng: 74.4977, zoom: 11 },
  MANGALORE: { lat: 12.9141, lng: 74.856, zoom: 11 },
  MANGALURU: { lat: 12.9141, lng: 74.856, zoom: 11 },
  TIRUNELVELI: { lat: 8.7139, lng: 77.7567, zoom: 11 },
  MALEGAON: { lat: 20.5522, lng: 74.5204, zoom: 11 },
  GAYA: { lat: 24.7954, lng: 84.9994, zoom: 11 },
  TIRUPPUR: { lat: 11.1085, lng: 77.3411, zoom: 11 },
  DAVANAGERE: { lat: 14.4644, lng: 75.9218, zoom: 11 },
  KOZHIKODE: { lat: 11.2588, lng: 75.7804, zoom: 11 },
  AKBARPUR: { lat: 26.4385, lng: 82.5369, zoom: 11 },
  BELLARY: { lat: 15.1394, lng: 76.9214, zoom: 11 },
  PATIALA: { lat: 30.3398, lng: 76.3869, zoom: 11 },
  GOPALPUR: { lat: 19.2618, lng: 84.9082, zoom: 11 },
  AGARTALA: { lat: 23.8315, lng: 91.2868, zoom: 11 },
  BHAGALPUR: { lat: 25.2425, lng: 86.9718, zoom: 11 },
  MUZAFFARNAGAR: { lat: 29.4727, lng: 77.7085, zoom: 11 },
  BHATPARA: { lat: 22.8716, lng: 88.4069, zoom: 11 },
  PANIHATI: { lat: 22.6931, lng: 88.3748, zoom: 11 },
  LATUR: { lat: 18.4088, lng: 76.5604, zoom: 11 },
  DHULE: { lat: 20.9042, lng: 74.7749, zoom: 11 },
  ROHTAK: { lat: 28.8955, lng: 76.6066, zoom: 11 },
  SAGAR: { lat: 23.8388, lng: 78.7378, zoom: 11 },
  KORBA: { lat: 22.3595, lng: 82.7501, zoom: 11 },
  BHILAI: { lat: 21.1938, lng: 81.3509, zoom: 11 },
  BHILWARA: { lat: 25.3473, lng: 74.6408, zoom: 11 },
  RAMPUR: { lat: 28.8078, lng: 79.027, zoom: 11 },
  BERHAMPUR: { lat: 19.315, lng: 84.7941, zoom: 11 },
  SHAHJAHANPUR: { lat: 27.8819, lng: 79.9122, zoom: 11 },
  SIVASAGAR: { lat: 26.9836, lng: 94.6366, zoom: 11 },
  KALYANI: { lat: 22.975, lng: 88.4344, zoom: 11 },
  BHIWANI: { lat: 28.7932, lng: 76.139, zoom: 11 },
  AMBALA: { lat: 30.3782, lng: 76.7767, zoom: 11 },
  PANIPAT: { lat: 29.3909, lng: 76.9635, zoom: 11 },
  KARNAL: { lat: 29.6857, lng: 76.9905, zoom: 11 },
  KURUKSHETRA: { lat: 29.9695, lng: 76.8783, zoom: 11 },
  YAMUNANAGAR: { lat: 30.129, lng: 77.2674, zoom: 11 },
  PANCHKULA: { lat: 30.6942, lng: 76.8606, zoom: 11 },
};

// --- SPATIAL UTILITIES FOR FLAT KMZ LINKING ---
function distSqToSegment(
  p: { x: number; y: number },
  v: { x: number; y: number },
  w: { x: number; y: number },
) {
  const l2 = (w.x - v.x) ** 2 + (w.y - v.y) ** 2;
  if (l2 === 0) return (p.x - v.x) ** 2 + (p.y - v.y) ** 2;
  let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return (
    (p.x - (v.x + t * (w.x - v.x))) ** 2 + (p.y - (v.y + t * (w.y - v.y))) ** 2
  );
}

function isNodeNearRoute(node: any, route: any, toleranceMeters = 50) {
  if (!node?.geometry?.coordinates || !route?.geometry?.coordinates)
    return false;

  // Hard-linked route_id takes absolute priority
  if (node.properties?.route_id && node.properties.route_id === route.properties?.id) {
    return true;
  }

  const [nLng, nLat] = node.geometry.coordinates;
  const p = { x: nLng, y: nLat };

  let lineSegments: any[] = [];
  if (route.geometry.type === "LineString") {
    lineSegments = [route.geometry.coordinates];
  } else if (route.geometry.type === "MultiLineString") {
    lineSegments = route.geometry.coordinates;
  }

  const toleranceDeg = toleranceMeters / 111000;
  const tolSq = toleranceDeg * toleranceDeg;

  for (const coords of lineSegments) {
    if (!coords) continue;
    for (let i = 0; i < coords.length - 1; i++) {
      const v = { x: coords[i][0], y: coords[i][1] };
      const w = { x: coords[i + 1][0], y: coords[i + 1][1] };
      if (distSqToSegment(p, v, w) <= tolSq) return true;
    }
  }
  return false;
}
// ----------------------------------------------


const getNodeType = (n: any) => {
  if (n.properties.type === "POP" || n.properties.type === "Customer") {
    return n.properties.type;
  }
  const nl = (n.properties.name || "").toLowerCase();
  const icon = (n.properties.icon || "").toLowerCase();
  const isPop = 
    nl.includes("pop") ||
    nl.includes("bstn") ||
    nl.includes("hub") ||
    nl.includes("exchange") ||
    nl.includes("plaza") ||
    nl.includes("tower") ||
    nl.includes("colo") ||
    nl.includes("viom") ||
    icon.includes("triangle");
    
  return isPop ? "POP" : "Customer";
};

const DarkFiberPage: React.FC<DarkFiberPageProps> = ({
  jumpToFeature,
  onJumpFinished,
  selectedFolderId,
  folders,
  onBackToDashboard,
}) => {
  const { isLoaded, loadError } = useGoogleMaps();
  const { isDarkMode } = useTheme();
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [expandedRouteIds, setExpandedRouteIds] = useState<Set<string>>(new Set());
  const [pendingRouteColors, setPendingRouteColors] = useState<Record<string, string>>({});

  const { user, assignedRegions } = useMapUser();
  const [boundarySettings, setBoundarySettings] = useState<BoundarySettings>(
    () => {
      const saved = localStorage.getItem("mapBoundarySettings");
      if (saved) {
        try {
          return {
            enabled: false,
            color: "#3B82F6",
            opacity: 0.5,
            dimWhenToolActive: true,
            dimmedOpacity: 0.2,
            ...JSON.parse(saved),
          };
        } catch (error) {
          console.error("Failed to parse map boundary settings", error);
        }
      }
      return {
        enabled: false,
        color: "#3B82F6",
        opacity: 0.5,
        dimWhenToolActive: true,
        dimmedOpacity: 0.2,
      };
    },
  );

  const { layersState, handleLayerToggle, handleColorModeToggle } =
    useMapLayers(map, user, null, assignedRegions, boundarySettings);
  const [data, setData] = useState<DarkFiberDataResponse["data"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<any | null>(null);
  const [sidebarFolder, setSidebarFolder] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [explorerSearchQuery, setExplorerSearchQuery] = useState("");
  const [showLabels, setShowLabels] = useState(false);
  const [imports, setImports] = useState<any[]>([]);
  const [visibleImportIds, setVisibleImportIds] = useState<Set<number>>(
    new Set(),
  );
  const [mapTypeId, setMapTypeId] = useState<string>("roadmap");

  // Properties Edit State
  const [editColor, setEditColor] = useState<string>("#ef4444");
  const [editIcon, setEditIcon] = useState<string>("");
  const [editIconColor, setEditIconColor] = useState<string>("");

  // Edit / Add State
  const [addNodeMode, setAddNodeMode] = useState<"POP" | "Customer" | null>(
    null,
  );
  const [linkedRoute, setLinkedRoute] = useState<{ id: number; name: string } | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [tempNodePos, setTempNodePos] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [newNodeData, setNewNodeData] = useState<{
    name: string;
    type: "POP" | "Customer";
    description: string;
    icon: string;
    iconColor?: string;
  }>({ name: "", type: "POP", description: "", icon: "", iconColor: "" });
  const [editingRouteId, setEditingRouteId] = useState<number | null>(null);
  const polylineRefs = useRef<{ [key: number]: google.maps.Polyline }>({});
  const editPolyRef = useRef<google.maps.Polyline | null>(null);
  const dataRef = useRef<any>(null);
  const [routeVersion, setRouteVersion] = useState(0);
  const loadedFolderIdRef = useRef<number | undefined>(undefined);
  const shouldFitBoundsRef = useRef<boolean>(false);
  const lastImportsRef = useRef<any[]>([]);
  const lastVisibleIdsRef = useRef<Set<number>>(new Set());

  // Drawing State
  const [isDrawingRoute, setIsDrawingRoute] = useState(false);
  const [drawPath, setDrawPath] = useState<{ lat: number; lng: number }[]>([]);
  const [mousePos, setMousePos] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [showRouteSaveModal, setShowRouteSaveModal] = useState(false);
  const [newRouteData, setNewRouteData] = useState({
    name: "",
    color: "#10b981",
    thickness: 4,
  });

  useAddressInspector(map, isDrawingRoute || addNodeMode ? "DRAW" : null);

  // Dialog State
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: "", message: "", onConfirm: () => {} });

  const [showImport, setShowImport] = useState(false);
  const [showTopology, setShowTopology] = useState(false);

  // Filters State
  const [showPOPs, setShowPOPs] = useState(true);
  const [showCustomers, setShowCustomers] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);

  // Keep a ref that always holds the latest visibleImportIds to avoid stale closures
  const visibleImportIdsRef = useRef<Set<number>>(visibleImportIds);
  useEffect(() => {
    visibleImportIdsRef.current = visibleImportIds;
  }, [visibleImportIds]);

  const zoomToRegionFallback = useCallback(() => {
    if (!map || !selectedFolderId || !folders || folders.length === 0) return;
    let currentFolderId: number | undefined = selectedFolderId;
    let foundRegion: string | null = null;
    let safetyCounter = 0;
    while (currentFolderId && safetyCounter < 50) {
      safetyCounter++;
      const folder = folders.find((f) => f.id === currentFolderId);
      if (!folder) break;
      const folderNameUpper = folder.name.toUpperCase().trim();
      const matchedKey = Object.keys(INDIAN_REGIONS).find(
        (key) =>
          folderNameUpper.includes(key.toUpperCase()) ||
          key.toUpperCase().includes(folderNameUpper),
      );
      if (matchedKey) {
        foundRegion = matchedKey;
        break;
      }
      currentFolderId = folder.parent_id || undefined;
    }
    if (foundRegion) {
      const coords = INDIAN_REGIONS[foundRegion];
      map.panTo({ lat: coords.lat, lng: coords.lng });
      map.setZoom(coords.zoom);
    }
  }, [map, selectedFolderId, folders]);

  const fetchData = useCallback(
    async (silent = false) => {
      try {
        if (!silent) setLoading(true);
        const [dataRes, importsRes] = await Promise.all([
          darkFiberApiService.getDarkFiberData(selectedFolderId),
          darkFiberApiService.getImports(selectedFolderId),
        ]);

        // SYNCHRONOUS UPDATE: Ensure dataRef is fresh BEFORE any state updates trigger re-renders
        dataRef.current = dataRes.data;

        setData(dataRes.data);

        // Use the REF (not the stale closure) to read current visibility
        const liveVisibleIds = visibleImportIdsRef.current;

        // Preserve visibility, only add new imports (like Manual Additions)
        const currentVisibleIds =
          lastVisibleIdsRef.current.size > 0
            ? new Set(lastVisibleIdsRef.current)
            : new Set(liveVisibleIds);

        const newVisibleIds = new Set<number>();
        importsRes.data.forEach((imp: any) => {
          const isManual = imp.filename === "Manual Additions";
          const isNew = !lastImportsRef.current.find(
            (existing: any) => existing.id === imp.id,
          );
          const wasVisible = currentVisibleIds.has(imp.id);
          const isFirstLoad = currentVisibleIds.size === 0;

          if (isManual || isNew || wasVisible || isFirstLoad) {
            newVisibleIds.add(imp.id);
          }
        });

        setVisibleImportIds(newVisibleIds);
        // Important: Clear the ref after restoration so normal toggle logic resumes
        lastVisibleIdsRef.current = new Set();

        setImports(importsRes.data);
        lastImportsRef.current = importsRes.data;
        setRouteVersion((v) => v + 1);

        // Auto-fit bounds if we have data AND aren't jumping to a specific spot
        const isInitial = loadedFolderIdRef.current !== selectedFolderId;
        const forceFit = shouldFitBoundsRef.current;
        if (map && !jumpToFeature && (isInitial || forceFit)) {
          if (dataRes.data.nodes.features.length > 0) {
            const bounds = new google.maps.LatLngBounds();
            dataRes.data.nodes.features.forEach((f: any) => {
              if (f.geometry.coordinates) {
                bounds.extend({
                  lat: f.geometry.coordinates[1],
                  lng: f.geometry.coordinates[0],
                });
              }
            });
            map.fitBounds(bounds);

            // Add a little padding by zooming out slightly if it's too close
            const listener = google.maps.event.addListener(map, "idle", () => {
              if (map.getZoom()! > 16) map.setZoom(16);
              google.maps.event.removeListener(listener);
            });
          } else {
            zoomToRegionFallback();
          }

          loadedFolderIdRef.current = selectedFolderId;
          shouldFitBoundsRef.current = false;
        }
      } catch (err) {
        toast.error("Failed to load dark fiber network data");
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [map, jumpToFeature, selectedFolderId, zoomToRegionFallback],
  );

  useEffect(() => {
    fetchData();
  }, [selectedFolderId, fetchData]);

  // Handle Jump to Feature from Dashboard
  useEffect(() => {
    if (map && jumpToFeature && data) {
      let position: { lat: number; lng: number } | null = null;

      if (jumpToFeature.geometry.type === "Point") {
        position = {
          lat: jumpToFeature.geometry.coordinates[1],
          lng: jumpToFeature.geometry.coordinates[0],
        };
      } else if (jumpToFeature.geometry.type === "LineString") {
        position = {
          lat: jumpToFeature.geometry.coordinates[0][1],
          lng: jumpToFeature.geometry.coordinates[0][0],
        };
      }

      if (position) {
        map.panTo(position);
        map.setZoom(18);
        setSelectedFeature({
          type: jumpToFeature.properties.type || "Route",
          properties: jumpToFeature.properties,
          position,
        });
      }

      onJumpFinished?.();
    }
  }, [map, jumpToFeature, data, onJumpFinished]);

  useEffect(() => {
    if (selectedFeature) {
      setEditColor(selectedFeature.properties.color || "#ef4444");
      setEditIcon(selectedFeature.properties.icon || "");
      setEditIconColor(selectedFeature.properties.iconColor || "");
    }
  }, [selectedFeature]);

  const saveProperties = async () => {
    if (!selectedFeature) return;
    try {
      const updatedProps = { ...selectedFeature.properties };
      if (selectedFeature.type === "Route") {
        updatedProps.color = editColor;
        await darkFiberApiService.updateRouteProperties(
          selectedFeature.properties.id,
          updatedProps,
        );
      } else {
        updatedProps.icon = editIcon;
        updatedProps.iconColor = editIconColor;
        await darkFiberApiService.updateNodeProperties(
          selectedFeature.properties.id,
          updatedProps,
        );
      }

      toast.success("Properties updated");
      setSelectedFeature(null);

      // Reload the page to show the updated color/properties
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err) {
      toast.error("Failed to update");
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (selectedFolderId === undefined) {
      toast.warning(
        "Please select an India Region from the sidebar before importing.",
      );
      event.target.value = "";
      return;
    }

    const ext = file.name.toLowerCase();
    if (!ext.endsWith(".kmz") && !ext.endsWith(".kml")) {
      toast.error("Please select a valid KML or KMZ file.");
      return;
    }

    try {
      setUploading(true);
      const res = await darkFiberApiService.importFile(file, selectedFolderId);
      toast.success(res.message);
      shouldFitBoundsRef.current = true;
      await fetchData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to upload file.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleDeleteFeature = () => {
    if (!selectedFeature) return;
    const id = selectedFeature.properties.id;
    const type = selectedFeature.type;

    setConfirmConfig({
      isOpen: true,
      title: `Delete ${type}`,
      message: `Are you sure you want to delete ${selectedFeature.properties.name || "this feature"}? This cannot be undone.`,
      onConfirm: async () => {
        try {
          if (type === "Route") {
            await darkFiberApiService.deleteRoute(id);
          } else {
            await darkFiberApiService.deleteNode(id);
          }
          toast.success(`${type} deleted successfully`);
          setSelectedFeature(null);
          fetchData();
        } catch (err) {
          toast.error(`Failed to delete ${type}`);
        }
      },
    });
  };

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (isDrawingRoute && e.latLng) {
      setDrawPath((prev) => [
        ...prev,
        { lat: e.latLng!.lat(), lng: e.latLng!.lng() },
      ]);
      return;
    }

    if (addNodeMode && e.latLng) {
      if (selectedFolderId === undefined) {
        toast.warning("Please select an India Region from the sidebar first.");
        return;
      }
      setTempNodePos({ lat: e.latLng.lat(), lng: e.latLng.lng() });
      setNewNodeData({
        name: "",
        type: addNodeMode as "POP" | "Customer",
        description: "",
        icon: "",
        iconColor: "",
      });
      setShowAddModal(true);
      setAddNodeMode(null);
    }
  };

  const handleMouseMove = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (isDrawingRoute && drawPath.length > 0 && e.latLng) {
        setMousePos({ lat: e.latLng.lat(), lng: e.latLng.lng() });
      }
    },
    [isDrawingRoute, drawPath.length],
  );

  const submitNewRoute = async () => {
    if (
      drawPath.length < 2 ||
      !newRouteData.name.trim() ||
      selectedFolderId === undefined
    ) {
      toast.warning("Please provide a name and draw at least two points.");
      return;
    }

    try {
      const geometry = {
        type: "LineString",
        coordinates: drawPath.map((p) => [p.lng, p.lat]),
      };

      const properties = {
        color: newRouteData.color,
        thickness: newRouteData.thickness,
        created_at: new Date().toISOString(),
        manual: true,
      };

      await darkFiberApiService.createRoute({
        name: newRouteData.name,
        geometry,
        properties,
        folderId: selectedFolderId,
      });

      toast.success("New route created successfully!");
      setIsDrawingRoute(false);
      setDrawPath([]);
      setMousePos(null);
      setShowRouteSaveModal(false);

      // NUCLEAR RESET: Clear data briefly to force map remount
      setData(null);

      // Sync Buffer: Give DB time to commit before re-fetching
      await new Promise((resolve) => setTimeout(resolve, 200));

      await fetchData();
    } catch (err) {
      toast.error("Failed to create route.");
    }
  };

  const submitNewNode = async () => {
    if (
      !tempNodePos ||
      !newNodeData.name.trim() ||
      selectedFolderId === undefined
    )
      return;
    try {
      const nodeProperties: Record<string, string | number | undefined> = {
        name: newNodeData.name,
        type: newNodeData.type,
        description: newNodeData.description,
        icon: newNodeData.icon,
        iconColor: newNodeData.iconColor,
      };
      if (linkedRoute) {
        nodeProperties.route_id = linkedRoute.id;
        nodeProperties.route_name = linkedRoute.name;
      }
      await darkFiberApiService.createNode({
        name: newNodeData.name,
        type: newNodeData.type,
        geometry: {
          type: "Point",
          coordinates: [tempNodePos.lng, tempNodePos.lat],
        },
        properties: nodeProperties,
        folderId: selectedFolderId,
      });
      toast.success(`${newNodeData.type} added to route: ${linkedRoute?.name || "Global"}`);
      setShowAddModal(false);
      setTempNodePos(null);
      setLinkedRoute(null);
      setNewNodeData({
        name: "",
        type: "POP",
        description: "",
        icon: "",
        iconColor: "",
      });
      fetchData();
    } catch (err) {
      toast.error(`Failed to create ${newNodeData.type}`);
    }
  };

  const saveRouteGeometry = async () => {
    if (!editingRouteId) return;
    const poly = editPolyRef.current;
    if (!poly) {
      toast.error("Could not find route geometry reference");
      return;
    }

    try {
      const path = poly.getPath().getArray();
      const coordinates = path.map((p) => [p.lng(), p.lat()]);
      const geometry = { type: "LineString", coordinates };

      await darkFiberApiService.updateRouteGeometry(editingRouteId, geometry);
      toast.success("Route geometry updated");

      // Remove edit polyline before reload
      poly.setMap(null);
      editPolyRef.current = null;

      // Reload the page to show the updated lines
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err) {
      toast.error("Failed to update route geometry");
    }
  };

  const toggleImportVisibility = (importId: number) => {
    setVisibleImportIds((prev) => {
      const next = new Set(prev);
      if (next.has(importId)) next.delete(importId);
      else next.add(importId);
      return next;
    });
  };

  const parseRoutePath = (coords: number[][]) => {
    return coords.map((c) => ({ lat: c[1], lng: c[0] }));
  };

  // Douglas-Peucker simplification to reduce excessive edit points
  // tolerance 0.00001 is approx 1.1 meters — keeps detail while removing noise
  const simplifyPath = (
    points: { lat: number; lng: number }[],
    tolerance = 0.00001,
  ): { lat: number; lng: number }[] => {
    if (points.length <= 2) return points;

    let maxDist = 0;
    let maxIdx = 0;
    const start = points[0];
    const end = points[points.length - 1];

    for (let i = 1; i < points.length - 1; i++) {
      const d = perpendicularDist(points[i], start, end);
      if (d > maxDist) {
        maxDist = d;
        maxIdx = i;
      }
    }

    if (maxDist > tolerance) {
      const left = simplifyPath(points.slice(0, maxIdx + 1), tolerance);
      const right = simplifyPath(points.slice(maxIdx), tolerance);
      return [...left.slice(0, -1), ...right];
    }
    return [start, end];
  };

  const perpendicularDist = (
    p: { lat: number; lng: number },
    a: { lat: number; lng: number },
    b: { lat: number; lng: number },
  ) => {
    const dx = b.lng - a.lng;
    const dy = b.lat - a.lat;
    if (dx === 0 && dy === 0)
      return Math.sqrt((p.lng - a.lng) ** 2 + (p.lat - a.lat) ** 2);
    const t = Math.max(
      0,
      Math.min(
        1,
        ((p.lng - a.lng) * dx + (p.lat - a.lat) * dy) / (dx * dx + dy * dy),
      ),
    );
    return Math.sqrt(
      (p.lng - (a.lng + t * dx)) ** 2 + (p.lat - (a.lat + t * dy)) ** 2,
    );
  };

  const filteredNodes = useMemo(() => {
    if (!data?.nodes?.features) return [];

    const filtered = data.nodes.features.filter((f: any) => {
      const isVisible = visibleImportIds.has(Number(f.properties.import_id));
      if (!isVisible) return false;
      if (!searchQuery) return true;
      return f.properties.name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());
    });

    // Deduplicate by name + type + rounded coordinates
    const seen = new Set<string>();
    return filtered.filter((f: any) => {
      const coords = f.geometry?.coordinates;
      const key = [
        (f.properties.name || "").trim().toLowerCase(),
        f.properties.type,
        coords ? Math.round(coords[0] * 10000) : "",
        coords ? Math.round(coords[1] * 10000) : "",
      ].join("|");
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [data, searchQuery, visibleImportIds]);

  const filteredRoutes = useMemo(() => {
    if (!data?.routes?.features) return [];
    return data.routes.features.filter((f: any) => {
      const isVisible = visibleImportIds.has(Number(f.properties.import_id));
      if (!isVisible) return false;
      if (!searchQuery) return true;
      return f.properties.name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());
    });
  }, [data, searchQuery, visibleImportIds]);

  const previousActiveRouteRef = React.useRef<any>(null);

  const activeRoute = useMemo(() => {
    let newActiveRoute = null;

    if (selectedFeature?.type === "Route" && selectedFeature?.properties?.id) {
      newActiveRoute = filteredRoutes.find(
        (r: any) => r.properties.id === selectedFeature.properties.id,
      );
    } else if ((selectedFeature?.type === "Customer" || selectedFeature?.type === "POP") && selectedFeature?.properties) {
      const realNode = filteredNodes.find((n: any) => n.properties.id === selectedFeature.properties.id);
      if (realNode) {
        const prevRoute = previousActiveRouteRef.current;
        if (prevRoute && isNodeNearRoute(realNode, prevRoute, 50)) {
          newActiveRoute = prevRoute;
        } else {
          const nodeRingFolder = selectedFeature.properties.kml_folder?.split('/')[0];
          if (nodeRingFolder) {
            const routesInRing = filteredRoutes.filter((r: any) => r.properties.kml_folder?.split('/')[0] === nodeRingFolder);
            if (routesInRing.length === 1) {
              newActiveRoute = routesInRing[0];
            } else if (routesInRing.length > 1) {
              newActiveRoute = routesInRing.find((r: any) => isNodeNearRoute(realNode, r, 50)) || null;
            }
          }
        }
      }
    }

    previousActiveRouteRef.current = newActiveRoute;
    return newActiveRoute;
  }, [selectedFeature, filteredRoutes, filteredNodes]);

  useEffect(() => {
    if (activeRoute?.properties?.id) {
      setExpandedRouteIds((prev) => {
        const next = new Set(prev);
        next.add(activeRoute.properties.id);
        return next;
      });
      setTimeout(() => {
        const el = document.getElementById(`route-accordion-${activeRoute.properties.id}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 100);
    }
  }, [activeRoute]);

  const sidebarRoutes = useMemo(() => {
    if (!sidebarFolder) return filteredRoutes;
    return filteredRoutes.filter((r: any) => {
      const folder = r.properties.kml_folder;
      if (!folder) return true;
      return folder === sidebarFolder || folder.startsWith(sidebarFolder + '/');
    });
  }, [filteredRoutes, sidebarFolder]);

  const sidebarNodes = useMemo(() => {
    if (!sidebarFolder) return filteredNodes;
    
    const validRouteIds = new Set(sidebarRoutes.map((r: any) => r.properties.id));

    return filteredNodes.filter((f: any) => {
      if (f.properties.route_id && validRouteIds.has(f.properties.route_id)) {
        return true;
      }
      const folder = f.properties.kml_folder;
      if (!folder) return true;
      return folder === sidebarFolder || folder.startsWith(sidebarFolder + '/');
    });
  }, [filteredNodes, sidebarRoutes, sidebarFolder]);

  // Cleanup imperative polyline on component unmount
  useEffect(() => {
    return () => {
      if (editPolyRef.current) {
        editPolyRef.current.setMap(null);
        editPolyRef.current = null;
      }
      setIsDrawingRoute(false);
      setDrawPath([]);
      setMousePos(null);
    };
  }, []);

  const startEditingRoute = useCallback(
    (routeId: number) => {
      // Clean up any existing edit poly
      if (editPolyRef.current) {
        editPolyRef.current.setMap(null);
        editPolyRef.current = null;
      }

      if (!map) return;

      // Read dataRef synchronously — guaranteed fresh at call time
      const routeFeature = dataRef.current?.routes?.features?.find(
        (f: any) => f.properties.id === routeId,
      );

      if (!routeFeature || routeFeature.geometry?.type !== "LineString") {
        toast.error("Route geometry not found");
        return;
      }

      const fullPath = parseRoutePath(routeFeature.geometry.coordinates);
      const simplified = simplifyPath(fullPath, 0.0002);
      const latLngs = simplified.map(
        (p) => new google.maps.LatLng(p.lat, p.lng),
      );

      const editPoly = new google.maps.Polyline({
        path: latLngs,
        strokeColor: "#f59e0b",
        strokeOpacity: 1,
        strokeWeight: 5,
        editable: true,
        clickable: true,
        zIndex: 100,
        map: map,
      });

      editPolyRef.current = editPoly;
      setEditingRouteId(routeId);
    },
    [map, simplifyPath],
  );

  // Dynamic Icons based on node type
  const getIcon = useCallback(
    (type: "POP" | "Customer", iconName?: string, iconColor?: string) => {
      // Use User path for Customer, POP building path for POP
      const iconPath = type === "POP"
        ? '<path d="M4,21h16V7h-6V3H10V7H4V21zM6,9h4v3H6V9zM14,9h4v3h-4V9zM6,14h4v3H6V14zM14,14h4v3h-4V14zM11,3h2v2h-2V3zM10,1h4v1h-4V1z"/>'
        : '<path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>';

      // Purple for Customer, Red for POP
      const color = type === "POP" ? "#ef4444" : "#8b5cf6";
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      <defs><filter id="s" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-opacity="0.3"/></filter></defs>
      <circle cx="16" cy="16" r="14" fill="${color}" stroke="white" stroke-width="2" filter="url(#s)"/>
      <svg x="6" y="6" width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="none">
        ${iconPath}
      </svg>
    </svg>`;

      const hasGoogleMaps = window.google?.maps?.Point;
      return {
        url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg),
        ...(hasGoogleMaps && {
          anchor: new window.google.maps.Point(16, 16),
          labelOrigin: new window.google.maps.Point(16, -10),
        }),
      };
    },
    [],
  );

  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  useEffect(() => {
    const locateTarget = () => {
      const el =
        document.getElementById("map-tools-portal") ||
        document.getElementById("df-map-tools-portal-target");
      if (el) {
        setPortalTarget(el);
        return true;
      }
      return false;
    };

    // Try immediately
    if (locateTarget()) return;

    // Set up a MutationObserver to watch for when the element is added
    const observer = new MutationObserver(() => {
      if (locateTarget()) {
        observer.disconnect();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Fallback: poll a few times just in case MutationObserver has any quirks in some edge cases
    const interval = setInterval(() => {
      if (locateTarget()) {
        observer.disconnect();
        clearInterval(interval);
      }
    }, 100);

    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  if (loadError)
    return (
      <div className="p-6 text-red-500 font-medium">Error loading maps.</div>
    );

  return (
    <div className="flex flex-col h-full w-full relative overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* MAP TOOLS PORTAL (Injected into unified DarkFiberLayout header) */}
      {portalTarget &&
        createPortal(
          <div className="flex items-center gap-3 pointer-events-none h-[44px]">
            {/* PILL 1: SEARCH & EXPLORER */}
            <div className="flex items-center gap-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-md border border-slate-200/60 dark:border-slate-700/60 rounded-xl p-1 pointer-events-auto">
              <div className="relative group flex items-center h-8">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Search features..."
                  className="w-32 md:w-44 h-full pl-8 pr-2 border-0 bg-transparent text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-0 transition-all placeholder-slate-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-0.5"></div>
              <button
                onClick={() => {
                  setIsSidebarOpen(!isSidebarOpen);
                  setShowTopology(false);
                }}
                className={`group relative h-8 px-3 rounded-lg flex justify-center items-center gap-1.5 transition-all duration-300 z-10 ${isSidebarOpen ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold" : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"}`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span className="text-[11px] tracking-wide whitespace-nowrap">
                  Explorer
                </span>
              </button>
            </div>

            {/* PILL 2: DRAWING TOOLS */}
            <div className="flex items-center gap-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-md border border-slate-200/60 dark:border-slate-700/60 rounded-xl p-1 pointer-events-auto">
              <button
                onClick={() => {
                  if (selectedFolderId === undefined) {
                    toast.warning("Please select a Region");
                    return;
                  }
                  setIsDrawingRoute(true);
                  setDrawPath([]);
                }}
                className={`group relative h-8 px-3 rounded-lg flex justify-center items-center gap-1.5 transition-all duration-300 z-10 ${isDrawingRoute ? "bg-teal-600 text-white shadow-sm" : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-teal-50 hover:text-teal-600 dark:hover:bg-teal-500/10 dark:hover:text-teal-400 border border-slate-200/60 dark:border-slate-700"}`}
              >
                <PenTool className="w-3.5 h-3.5" />
                <span className="text-[11px] font-bold tracking-wide whitespace-nowrap">
                  Draw Route
                </span>
              </button>

              <button
                onClick={() => {
                  if (addNodeMode === "POP") {
                    setAddNodeMode(null);
                    setLinkedRoute(null);
                    return;
                  }
                  if (!selectedFeature || selectedFeature.type !== "Route") {
                    toast.warning("Please select a Fiber Route first to anchor this POP.");
                    return;
                  }
                  setLinkedRoute({ id: selectedFeature.properties.id, name: selectedFeature.properties.name || "Unnamed Route" });
                  setAddNodeMode("POP");
                }}
                className={`group relative h-8 px-3 rounded-lg flex justify-center items-center gap-1.5 transition-all duration-300 z-10 ${addNodeMode === "POP" ? "bg-red-600 text-white shadow-sm" : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"}`}
              >
                <Building2 className={`w-3.5 h-3.5 ${addNodeMode === "POP" ? "" : "text-red-500"}`} />
                <span className="text-[11px] tracking-wide whitespace-nowrap">
                  {addNodeMode === "POP" ? "Click Route" : "Add POP"}
                </span>
              </button>

              <button
                onClick={() => {
                  if (addNodeMode === "Customer") {
                    setAddNodeMode(null);
                    setLinkedRoute(null);
                    return;
                  }
                  if (!selectedFeature || selectedFeature.type !== "Route") {
                    toast.warning("Please select a Fiber Route first to anchor this Customer.");
                    return;
                  }
                  setLinkedRoute({ id: selectedFeature.properties.id, name: selectedFeature.properties.name || "Unnamed Route" });
                  setAddNodeMode("Customer");
                }}
                className={`group relative h-8 px-3 rounded-lg flex justify-center items-center gap-1.5 transition-all duration-300 z-10 ${addNodeMode === "Customer" ? "bg-purple-600 text-white shadow-sm" : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"}`}
              >
                <User className={`w-3.5 h-3.5 ${addNodeMode === "Customer" ? "" : "text-purple-500"}`} />
                <span className="text-[11px] tracking-wide whitespace-nowrap">
                  {addNodeMode === "Customer" ? "Click Route" : "Add Cust"}
                </span>
              </button>

              {editingRouteId && (
                <>
                  <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-0.5"></div>
                  <button
                    onClick={saveRouteGeometry}
                    className="h-8 px-3 bg-teal-600 text-white rounded-lg text-[11px] font-bold flex items-center gap-1.5 shadow-sm hover:bg-teal-700 transition-colors"
                  >
                    <Save className="w-3.5 h-3.5" /> Save
                  </button>
                  <button
                    onClick={() => {
                      if (editPolyRef.current) {
                        editPolyRef.current.setMap(null);
                        editPolyRef.current = null;
                      }
                      setEditingRouteId(null);
                    }}
                    className="h-8 px-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-[11px] font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>

          </div>,
          portalTarget,
        )}

      <div
        id="df-map-tools-portal-target"
        className="absolute top-4 left-1/2 -translate-x-1/2 z-[40] flex items-center gap-2 pointer-events-auto"
      />

      {/* MAP AREA */}
      <div className="dark-fiber-map flex-1 w-full relative z-0">
        {/* DATA EXPLORER PANEL (Docked Right Side) */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="absolute top-0 right-0 z-[50] w-[280px] h-full flex flex-col
                         bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl
                         border-l border-slate-200/60 dark:border-white/10
                         shadow-[-10px_0_40px_-10px_rgba(0,0,0,0.15)]
                         text-slate-900 dark:text-white overflow-hidden rounded-bl-3xl"
            >
              {/* Panel Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200/60 dark:border-white/10 shrink-0">
                <div className="flex items-center gap-2">
                  <Activity className="text-indigo-500 w-4 h-4" />
                  <h2 className="text-xs font-bold tracking-tight uppercase">
                    Explorer
                  </h2>
                </div>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-gray-400" />
                </button>
              </div>

              {/* Context Header */}
              {sidebarFolder && (
                <div
                  className="px-4 py-2.5 bg-indigo-50/80 dark:bg-indigo-500/10 border-b border-indigo-100/50 dark:border-indigo-500/20 shrink-0 shadow-[inset_0_-1px_0_rgba(255,255,255,0.5)] dark:shadow-none"
                  style={{ backdropFilter: "blur(8px)" }}
                >
                  <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-0.5">
                    Active Network Ring
                  </div>
                  <div
                    className="text-[13px] font-semibold text-slate-800 dark:text-slate-100 truncate"
                    title={sidebarFolder}
                  >
                    {sidebarFolder.split("/").pop()}
                  </div>
                </div>
              )}

              {/* Explorer Search Bar */}
              <div className="px-3 pt-2 pb-1 shrink-0">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={explorerSearchQuery}
                    onChange={(e) => setExplorerSearchQuery(e.target.value)}
                    placeholder="Search routes, customers, POPs..."
                    className="w-full pl-8 pr-8 py-2 text-xs bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:bg-white dark:focus:bg-white/10 text-slate-800 dark:text-white placeholder-slate-400 transition-all"
                  />
                  {explorerSearchQuery && (
                    <button
                      onClick={() => setExplorerSearchQuery("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 hover:bg-slate-200 dark:hover:bg-white/10 rounded transition-colors"
                    >
                      <X className="w-3 h-3 text-slate-400" />
                    </button>
                  )}
                </div>
              </div>

              {/* Scrollable Data Lists */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-4">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-2 opacity-50">
                    <RefreshCw className="w-6 h-6 animate-spin text-teal-500" />
                    <span className="text-[10px] font-bold animate-pulse uppercase tracking-widest text-gray-400">
                      Loading...
                    </span>
                  </div>
                ) : sidebarRoutes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-3 opacity-60 text-center px-4">
                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                      <Activity className="w-5 h-5 text-indigo-400" />
                    </div>
                    <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 leading-relaxed">
                      No routes found. Draw or import a route to get started.
                    </span>
                  </div>
                ) : (
                  <>
                    {/* Fiber Routes Accordion */}
                    {(() => {
                      const eq = explorerSearchQuery.toLowerCase().trim();
                      const mappedNodeIds = new Set();
                      sidebarRoutes.forEach((route: any) => {
                        sidebarNodes.forEach((n: any) => {
                          if (isNodeNearRoute(n, route, 50)) {
                            mappedNodeIds.add(n.properties.id);
                          }
                        });
                      });
                      const unmappedNodes = sidebarNodes.filter((n: any) => !mappedNodeIds.has(n.properties.id));
                      const unmappedPOPs = unmappedNodes.filter((n: any) => getNodeType(n) === "POP");
                      const unmappedCustomers = unmappedNodes.filter((n: any) => getNodeType(n) === "Customer");

                      const renderNode = (node: any) => {
                        const iconKey = getFolderIconKey({ name: node.properties.name || "", type: getNodeType(node) });
                        const iconDef = iconKey ? ICON_DEFS[iconKey.toUpperCase()] : null;
                        const isPop = getNodeType(node) === "POP";
                        const defaultColor = isPop ? "#14b8a6" : "#f59e0b";
                        const iconColor = iconDef?.color ? `rgb(${iconDef.color[0]},${iconDef.color[1]},${iconDef.color[2]})` : defaultColor;
                        const activeBg = isPop ? "bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 ring-1 ring-teal-500/30" : "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 ring-1 ring-amber-500/30";
                        const defaultBg = "text-slate-700 dark:text-slate-200";
                        const isActive = selectedFeature?.properties?.id === node.properties.id;
                        
                        return (
                          <div
                            key={node.properties.id}
                            onClick={(e) => {
                              setSelectedFeature({
                                type: getNodeType(node),
                                properties: node.properties,
                                position: {
                                  lat: node.geometry.coordinates[1],
                                  lng: node.geometry.coordinates[0],
                                },
                                showInfoWindow: true,
                              });
                              map?.panTo({
                                lat: node.geometry.coordinates[1],
                                lng: node.geometry.coordinates[0],
                              });
                            }}
                            className={`px-2.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/80 rounded-xl cursor-pointer text-xs font-semibold flex items-center gap-2.5 transition-colors ${isActive ? activeBg : defaultBg}`}
                          >
                            {iconDef?.imageUrl ? (
                              <img src={iconDef.imageUrl} alt="" className="w-4 h-4 object-contain flex-shrink-0" />
                            ) : iconDef ? (
                              <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0 drop-shadow-sm" fill={iconColor}><path d={iconDef.path} /></svg>
                            ) : (
                              <div className={`w-2 h-2 rounded-full flex-shrink-0 shadow-sm ${isPop ? "bg-teal-500" : "bg-amber-500"}`} />
                            )}
                            <span className="break-words whitespace-normal leading-tight">{node.properties.name}</span>
                          </div>
                        );
                      };

                      return (
                        <>
                          {/* Routes Accordion */}
                          {sidebarRoutes?.length > 0 && (
                            <div className="space-y-1 mb-5">
                              <div className="flex items-center justify-between pb-2 pt-2 mb-2 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-slate-900 sticky top-0 z-20 px-1">
                                <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">Fiber Routes</h3>
                                <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 rounded-full text-[10px] font-bold">{sidebarRoutes.length}</span>
                              </div>
                              {sidebarRoutes
                                .filter((route: any) => {
                                  if (!eq) return true;
                                  const routeName = (route.properties.name || "").toLowerCase();
                                  if (routeName.includes(eq)) return true;
                                  // Also show route if any of its child nodes match
                                  const routeNodes = sidebarNodes.filter((n: any) => isNodeNearRoute(n, route, 50));
                                  return routeNodes.some((n: any) => (n.properties.name || "").toLowerCase().includes(eq));
                                })
                                .map((route: any) => {
                                const isExpanded = expandedRouteIds.has(route.properties.id) || (eq.length > 0);
                                const routeNodes = sidebarNodes.filter((n: any) => isNodeNearRoute(n, route, 50));
                                const filteredRouteNodes = eq ? routeNodes.filter((n: any) => (n.properties.name || "").toLowerCase().includes(eq)) : routeNodes;
                                const routePOPs = (eq ? filteredRouteNodes : routeNodes).filter((n: any) => getNodeType(n) === "POP");
                                const routeCustomers = (eq ? filteredRouteNodes : routeNodes).filter((n: any) => getNodeType(n) === "Customer");
                                const currentColor = pendingRouteColors[route.properties.id] || route.properties.color || "#6366f1";
                                const hasChanged = pendingRouteColors[route.properties.id] !== undefined && pendingRouteColors[route.properties.id] !== (route.properties.color || "#6366f1");
                                
                                return (
                                  <div key={route.properties.id} id={`route-accordion-${route.properties.id}`} className="space-y-0.5">
                                    <div
                                      onClick={(e) => {
                                        setExpandedRouteIds(prev => {
                                          const next = new Set(prev);
                                          if (next.has(route.properties.id)) {
                                            next.delete(route.properties.id);
                                          } else {
                                            next.add(route.properties.id);
                                          }
                                          return next;
                                        });
                                        const pos = parseRoutePath(route.geometry.type === "LineString" ? route.geometry.coordinates : route.geometry.coordinates[0])[0];
                                        setSelectedFeature({
                                          type: "Route",
                                          properties: route.properties,
                                          position: pos,
                                          showInfoWindow: true,
                                        });
                                        map?.panTo(pos);
                                      }}
                                      className={`px-2.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/80 rounded-xl cursor-pointer text-xs font-semibold flex items-center gap-2.5 transition-colors ${selectedFeature?.properties?.id === route.properties.id ? "bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-500/30" : "text-slate-700 dark:text-slate-200"}`}
                                    >
                                      <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                                        <input 
                                          type="color" 
                                          value={currentColor} 
                                          onChange={(e) => setPendingRouteColors(prev => ({ ...prev, [route.properties.id]: e.target.value }))}
                                          className="w-4 h-4 p-0 border-0 rounded cursor-pointer shrink-0 shadow-sm"
                                          title="Change Route Color"
                                        />
                                        {hasChanged && (
                                          <button 
                                            onClick={async (e) => {
                                              e.stopPropagation();
                                              try {
                                                const updatedProps = { ...route.properties, color: currentColor };
                                                await darkFiberApiService.updateRouteProperties(route.properties.id, updatedProps);
                                                toast.success("Route color saved");
                                                setTimeout(() => window.location.reload(), 500);
                                              } catch (err) { toast.error("Failed to save color"); }
                                            }}
                                            className="p-0.5 bg-teal-100 text-teal-700 hover:bg-teal-200 rounded shadow-sm"
                                            title="Save Color"
                                          >
                                            <Check className="w-3 h-3" />
                                          </button>
                                        )}
                                      </div>
                                      <span className="flex-1 break-words whitespace-normal leading-tight">{route.properties.name || "Route"}</span>
                                      {(routePOPs.length > 0 || routeCustomers.length > 0) && (
                                        <span className="text-[9px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">{routePOPs.length + routeCustomers.length}</span>
                                      )}
                                    </div>
                                    {isExpanded && (routePOPs.length > 0 || routeCustomers.length > 0) && (
                                      <div className="pl-6 pr-2 py-1 space-y-1 relative before:absolute before:left-4 before:top-0 before:bottom-0 before:w-px before:bg-slate-200 dark:before:bg-slate-700">
                                        {routePOPs.map(renderNode)}
                                        {routeCustomers.map(renderNode)}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Unmapped POPs */}
                          {unmappedPOPs.length > 0 && (
                            <div className="space-y-1 mb-5">
                              <div className="flex items-center justify-between pb-2 pt-2 mb-2 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-slate-900 sticky top-0 z-20 px-1">
                                <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Standalone POPs</h3>
                                <span className="px-2 py-0.5 bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 rounded-full text-[10px] font-bold">{unmappedPOPs.length}</span>
                              </div>
                              {unmappedPOPs.map(renderNode)}
                            </div>
                          )}

                          {/* Unmapped Customers */}
                          {unmappedCustomers.length > 0 && (
                            <div className="space-y-1 mb-5">
                              <div className="flex items-center justify-between pb-2 pt-2 mb-2 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-slate-900 sticky top-0 z-20 px-1">
                                <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Standalone Customers</h3>
                                <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-500 rounded-full text-[10px] font-bold">{unmappedCustomers.length}</span>
                              </div>
                              {unmappedCustomers.map(renderNode)}
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!isLoaded ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-teal-500"></div>
          </div>
        ) : (
          <>
            <GoogleMap
              key={isDarkMode ? 'dark' : 'light'}
              mapContainerStyle={containerStyle}
              center={center}
              zoom={12}
              onLoad={onLoad}
              onUnmount={onUnmount}
              options={{
                mapId: "e8aea2a23d836c7d4bd283d8",
                colorScheme: isDarkMode ? 'DARK' : 'LIGHT',
                styles: isDarkMode ? darkMapStyle : [],
                mapTypeId: mapTypeId,
                disableDefaultUI: true,
                zoomControl: false,
                mapTypeControl: false,
                fullscreenControl: false,
                streetViewControl: true,
                scaleControl: false,
                draggableCursor: addNodeMode ? "crosshair" : "grab",
              }}
              onClick={handleMapClick}
              onMouseMove={handleMouseMove}
              onMapTypeIdChanged={() => {
                if (map) {
                  const newType = map.getMapTypeId();
                  if (newType && newType !== mapTypeId) {
                    setMapTypeId(newType);
                  }
                }
              }}
            >
              {data?.routes?.features?.map((route: any) => {
                const routeId = Number(route.properties.id);
                const isEditing =
                  editingRouteId !== null &&
                  Number(editingRouteId) === routeId &&
                  editPolyRef.current !== null;
                
                // Natively toggle visibility instead of unmounting to prevent ghost lines in map
                const isImportVisible = visibleImportIds.has(Number(route.properties.import_id));
                const matchesSearch = !searchQuery || route.properties.name?.toLowerCase().includes(searchQuery.toLowerCase());
                const isVisible = isImportVisible && matchesSearch;

                const path = parseRoutePath(route.geometry.coordinates);

                if (route.geometry.type === "LineString") {
                  return (
                    <Polyline
                      key={`route-${route.properties.id}-v${routeVersion}-${route.properties.color}`}
                      path={path}
                      visible={isVisible && !isEditing}
                      onLoad={(poly) => {
                        polylineRefs.current[routeId] = poly;
                      }}
                      onUnmount={(poly) => {
                        if (polylineRefs.current[routeId] === poly)
                          delete polylineRefs.current[routeId];
                        poly.setMap(null);
                      }}
                      options={{
                        strokeColor: route.properties.color || "#ef4444",
                        strokeOpacity: 0.8,
                        strokeWeight: route.properties.thickness || 4,
                        clickable: true,
                        editable: false,
                        zIndex: 10,
                      }}
                      onClick={(e) => {
                        if (addNodeMode) {
                          handleMapClick(e);
                        } else {
                          const lat =
                            e && e.latLng && typeof e.latLng.lat === "function"
                              ? e.latLng.lat()
                              : null;
                          const lng =
                            e && e.latLng && typeof e.latLng.lng === "function"
                              ? e.latLng.lng()
                              : null;
                          const fallbackPos =
                            path && path.length > 0 ? path[0] : null;
                          const pos =
                            lat !== null && lng !== null
                              ? { lat, lng }
                              : fallbackPos;

                          if (pos) {
                            setSelectedFeature({
                              type: "Route",
                              properties: route.properties,
                              position: pos,
                              showInfoWindow:
                                (e?.domEvent as any)?.shiftKey ||
                                (e?.domEvent as any)?.altKey,
                            });
                            if (route.properties.kml_folder) {
                              setSidebarFolder(route.properties.kml_folder.split("/")[0]);
                            } else {
                              setSidebarFolder(null);
                            }
                            setIsSidebarOpen(true);
                            setShowCustomers(true);
                            setShowPOPs(true);
                          }
                        }
                      }}
                    />
                  );
                }
                if (route.geometry.type === "MultiLineString") {
                  return route.geometry.coordinates?.map(
                    (lineCoords: any, idx: number) => {
                      const linePath = parseRoutePath(lineCoords);
                      return (
                        <Polyline
                          key={`route-${route.properties.id}-multi-${idx}-${route.properties.color}`}
                          path={linePath}
                          visible={isVisible && !isEditing}
                          onLoad={(poly) => {
                            polylineRefs.current[routeId * 1000 + idx] = poly;
                          }}
                          onUnmount={(poly) => {
                            delete polylineRefs.current[routeId * 1000 + idx];
                            poly.setMap(null);
                          }}
                          options={{
                            strokeColor: route.properties.color || "#ef4444",
                            strokeOpacity: 0.8,
                            strokeWeight: route.properties.thickness || 4,
                            clickable: true,
                            editable: false,
                            zIndex: 10,
                          }}
                          onClick={(e) => {
                            if (addNodeMode) {
                              handleMapClick(e);
                            } else {
                              const lat =
                                e && e.latLng && typeof e.latLng.lat === "function"
                                  ? e.latLng.lat()
                                  : null;
                              const lng =
                                e && e.latLng && typeof e.latLng.lng === "function"
                                  ? e.latLng.lng()
                                  : null;
                              const fallbackPos =
                                linePath && linePath.length > 0 ? linePath[0] : null;
                              const pos =
                                lat !== null && lng !== null
                                  ? { lat, lng }
                                  : fallbackPos;

                              if (pos) {
                                setSelectedFeature({
                                  type: "Route",
                                  properties: route.properties,
                                  position: pos,
                                  showInfoWindow:
                                    (e?.domEvent as any)?.shiftKey ||
                                    (e?.domEvent as any)?.altKey,
                                });
                                if (route.properties.kml_folder) {
                                  setSidebarFolder(route.properties.kml_folder.split("/")[0]);
                                } else {
                                  setSidebarFolder(null);
                                }
                                setIsSidebarOpen(true);
                                setShowCustomers(true);
                                setShowPOPs(true);
                              }
                            }
                          }}
                        />
                      );
                    },
                  );
                }
                return null;
              })}

              {/* Draw Nodes — uses pre-filtered array for high performance */}
              {filteredNodes?.map((node: any) => {
                const pos = {
                  lat: node.geometry.coordinates[1],
                  lng: node.geometry.coordinates[0],
                };

                // Fallback: if type is missing, infer from name
                const resolvedType =
                  node.properties.type ||
                  (() => {
                    const nl = (node.properties.name || "").toLowerCase();
                    return nl.includes("pop") ||
                      nl.includes("bstn") ||
                      nl.includes("hub") ||
                      nl.includes("exchange") ||
                      nl.includes("plaza") ||
                      nl.includes("tower") ||
                      nl.includes("colo") ||
                      nl.includes("viom")
                      ? "POP"
                      : "Customer";
                  })();

                const isPOP = resolvedType === "POP";
                if ((!showPOPs && isPOP) || (!showCustomers && !isPOP))
                  return null;

                const resolvedIcon = getIcon(
                  isPOP ? "POP" : "Customer",
                  node.properties.icon,
                );

                return (
                  <Marker
                    key={`node-${node.properties.id}`}
                    position={pos}
                    icon={resolvedIcon || undefined}
                    onUnmount={(marker) => marker.setMap(null)}
                    title={node.properties.name}
                    visible={true}
                    label={
                      showLabels
                        ? {
                            text: node.properties.name || "",
                            color: "#1e293b",
                            fontSize: "11px",
                            fontWeight: "700",
                            fontFamily: "Inter, sans-serif",
                            className: "map-marker-label",
                          }
                        : undefined
                    }
                    onClick={(e) => {
                      setSelectedFeature({
                        type: getNodeType(node),
                        properties: node.properties,
                        position: pos,
                        showInfoWindow: true,
                      });
                      if (node.properties.kml_folder) {
                        setSidebarFolder(node.properties.kml_folder.split("/")[0]);
                      } else {
                        setSidebarFolder(null);
                      }
                    }}
                  />
                );
              })}

              {/* InfoWindow */}
              {selectedFeature &&
                selectedFeature.position &&
                selectedFeature.showInfoWindow && (
                  <InfoWindow
                    position={selectedFeature.position}
                    onCloseClick={() => setSelectedFeature(null)}
                  >
                    <div
                      style={{
                        background: "#ffffff",
                        borderRadius: "14px",
                        minWidth: "260px",
                        maxWidth: "320px",
                        boxShadow:
                          "0 10px 40px -10px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.06)",
                        fontFamily: "'DM Sans', Inter, system-ui, sans-serif",
                        overflow: "hidden",
                      }}
                    >
                      {/* Header */}
                      <div
                        style={{
                          background:
                            selectedFeature.type === "POP"
                              ? "linear-gradient(135deg, #0d9488, #0f766e)"
                              : selectedFeature.type === "Customer"
                                ? "linear-gradient(135deg, #d97706, #b45309)"
                                : "linear-gradient(135deg, #6366f1, #4f46e5)",
                          padding: "14px 16px",
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <div
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "8px",
                            background: "rgba(255,255,255,0.2)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "16px",
                            flexShrink: 0,
                          }}
                        >
                          {selectedFeature.type === "POP"
                            ? "🏢"
                            : selectedFeature.type === "Customer"
                              ? "👤"
                              : "🔗"}
                        </div>
                        <div style={{ overflow: "hidden", flex: 1 }}>
                          <div
                            style={{
                              color: "#fff",
                              fontWeight: 700,
                              fontSize: "14px",
                              lineHeight: 1.3,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {selectedFeature.properties.name ||
                              "Unnamed Feature"}
                          </div>
                          <div
                            style={{
                              color: "rgba(255,255,255,0.8)",
                              fontSize: "11px",
                              fontWeight: 500,
                              marginTop: "2px",
                            }}
                          >
                            {selectedFeature.type}
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedFeature(null)}
                          style={{
                            width: "26px",
                            height: "26px",
                            borderRadius: "6px",
                            background: "rgba(255,255,255,0.15)",
                            border: "none",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            flexShrink: 0,
                            color: "#fff",
                            fontSize: "16px",
                            lineHeight: 1,
                            transition: "background 0.2s",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background =
                              "rgba(255,255,255,0.3)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background =
                              "rgba(255,255,255,0.15)")
                          }
                        >
                          ✕
                        </button>
                      </div>

                      {/* Data Grid */}
                      <div style={{ padding: "12px 16px" }}>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "auto 1fr",
                            gap: "6px 12px",
                            fontSize: "12px",
                          }}
                        >
                          <span style={{ color: "#6b7280", fontWeight: 600 }}>
                            Import ID
                          </span>
                          <span style={{ color: "#111827", fontWeight: 500 }}>
                            {selectedFeature.properties.import_id ?? "—"}
                          </span>
                          {(selectedFeature.type === "POP" ||
                            selectedFeature.type === "Customer") &&
                            selectedFeature.position && (
                              <>
                                <span
                                  style={{ color: "#6b7280", fontWeight: 600 }}
                                >
                                  Latitude
                                </span>
                                <span
                                  style={{
                                    color: "#111827",
                                    fontWeight: 500,
                                    fontFamily: "'JetBrains Mono', monospace",
                                  }}
                                >
                                  {selectedFeature.position.lat?.toFixed(6)}
                                </span>
                                <span
                                  style={{ color: "#6b7280", fontWeight: 600 }}
                                >
                                  Longitude
                                </span>
                                <span
                                  style={{
                                    color: "#111827",
                                    fontWeight: 500,
                                    fontFamily: "'JetBrains Mono', monospace",
                                  }}
                                >
                                  {selectedFeature.position.lng?.toFixed(6)}
                                </span>
                              </>
                            )}
                          {Object.entries(selectedFeature.properties)
                            .filter(([key]) => {
                              const k = key.toLowerCase();
                              return (
                                ![
                                  "id",
                                  "import_id",
                                  "import id",
                                  "name",
                                  "type",
                                  "color",
                                  "thickness",
                                  "manual",
                                  "created_at",
                                ].includes(k) &&
                                !k.includes("style") &&
                                !k.includes("hash") &&
                                !k.includes("kml") &&
                                !k.includes("icon")
                              );
                            })
                            .slice(0, 10)
                            .map(([key, val]) => (
                              <>
                                <span
                                  key={`k-${key}`}
                                  style={{
                                    color: "#6b7280",
                                    fontWeight: 600,
                                    textTransform: "capitalize",
                                  }}
                                >
                                  {key.replace(/_/g, " ")}
                                </span>
                                <span
                                  key={`v-${key}`}
                                  style={{
                                    color: "#111827",
                                    fontWeight: 500,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {String(val)}
                                </span>
                              </>
                            ))}
                        </div>
                      </div>

                      {/* Actions & Editors */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "10px",
                          padding: "10px 16px 14px",
                          borderTop: "1px solid #f3f4f6",
                        }}
                      >
                        {selectedFeature.type === "Route" && (
                          <div className="flex items-center gap-2">
                            <label className="text-xs font-bold text-gray-500">
                              Color:
                            </label>
                            <input
                              type="color"
                              value={editColor}
                              onChange={(e) => setEditColor(e.target.value)}
                              className="w-6 h-6 p-0 border-0 rounded cursor-pointer"
                            />
                            <button
                              onClick={saveProperties}
                              className="px-2 py-1 bg-teal-50 hover:bg-teal-100 text-teal-600 rounded text-xs font-bold ml-auto transition-colors"
                            >
                              Save Color
                            </button>
                          </div>
                        )}


                        <div style={{ display: "flex", gap: "8px" }}>
                          {selectedFeature.type === "Route" && (
                            <button
                              onClick={() => {
                                startEditingRoute(
                                  selectedFeature.properties.id,
                                );
                                setSelectedFeature(null);
                              }}
                              style={{
                                flex: 1,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "5px",
                                padding: "7px 0",
                                background: "#eef2ff",
                                color: "#4f46e5",
                                border: "none",
                                borderRadius: "8px",
                                fontSize: "11px",
                                fontWeight: 700,
                                cursor: "pointer",
                              }}
                            >
                              <Edit2 className="w-3 h-3" /> Edit Path
                            </button>
                          )}
                          <button
                            onClick={handleDeleteFeature}
                            style={{
                              flex: 1,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "5px",
                              padding: "7px 0",
                              background: "#fef2f2",
                              color: "#dc2626",
                              border: "none",
                              borderRadius: "8px",
                              fontSize: "11px",
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            <Trash2 className="w-3 h-3" /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </InfoWindow>
                )}

              {/* Add Node Modal via Map Coordinates */}
              {showAddModal && tempNodePos && (
                <InfoWindow
                  position={tempNodePos}
                  onCloseClick={() => {
                    setShowAddModal(false);
                    setTempNodePos(null);
                  }}
                >
                  <div className="p-4 w-72 bg-white/95 backdrop-blur-xl border border-gray-200/50 shadow-2xl rounded-xl -m-2">
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
                      {newNodeData.type === "POP" ? (
                        <Building2 className="w-5 h-5 text-teal-600" />
                      ) : (
                        <User className="w-5 h-5 text-amber-500" />
                      )}
                      <h3 className="font-bold text-gray-900 tracking-tight">
                        Add New {newNodeData.type}
                      </h3>
                    </div>
                    {linkedRoute && (
                      <div className="flex items-center gap-2 mb-3 px-2.5 py-2 bg-indigo-50 border border-indigo-200/60 rounded-lg">
                        <Link className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider shrink-0">Linked Route:</span>
                        <span className="text-xs font-semibold text-indigo-900 truncate">{linkedRoute.name}</span>
                      </div>
                    )}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                          Name
                        </label>
                        <input
                          type="text"
                          value={newNodeData.name}
                          onChange={(e) =>
                            setNewNodeData({
                              ...newNodeData,
                              name: e.target.value,
                            })
                          }
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all"
                          placeholder={
                            newNodeData.type === "POP"
                              ? "e.g., POP-Ahmedabad-01"
                              : "e.g., Reliance-Corp-Link"
                          }
                          autoFocus
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                          Description{" "}
                          <span className="text-gray-400 font-normal lowercase">
                            (Optional)
                          </span>
                        </label>
                        <textarea
                          value={newNodeData.description}
                          onChange={(e) =>
                            setNewNodeData({
                              ...newNodeData,
                              description: e.target.value,
                            })
                          }
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all resize-none h-16"
                          placeholder={`Details about this ${newNodeData.type}...`}
                        />
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={submitNewNode}
                          className={`flex-1 text-white py-2 rounded-lg text-xs font-bold transition-all shadow-sm active:translate-y-0.5 ${newNodeData.type === "POP" ? "bg-gradient-to-b from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500" : "bg-gradient-to-b from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500"}`}
                        >
                          Save {newNodeData.type}
                        </button>
                        <button
                          onClick={() => {
                            setShowAddModal(false);
                            setTempNodePos(null);
                          }}
                          className="px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg text-xs font-bold transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </InfoWindow>
              )}

              {/* RENDER ACTIVE DRAWING PATH */}
              {isDrawingRoute && drawPath.length > 0 && (
                <Polyline
                  path={drawPath}
                  options={{
                    strokeColor: newRouteData.color,
                    strokeOpacity: 0.8,
                    strokeWeight: newRouteData.thickness,
                    clickable: false,
                    zIndex: 999,
                  }}
                />
              )}

              {/* RENDER DYNAMIC RUBBERBAND LINE */}
              {isDrawingRoute && drawPath.length > 0 && mousePos && (
                <Polyline
                  path={[drawPath[drawPath.length - 1], mousePos]}
                  options={{
                    strokeColor: newRouteData.color,
                    strokeOpacity: 0,
                    strokeWeight: newRouteData.thickness,
                    clickable: false,
                    icons: [
                      {
                        icon: {
                          path: "M 0,-1 0,1",
                          strokeOpacity: 0.6,
                          strokeColor: newRouteData.color,
                          scale: 2,
                        },
                        offset: "0",
                        repeat: "12px",
                      },
                    ],
                    zIndex: 998,
                  }}
                />
              )}
            </GoogleMap>
            <LiveCoordinates
              map={map}
              positionClass="absolute left-4 bottom-4"
            />
            {map && (
              <>
                <MapToolbar
                  map={map}
                  layersState={layersState}
                  onLayerToggle={handleLayerToggle}
                  onColorModeToggle={handleColorModeToggle}
                  hideNetworkCatalog={true}
                  hideStaffSurveys={true}
                  hideGeometrySuite={true}
                  hideTip={true}
                  extraTools={
                    <>
                      {/* Labels Toggle */}
                      <div className="flex items-center p-0.5 bg-slate-100/80 dark:bg-slate-800/60 rounded-xl border border-slate-200/50 dark:border-white/10 shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]">
                        <button
                          onClick={() => setShowLabels(!showLabels)}
                          className={`group relative h-8 px-2 rounded-lg flex justify-center items-center gap-1 transition-all duration-300 z-10 ${showLabels ? "bg-teal-600 text-white shadow-md shadow-teal-600/30" : "text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-700/50"}`}
                          title={showLabels ? "Hide Labels" : "Show Labels"}
                        >
                          <span className={`transition-transform duration-300 ${showLabels ? "scale-110" : "group-hover:scale-110 group-hover:-translate-y-0.5"} inline-block`}>
                            {showLabels ? <Eye size={16} strokeWidth={2.5} /> : <EyeOff size={16} strokeWidth={2} />}
                          </span>
                        </button>
                      </div>

                      {/* Topology Layers Toggle & Flyout */}
                      <div className="relative flex items-center p-0.5 bg-slate-100/80 dark:bg-slate-800/60 rounded-xl border border-slate-200/50 dark:border-white/10 shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]">
                        <button
                          onClick={() => setShowTopology(!showTopology)}
                          className={`group relative h-8 px-2 rounded-lg flex justify-center items-center gap-1 transition-all duration-300 z-10 ${showTopology ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" : "text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100/50 dark:hover:bg-indigo-900/30"}`}
                          title="Topology Layers"
                        >
                          <span className={`transition-transform duration-300 ${showTopology ? "scale-110" : "group-hover:scale-110 group-hover:-translate-y-0.5"} inline-block`}>
                            <Layers size={16} strokeWidth={showTopology ? 2.5 : 2} />
                          </span>
                        </button>
                        
                        <AnimatePresence>
                          {showTopology && imports.length > 0 && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: -10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -10 }}
                              className="absolute top-[calc(100%+12px)] -left-16 z-[61] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] rounded-2xl w-64 overflow-hidden"
                            >
                              <div className="flex flex-col max-h-[300px]">
                                <div className="p-3 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5">
                                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                    Active Imports
                                  </h3>
                                </div>
                                <div className="p-2 overflow-y-auto custom-scrollbar flex flex-col gap-1">
                                  {imports.map((imp) => {
                                    const isVisible = visibleImportIds.has(imp.id);
                                    return (
                                      <button
                                        key={imp.id}
                                        onClick={() => toggleImportVisibility(imp.id)}
                                        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${isVisible ? "bg-teal-50 border-teal-200 text-teal-700 dark:bg-teal-500/10 dark:border-teal-500/30 dark:text-teal-400" : "bg-transparent border-transparent text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-slate-400"}`}
                                      >
                                        {isVisible ? <Eye className="w-3.5 h-3.5 flex-shrink-0" /> : <EyeOff className="w-3.5 h-3.5 flex-shrink-0" />}
                                        <span className="truncate flex-1 text-left">{imp.filename}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Import Button */}
                      <div className="flex items-center p-0.5 bg-slate-100/80 dark:bg-slate-800/60 rounded-xl border border-slate-200/50 dark:border-white/10 shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]">
                        <label
                          className={`group relative h-8 px-2 rounded-lg flex justify-center items-center gap-1 transition-all duration-300 z-10 cursor-pointer ${uploading ? "bg-teal-600 text-white shadow-md shadow-teal-600/30" : "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100/50 dark:hover:bg-emerald-900/30"}`}
                          title="Import KML/KMZ"
                        >
                          {uploading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                          ) : (
                            <span className="transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-0.5 inline-block">
                              <Upload size={16} strokeWidth={2} />
                            </span>
                          )}
                          <input type="file" className="hidden" accept=".kmz,.kml" onChange={handleFileUpload} disabled={uploading} />
                        </label>
                      </div>
                    </>
                  }
                />
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[45] pointer-events-none transition-opacity duration-500 opacity-80">
                  <div className="bg-slate-900/70 dark:bg-black/70 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 shadow-xl text-white/90 text-[11px] font-medium tracking-wide flex items-center gap-2">
                    <span className="text-[13px]">💡</span>
                    <span>
                      Tip: Hold <strong className="text-blue-300">Shift</strong>{" "}
                      or <strong className="text-blue-300">Alt</strong> + Click
                      on map for Address | Hold <strong className="text-teal-300">Shift</strong> + Click on Route for InfoWindow
                    </span>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
      />

      {/* DRAWING TOOLBAR */}
      <AnimatePresence>
        {isDrawingRoute && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 p-1.5 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border border-gray-200/50 dark:border-white/10 rounded-full shadow-xl"
          >
            <div className="px-3 py-1 flex items-center gap-2 border-r border-gray-200 dark:border-white/10">
              <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Drawing Mode
              </span>
            </div>

            <button
              onClick={() => {
                setDrawPath((prev) => {
                  const next = prev.slice(0, -1);
                  if (next.length === 0) setMousePos(null);
                  return next;
                });
              }}
              disabled={drawPath.length === 0}
              className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full text-gray-600 dark:text-gray-300 transition-colors disabled:opacity-30"
              title="Undo last point"
            >
              <Undo className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setIsDrawingRoute(false);
                setDrawPath([]);
                setMousePos(null);
              }}
              className="p-2 hover:bg-red-50 text-red-500 rounded-full transition-colors"
              title="Cancel Drawing"
            >
              <X className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowRouteSaveModal(true)}
              disabled={drawPath.length < 2}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-b from-teal-500 to-teal-600 text-white rounded-full text-xs font-bold shadow-sm disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" /> Finish Route
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SAVE ROUTE MODAL */}
      <AnimatePresence>
        {showRouteSaveModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-white/10"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Save New Route
                  </h3>
                  <button
                    onClick={() => setShowRouteSaveModal(false)}
                    className="p-1.5 text-gray-500 hover:text-white dark:text-gray-400 hover:bg-red-500 rounded-lg transition-all duration-300 group shadow-sm"
                  >
                    <X className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90 group-hover:scale-110" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">
                      Route Name
                    </label>
                    <input
                      type="text"
                      value={newRouteData.name}
                      onChange={(e) =>
                        setNewRouteData({
                          ...newRouteData,
                          name: e.target.value,
                        })
                      }
                      placeholder="e.g. Main Ring A"
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">
                        Stroke Color
                      </label>
                      <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl">
                        <input
                          type="color"
                          value={newRouteData.color}
                          onChange={(e) =>
                            setNewRouteData({
                              ...newRouteData,
                              color: e.target.value,
                            })
                          }
                          className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-none"
                        />
                        <span className="text-xs font-mono text-gray-500 uppercase">
                          {newRouteData.color}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">
                        Thickness ({newRouteData.thickness}px)
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={newRouteData.thickness}
                        onChange={(e) =>
                          setNewRouteData({
                            ...newRouteData,
                            thickness: parseInt(e.target.value),
                          })
                        }
                        className="w-full h-10 accent-teal-500"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={submitNewRoute}
                  className="w-full mt-8 py-3 bg-gradient-to-b from-teal-500 to-teal-600 text-white font-bold rounded-xl shadow-lg shadow-teal-500/20 active:scale-[0.98] transition-all"
                >
                  Create Route
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* --- SIDEBAR COMPONENTS --- */

const DataCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  color: "teal" | "amber" | "indigo";
  onClick: () => void;
}> = ({ icon, title, subtitle, color, onClick }) => {
  const colors = {
    teal: "hover:bg-teal-50 dark:hover:bg-teal-500/10 border-teal-500/10 hover:border-teal-500/30",
    amber:
      "hover:bg-amber-50 dark:hover:bg-amber-500/10 border-amber-500/10 hover:border-amber-500/30",
    indigo:
      "hover:bg-indigo-50 dark:hover:bg-indigo-500/10 border-indigo-500/10 hover:border-indigo-500/30",
  };

  const iconColors = {
    teal: "bg-teal-50 dark:bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-200/60 dark:border-teal-500/20",
    amber:
      "bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-200/60 dark:border-amber-500/20",
    indigo:
      "bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-200/60 dark:border-indigo-500/20",
  };

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2.5 p-1.5 rounded-lg bg-white/5 dark:bg-white/5 border border-transparent hover:border-teal-500/10 hover:bg-white/10 cursor-pointer transition-all group ${colors[color]}`}
    >
      <div
        className={`p-2 rounded-md border shadow-sm transition-colors ${iconColors[color]}`}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 dark:text-white truncate group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors tracking-tight">
          {title}
        </p>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">
          {subtitle}
        </p>
      </div>
      <ChevronRight className="w-3 h-3 text-gray-300 opacity-0 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0" />
    </div>
  );
};

export default DarkFiberPage;
