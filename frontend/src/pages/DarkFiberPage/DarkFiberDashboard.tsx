import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Building2,
  User,
  Cable,
  Search,
  Filter,
  Trash2,
  Map as MapIcon,
  ChevronRight,
  Clock,
  Download,
  Info,
  RefreshCw,
  X,
  Plus,
  Network,
} from "lucide-react";
import {
  darkFiberApiService,
  DarkFiberNodeFeature,
  DarkFiberRouteFeature,
  DarkFiberImport,
} from "../../services/darkFiberApiService";
import { exportDarkFiberKMZ, exportDarkFiberCSV } from "../../utils/export/exporters/darkFiberExporter";
import { toast } from "react-toastify";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import {
  getFolderIconKey,
  ICON_DEFS,
} from "../../features/network-planning/components/NetworkMap/MapIcons";

interface DarkFiberDashboardProps {
  onViewOnMap?: (feature: any) => void;
  onSwitchToMap?: () => void;
  selectedFolderId?: number;
}

type DashboardTab = "pops" | "customers" | "routes";

const DarkFiberDashboard: React.FC<DarkFiberDashboardProps> = ({
  onViewOnMap,
  onSwitchToMap,
  selectedFolderId,
}) => {
  const [data, setData] = useState<{
    nodes: DarkFiberNodeFeature[];
    routes: DarkFiberRouteFeature[];
  } | null>(null);
  const [imports, setImports] = useState<DarkFiberImport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<
    DarkFiberNodeFeature | DarkFiberRouteFeature | null
  >(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [viewTab, setViewTab] = useState<DashboardTab>("pops");
  const [showTopology, setShowTopology] = useState(false);

  const searchInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchExpanded]);

  // Dialog State
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [dataRes, importsRes] = await Promise.all([
        darkFiberApiService.getDarkFiberData(selectedFolderId),
        darkFiberApiService.getImports(selectedFolderId),
      ]);
      setData({
        nodes: dataRes.data.nodes.features,
        routes: dataRes.data.routes.features,
      });
      setImports(importsRes.data);
    } catch (err) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [selectedFolderId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const showConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
  ) => {
    setConfirmConfig({ isOpen: true, title, message, onConfirm });
  };

  const handleDeleteImport = (id: number) => {
    showConfirm(
      "Move to Recycle Bin",
      "Are you sure you want to move this import to the Recycle Bin? You can restore it later if needed.",
      async () => {
        try {
          await darkFiberApiService.deleteImport(id);
          toast.success("Import batch moved to Recycle Bin");
          fetchData();
        } catch (err) {
          toast.error("Failed to delete import");
        }
      },
    );
  };

  const handleDeleteNode = (
    e: React.MouseEvent,
    node: DarkFiberNodeFeature,
  ) => {
    e.stopPropagation();
    showConfirm(
      `Delete ${node.properties.type}`,
      `Are you sure you want to delete ${node.properties.name}? This cannot be undone.`,
      async () => {
        try {
          await darkFiberApiService.deleteNode(node.properties.id);
          toast.success("Node deleted successfully");
          fetchData();
        } catch (err) {
          toast.error("Failed to delete node");
        }
      },
    );
  };

  const handleDeleteRoute = (
    e: React.MouseEvent,
    route: DarkFiberRouteFeature,
  ) => {
    e.stopPropagation();
    showConfirm(
      "Delete Fiber Route",
      `Are you sure you want to delete ${route.properties.name || "this route"}?`,
      async () => {
        try {
          await darkFiberApiService.deleteRoute(route.properties.id);
          toast.success("Fiber route deleted successfully");
          fetchData();
        } catch (err) {
          toast.error("Failed to delete route");
        }
      },
    );
  };

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (selectedFolderId === undefined) {
      toast.warning(
        "Please select an India Region from the sidebar before importing.",
      );
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    try {
      setLoading(true);
      toast.info(`Importing ${file.name}...`);
      await darkFiberApiService.importFile(file, selectedFolderId);
      toast.success("Infrastructure batch imported successfully");
      fetchData();
      onSwitchToMap?.();
    } catch (err) {
      toast.error("Failed to import infrastructure");
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleExportKMZ = async () => {
    if (!data || (data.nodes.length === 0 && data.routes.length === 0)) {
      toast.warning("No data available to export");
      return;
    }
    toast.info("Preparing KMZ export...");
    try {
      await exportDarkFiberKMZ(data.nodes, data.routes);
      toast.success("KMZ exported successfully");
    } catch (err) {
      toast.error("Failed to export KMZ");
    }
  };

  const handleExportCSV = () => {
    if (!data || (data.nodes.length === 0 && data.routes.length === 0)) {
      toast.warning("No data available to export");
      return;
    }
    toast.info("Preparing CSV export...");
    try {
      exportDarkFiberCSV(data.nodes, data.routes);
      toast.success("CSV exported successfully");
    } catch (err) {
      toast.error("Failed to export CSV");
    }
  };

  const isPopNode = useCallback((n: any) => {
    if (n.properties.type === "POP") return true;
    const key = getFolderIconKey({
      name: n.properties.name || "",
      type: n.properties.type || "",
    });
    return (
      key === "POP" ||
      key === "DATACENTER" ||
      key === "NODE" ||
      key === "NNI" ||
      key === "SUB-POP"
    );
  }, []);

  const isCustomerNode = useCallback((n: any) => {
    if (n.properties.type === "Customer") return true;
    const key = getFolderIconKey({
      name: n.properties.name || "",
      type: n.properties.type || "",
    });
    return (
      key === "CUSTOMER" ||
      key === "VODAFONE" ||
      key === "AIRTEL" ||
      key === "JIO" ||
      key === "TATA" ||
      key === "BSNL" ||
      key === "OFFICE-LOCATIONS"
    );
  }, []);

  const filteredPops = useMemo(() => {
    if (!data) return [];
    return data.nodes.filter(
      (n) =>
        isPopNode(n) &&
        n.properties.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [data, searchQuery, isPopNode]);

  const filteredCustomers = useMemo(() => {
    if (!data) return [];
    return data.nodes.filter(
      (n) =>
        isCustomerNode(n) &&
        n.properties.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [data, searchQuery, isCustomerNode]);

  const filteredRoutes = useMemo(() => {
    if (!data) return [];
    return data.routes.filter((route) =>
      route.properties.name?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [data, searchQuery]);

  const stats = useMemo(() => {
    if (!data) return { pops: 0, customers: 0, routes: 0 };
    return {
      pops: data.nodes.filter((n) => isPopNode(n)).length,
      customers: data.nodes.filter((n) => isCustomerNode(n)).length,
      routes: data.routes.length,
    };
  }, [data, isPopNode, isCustomerNode]);

  if (loading && !data) {
    return (
      <div className="h-full flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-teal-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gray-50 dark:bg-[#0a0a0a] flex flex-col relative overflow-hidden font-sans">
      <div className="h-full overflow-y-auto lg:overflow-hidden custom-scrollbar flex flex-col bg-gray-50 dark:bg-gray-900/50 px-3 sm:px-4 lg:px-6 py-2 lg:py-3 gap-2 lg:gap-3">
        <div className="max-w-[1600px] mx-auto w-full flex flex-col gap-2 lg:gap-3 h-full min-h-0">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 lg:gap-4 flex-shrink-0">
            <StatCard
              icon={<Building2 className="w-6 h-6" />}
              label="Total POPs"
              value={stats.pops}
              color="teal"
            />
            <StatCard
              icon={<User className="w-6 h-6" />}
              label="Total Customers"
              value={stats.customers}
              color="amber"
            />
            <StatCard
              icon={<Cable className="w-6 h-6" />}
              label="Fiber Routes"
              value={stats.routes}
              color="indigo"
            />
          </div>

          <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-4 min-h-0">
            {/* Main Data Table Area */}
            <div className="lg:col-span-2 flex flex-col min-h-[400px] lg:min-h-0">
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col h-full overflow-hidden">
                {/* Table Header / Tabs */}
                <div className="p-3 border-b border-gray-100 dark:border-gray-700 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-2 flex-shrink-0">
                  <div className="inline-flex flex-wrap sm:flex-nowrap bg-gray-100 dark:bg-gray-900 p-0.5 rounded-lg gap-0.5">
                    <button
                      onClick={() => setViewTab("pops")}
                      className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all flex items-center gap-1 whitespace-nowrap ${viewTab === "pops" ? "bg-white dark:bg-gray-800 text-red-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                    >
                      <Building2
                        className={`w-3.5 h-3.5 ${viewTab === "pops" ? "text-red-500" : "text-gray-400"}`}
                      />
                      POPs ({stats.pops})
                    </button>
                    <button
                      onClick={() => setViewTab("customers")}
                      className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all flex items-center gap-1 whitespace-nowrap ${viewTab === "customers" ? "bg-white dark:bg-gray-800 text-purple-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                    >
                      <User
                        className={`w-3.5 h-3.5 ${viewTab === "customers" ? "text-purple-500" : "text-gray-400"}`}
                      />
                      Customers ({stats.customers})
                    </button>
                    <button
                      onClick={() => setViewTab("routes")}
                      className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all flex items-center gap-1 whitespace-nowrap ${viewTab === "routes" ? "bg-white dark:bg-gray-800 text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                    >
                      <Cable
                        className={`w-3.5 h-3.5 ${viewTab === "routes" ? "text-indigo-500" : "text-gray-400"}`}
                      />
                      Routes ({stats.routes})
                    </button>
                  </div>

                  <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 w-full lg:w-auto flex-nowrap">
                    {isSearchExpanded || searchQuery ? (
                      <div className="relative w-full md:w-52 lg:w-60 flex-shrink-0 transition-all duration-300 ease-in-out">
                        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          ref={searchInputRef}
                          type="text"
                          placeholder={`Search ${viewTab}...`}
                          className="pl-8 pr-7 h-8 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg w-full focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none text-gray-900 dark:text-white"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onBlur={() => {
                            if (!searchQuery) {
                              setIsSearchExpanded(false);
                            }
                          }}
                        />
                        <button
                          onClick={() => {
                            setSearchQuery("");
                            setIsSearchExpanded(false);
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setIsSearchExpanded(true)}
                        className="w-8 h-8 flex items-center justify-center bg-gray-50 border border-gray-200 dark:bg-gray-900 dark:border-gray-700 text-gray-500 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 dark:hover:text-teal-400 rounded-lg transition-all shadow-[0_2px_0_0_rgba(0,0,0,0.02)] active:translate-y-0.5 flex-shrink-0"
                        title="Search"
                      >
                        <Search className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImportFile}
                      accept=".kml,.kmz"
                      className="hidden"
                    />

                    <div className="flex items-center gap-2 w-full lg:w-auto">
                      <button
                        onClick={() => onSwitchToMap?.()}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 px-3 h-8 bg-gradient-to-b from-teal-500 to-teal-600 text-white rounded-lg text-[11px] font-bold shadow-[0_3px_0_0_rgba(13,148,136,0.3)] hover:shadow-[0_4px_0_0_rgba(13,148,136,0.3)] transition-all hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none whitespace-nowrap border-b border-teal-700/20"
                      >
                        <MapIcon className="w-3.5 h-3.5 text-white" />
                        MAP EXPLORER
                      </button>
                    </div>

                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 h-8 bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-lg text-[11px] font-bold shadow-[0_3px_0_0_rgba(0,0,0,0.08)] hover:shadow-[0_4px_0_0_rgba(0,0,0,0.08)] transition-all hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none whitespace-nowrap"
                    >
                      <Plus className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                      IMPORT
                    </button>
                    
                    <button
                      onClick={handleExportKMZ}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 h-8 bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-lg text-[11px] font-bold shadow-[0_3px_0_0_rgba(0,0,0,0.08)] hover:shadow-[0_4px_0_0_rgba(0,0,0,0.08)] transition-all hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none whitespace-nowrap"
                      title="Export KMZ"
                    >
                      <Download className="w-3.5 h-3.5 text-indigo-500" />
                      KMZ
                    </button>

                    <button
                      onClick={handleExportCSV}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 h-8 bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-lg text-[11px] font-bold shadow-[0_3px_0_0_rgba(0,0,0,0.08)] hover:shadow-[0_4px_0_0_rgba(0,0,0,0.08)] transition-all hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none whitespace-nowrap"
                      title="Export CSV"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-500" />
                      CSV
                    </button>
                  </div>
                </div>

                {/* Scrollable Table Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead className="bg-gray-100 dark:bg-gray-900 sticky top-0 z-20 border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="px-4 py-2 font-bold text-gray-600 dark:text-gray-400">
                          Name
                        </th>
                        <th className="px-4 py-2 font-bold text-gray-600 dark:text-gray-400">
                          Type/Info
                        </th>
                        <th className="px-4 py-2 font-bold text-gray-600 dark:text-gray-400 text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {viewTab === "pops" &&
                        filteredPops?.map((node) => (
                          <NodeRow
                            key={node.properties.id}
                            node={node}
                            isPOP
                            onSelect={() => setSelectedItem(node)}
                            onViewOnMap={() => onViewOnMap?.(node)}
                            onDelete={(e) => handleDeleteNode(e, node)}
                          />
                        ))}
                      {viewTab === "customers" &&
                        filteredCustomers?.map((node) => (
                          <NodeRow
                            key={node.properties.id}
                            node={node}
                            isPOP={false}
                            onSelect={() => setSelectedItem(node)}
                            onViewOnMap={() => onViewOnMap?.(node)}
                            onDelete={(e) => handleDeleteNode(e, node)}
                          />
                        ))}
                      {viewTab === "routes" &&
                        filteredRoutes?.map((route) => (
                          <RouteRow
                            key={route.properties.id}
                            route={route}
                            onSelect={() => setSelectedItem(route)}
                            onViewOnMap={() => onViewOnMap?.(route)}
                            onDelete={(e) => handleDeleteRoute(e, route)}
                          />
                        ))}
                      {(viewTab === "pops" &&
                        (!filteredPops || filteredPops.length === 0)) ||
                      (viewTab === "customers" &&
                        (!filteredCustomers ||
                          filteredCustomers.length === 0)) ||
                      (viewTab === "routes" &&
                        (!filteredRoutes || filteredRoutes.length === 0)) ? (
                        <EmptyState colSpan={3} />
                      ) : null}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Sidebar Space: Activity History */}
            <div className="lg:col-span-1 flex flex-col min-h-[300px] lg:min-h-0">
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col h-full overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <Clock className="w-5 h-5 text-indigo-500" />
                    Activity History
                  </h2>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                  {imports && imports.length > 0 ? (
                    imports.map((imp) => (
                      <div
                        key={imp.id}
                        className="relative p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700/60 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex items-start justify-between gap-4 transition-all hover:shadow-[0_4px_12px_-4px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 group"
                      >
                        <div className="flex-1 min-w-0 pr-8">
                            <p
                              className="font-bold text-sm text-gray-900 dark:text-white truncate"
                              title={imp.filename}
                            >
                              {imp.filename}
                            </p>
                            <p className="text-[10px] text-gray-500 flex items-center gap-1 mt-1 font-medium">
                              <User className="w-3 h-3" /> {imp.imported_by} •{" "}
                              {(() => {
                                const d = new Date(imp.imported_at);
                                const dd = String(d.getDate()).padStart(2, "0");
                                const mm = String(d.getMonth() + 1).padStart(2, "0");
                                const yyyy = d.getFullYear();
                                let hh = d.getHours();
                                const ampm = hh >= 12 ? 'PM' : 'AM';
                                hh = hh % 12;
                                hh = hh ? hh : 12; 
                                const min = String(d.getMinutes()).padStart(2, "0");
                                return `${dd}/${mm}/${yyyy} ${hh}:${min} ${ampm}`;
                              })()}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeleteImport(imp.id)}
                            className="p-1.5 text-red-500 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg shadow-[0_2px_0_0_rgba(239,68,68,0.1)] hover:shadow-[0_3px_0_0_rgba(239,68,68,0.15)] transition-all hover:-translate-y-0.5 active:translate-y-0 absolute right-4 top-4"
                            title="Delete Import"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      
                    ))
                  ) : (
                    <div className="text-center py-10 opacity-40 italic text-sm">
                      No recent activity.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Details Drawer */}
          {selectedItem && (
            <DetailsDrawer
              item={selectedItem}
              onClose={() => setSelectedItem(null)}
              onViewOnMap={onViewOnMap}
              allNodes={data?.nodes}
            />
          )}

          {/* Confirmation Dialog */}
          <ConfirmDialog
            isOpen={confirmConfig.isOpen}
            title={confirmConfig.title}
            message={confirmConfig.message}
            onConfirm={confirmConfig.onConfirm}
            onClose={() =>
              setConfirmConfig({ ...confirmConfig, isOpen: false })
            }
            type="danger"
            confirmText="Delete Permanently"
          />
        </div>
      </div>
    </div>
  );
};

/* --- SUB-COMPONENTS --- */

const NodeRow: React.FC<{
  node: any;
  isPOP: boolean;
  onSelect: () => void;
  onViewOnMap: () => void;
  onDelete: (e: any) => void;
}> = ({ node, isPOP, onSelect, onViewOnMap, onDelete }) => {
  const iconKey = getFolderIconKey({
    name: node.properties.name || "",
    type: node.properties.type || "",
  });
  const iconDef = iconKey ? ICON_DEFS[iconKey.toUpperCase()] : null;
  const iconColor = iconDef?.color
    ? `rgb(${iconDef.color[0]},${iconDef.color[1]},${iconDef.color[2]})`
    : isPOP
      ? "#ef4444"
      : "#8b5cf6";

  return (
    <tr
      className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer group"
      onClick={onSelect}
    >
      <td className="px-4 py-2">
        <div className="flex items-center gap-2.5">
          {iconDef?.imageUrl ? (
            <img
              src={iconDef.imageUrl}
              alt=""
              className="w-5 h-5 object-contain flex-shrink-0"
            />
          ) : iconDef ? (
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5 flex-shrink-0"
              fill={iconColor}
            >
              <path d={iconDef.path} />
            </svg>
          ) : isPOP ? (
            <Building2 className="w-4 h-4 text-teal-500 flex-shrink-0" />
          ) : (
            <User className="w-4 h-4 text-amber-500 flex-shrink-0" />
          )}
          <div>
            <div
              className="font-bold text-gray-900 dark:text-white truncate max-w-[300px]"
              title={node.properties.name}
            >
              {node.properties.name}
            </div>
            <div className="text-xs text-gray-500 font-medium mt-0.5">
              #{node.properties.id}
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 py-2">
        <span
          className={`px-2.5 py-1 rounded text-xs font-semibold shadow-sm border ${
            isPOP
              ? "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-800"
              : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800"
          }`}
        >
          {isPOP ? "POP Node" : "Customer"}
        </span>
      </td>
      <td className="px-4 py-2 text-right">
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewOnMap();
            }}
            className="p-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-teal-600 rounded-lg shadow-[0_2px_0_0_rgba(13,148,136,0.1)] transition-all transform hover:scale-105 hover:-translate-y-0.5 active:translate-y-0"
            title="View on Map"
          >
            <MapIcon className="w-4 h-4 text-teal-500" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-red-600 rounded-lg shadow-[0_2px_0_0_rgba(220,38,38,0.1)] transition-all transform hover:scale-105 hover:-translate-y-0.5 active:translate-y-0"
            title="Delete Device"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        </div>
      </td>
    </tr>
  );
};

const RouteRow: React.FC<{
  route: any;
  onSelect: () => void;
  onViewOnMap: () => void;
  onDelete: (e: any) => void;
}> = ({ route, onSelect, onViewOnMap, onDelete }) => (
  <tr
    className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer group"
    onClick={onSelect}
  >
    <td className="px-4 py-2">
      <div
        className="font-bold text-gray-900 dark:text-white truncate max-w-[300px]"
        title={route.properties.name || "Fiber Route"}
      >
        {route.properties.name || "Fiber Route"}
      </div>
      <div className="text-xs text-gray-500 font-medium mt-0.5">
        #{route.properties.id}
      </div>
    </td>
    <td className="px-4 py-2">
      <div className="flex items-center gap-2">
        <Cable className="w-4 h-4 text-indigo-500" />
        <span className="text-xs text-gray-600 dark:text-gray-400 font-semibold">
          Fiber Route
        </span>
      </div>
    </td>
    <td className="px-4 py-2 text-right">
      <div className="flex items-center justify-end gap-1.5">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewOnMap();
          }}
          className="p-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-teal-600 rounded-lg shadow-[0_2px_0_0_rgba(13,148,136,0.1)] transition-all transform hover:scale-105 hover:-translate-y-0.5 active:translate-y-0"
          title="View on Map"
        >
          <MapIcon className="w-4 h-4 text-teal-500" />
        </button>
        <button
          onClick={onDelete}
          className="p-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-red-600 rounded-lg shadow-[0_2px_0_0_rgba(220,38,38,0.1)] transition-all transform hover:scale-105 hover:-translate-y-0.5 active:translate-y-0"
          title="Delete Route"
        >
          <Trash2 className="w-4 h-4 text-red-500" />
        </button>
      </div>
    </td>
  </tr>
);

const EmptyState: React.FC<{ colSpan: number }> = ({ colSpan }) => (
  <tr>
    <td
      colSpan={colSpan}
      className="px-6 py-12 text-center text-gray-400 dark:text-gray-500 italic text-sm"
    >
      No items found.
    </td>
  </tr>
);

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: number;
  color: "teal" | "amber" | "indigo";
}> = ({ icon, label, value, color }) => {
  const colors = {
    teal: "text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 border-teal-100 dark:border-teal-900/50 hover:border-teal-400 dark:hover:border-teal-500",
    amber:
      "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-900/50 hover:border-amber-400 dark:hover:border-amber-500",
    indigo:
      "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-900/50 hover:border-indigo-400 dark:hover:border-indigo-500",
  };

  return (
    <div
      className={`p-4 rounded-2xl border ${colors[color]} flex items-center gap-4 transition-all shadow-sm hover:shadow-lg hover:-translate-y-1`}
    >
      <div className="p-2 bg-white dark:bg-gray-800 rounded-xl shadow-inner border border-inherit">
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-500 mb-1 tracking-wide uppercase">
          {label}
        </p>
        <p className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          {value}
        </p>
      </div>
    </div>
  );
};

const DetailsDrawer: React.FC<{
  item: any;
  onClose: () => void;
  onViewOnMap?: (item: any) => void;
  allNodes?: any[];
}> = ({ item, onClose, onViewOnMap, allNodes = [] }) => {
  const properties = item.properties || {};

  const isPopNode = (n: any) => {
    if (n.properties.type === "POP") return true;
    const key = getFolderIconKey({
      name: n.properties.name || "",
      type: n.properties.type || "",
    });
    return (
      key === "POP" ||
      key === "DATACENTER" ||
      key === "NODE" ||
      key === "NNI" ||
      key === "SUB-POP"
    );
  };

  const isCustomerNode = (n: any) => {
    if (n.properties.type === "Customer") return true;
    const key = getFolderIconKey({
      name: n.properties.name || "",
      type: n.properties.type || "",
    });
    return (
      key === "CUSTOMER" ||
      key === "VODAFONE" ||
      key === "AIRTEL" ||
      key === "JIO" ||
      key === "TATA" ||
      key === "BSNL" ||
      key === "OFFICE-LOCATIONS"
    );
  };

  const calculateDistanceKm = (coord1: number[], coord2: number[]) => {
    const R = 6371;
    const dLat = (coord2[1] - coord1[1]) * (Math.PI / 180);
    const dLon = (coord2[0] - coord1[0]) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(coord1[1] * (Math.PI / 180)) *
        Math.cos(coord2[1] * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const nearestPop = useMemo<any>(() => {
    if (!isCustomerNode(item) || !allNodes.length) return null;
    const itemCoords = item.geometry.coordinates;
    let minDistance = Infinity;
    let closestNode = null;

    allNodes.forEach((node) => {
      if (isPopNode(node)) {
        const dist = calculateDistanceKm(itemCoords, node.geometry.coordinates);
        if (dist < minDistance) {
          minDistance = dist;
          closestNode = node;
        }
      }
    });
    return closestNode ? { node: closestNode, distanceKm: minDistance } : null;
  }, [item, allNodes]);

  const nearbyCustomers = useMemo(() => {
    if (!isPopNode(item) || !allNodes.length) return [];
    const itemCoords = item.geometry.coordinates;
    return allNodes
      .filter((n) => isCustomerNode(n))
      .map((n) => ({
        node: n,
        distanceKm: calculateDistanceKm(itemCoords, n.geometry.coordinates),
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 8);
  }, [item, allNodes]);

  const routeNodes = useMemo(() => {
    if (
      isPopNode(item) ||
      isCustomerNode(item) ||
      !allNodes.length ||
      !item.geometry.coordinates
    )
      return { sequence: [] };

    const routeCoords = item.geometry.coordinates;
    const matchedNodes: any[] = [];

    allNodes.forEach((node) => {
      if (!isPopNode(node) && !isCustomerNode(node)) return;
      const nodeCoords = node.geometry.coordinates;

      let minDistance = Infinity;
      let minCoordIndex = 0;

      routeCoords.forEach((coord: number[], idx: number) => {
        const dist = calculateDistanceKm(nodeCoords, coord);
        if (dist < minDistance) {
          minDistance = dist;
          minCoordIndex = idx;
        }
      });

      // If node is within a 3km threshold of the route
      if (minDistance < 3.0) {
        matchedNodes.push({
          node,
          distanceKm: minDistance,
          routeIndex: minCoordIndex,
        });
      }
    });

    matchedNodes.sort((a, b) => a.routeIndex - b.routeIndex);

    return { sequence: matchedNodes };
  }, [item, allNodes]);

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />
      <div className="relative w-full md:w-1/2 md:max-w-[50%] h-full bg-white dark:bg-gray-900 shadow-2xl flex flex-col transform transition-transform duration-300">
        {/* Fixed Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-900 z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate max-w-[300px]">
              {item.properties.name || "Fiber Detail"}
            </h2>
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded mt-2 inline-block border shadow-sm ${
                isPopNode(item)
                  ? "bg-red-50 text-red-700 border-red-100 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
                  : isCustomerNode(item)
                    ? "bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800"
                    : "bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800"
              }`}
            >
              {isPopNode(item)
                ? "POP NODE"
                : isCustomerNode(item)
                  ? "CUSTOMER"
                  : "FIBER ROUTE"}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors group"
          >
            <X className="w-6 h-6 text-gray-400 group-hover:text-red-500 transition-colors" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar bg-white dark:bg-gray-950">
          {/* Relationship Diagram */}
          {(nearestPop ||
            nearbyCustomers.length > 0 ||
            routeNodes.sequence.length > 0) && (
            <div>
              <h3 className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-[0.25em] mb-4 flex items-center gap-2">
                <MapIcon className="w-3 h-3" /> Network Topology Diagram
              </h3>
              <div className="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 flex flex-col items-center gap-4 shadow-inner">
                {/* Show Customer -> POP flow */}
                {nearestPop && (
                  <div className="flex flex-col items-center gap-0 w-full">
                    <div
                      className="flex flex-col items-center animate-bounce-subtle cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => onViewOnMap?.(nearestPop.node)}
                    >
                      <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-full mb-2 shadow-sm shadow-red-500/20">
                        <Building2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                      </div>
                      <span className="text-[10px] font-black text-gray-500 uppercase">
                        Primary POP
                      </span>
                      <span className="text-xs font-bold text-red-700 dark:text-red-400 truncate max-w-[150px]">
                        {nearestPop.node.properties.name}
                      </span>
                    </div>

                    <div className="h-20 w-0.5 bg-gradient-to-b from-red-400 to-purple-400 relative my-2">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full shadow-md px-3 py-1 flex flex-col items-center">
                        <span className="text-[10px] font-bold text-gray-800 dark:text-gray-200">
                          {nearestPop.distanceKm.toFixed(2)} km
                        </span>
                        <span className="text-[8px] font-semibold text-amber-500">
                          ~{(nearestPop.distanceKm * 0.25).toFixed(2)} dB loss
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform">
                      <div className="p-3 bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/30 rounded-full mb-2 shadow-sm shadow-purple-500/20">
                        <User className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <span className="text-[10px] font-black text-gray-500 uppercase">
                        Selected Customer
                      </span>
                      <span className="text-xs font-bold text-purple-700 dark:text-purple-400">
                        {item.properties.name}
                      </span>
                    </div>
                  </div>
                )}

                {nearbyCustomers.length > 0 && (
                  <div className="flex flex-col items-center gap-6 w-full">
                    <div className="flex flex-col items-center">
                      <div className="p-4 bg-red-100 dark:bg-red-500/20 border-2 border-red-200 dark:border-red-500/30 rounded-2xl shadow-lg shadow-red-500/10 mb-2">
                        <Building2 className="w-8 h-8 text-red-600 dark:text-red-400" />
                      </div>
                      <span className="text-[10px] font-black text-gray-500 uppercase">
                        Hub Node
                      </span>
                      <span className="text-sm font-black text-red-700 dark:text-red-400">
                        {item.properties.name}
                      </span>
                    </div>

                    <div className="w-full pt-4 border-t border-dashed border-gray-200 dark:border-gray-800">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block text-center mb-4">
                        Connected Infrastructure ({nearbyCustomers?.length || 0}
                        )
                      </span>
                      <div className="flex flex-col gap-2">
                        {nearbyCustomers?.map((c: any) => (
                          <div
                            key={c.node.properties.id}
                            onClick={() => onViewOnMap?.(c.node)}
                            className="px-4 py-3 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl flex items-center justify-between shadow-sm cursor-pointer hover:border-purple-300 transition-colors group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-1.5 bg-purple-50 dark:bg-purple-900/30 rounded-md">
                                <User className="w-4 h-4 text-purple-500" />
                              </div>
                              <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                                {c.node.properties.name}
                              </span>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400">
                                {c.distanceKm.toFixed(2)} km
                              </span>
                              <span className="text-[9px] font-semibold text-amber-500">
                                ~{(c.distanceKm * 0.25).toFixed(2)} dB
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {routeNodes.sequence.length > 0 && (
                  <div className="flex flex-col items-center w-full">
                    <div className="flex flex-col items-center mb-8">
                      <div className="p-4 bg-indigo-100 dark:bg-indigo-500/20 border-2 border-indigo-200 dark:border-indigo-500/30 rounded-2xl shadow-lg shadow-indigo-500/10 mb-2">
                        <Cable className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <span className="text-[10px] font-black text-gray-500 uppercase">
                        Fiber Route
                      </span>
                      <span className="text-sm font-black text-indigo-700 dark:text-indigo-400 truncate max-w-[200px]">
                        {item.properties.name || "Unnamed Route"}
                      </span>
                    </div>

                    <div className="w-full pt-6 border-t border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center">
                      <span className="text-[9px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest block text-center mb-6">
                        Hop-by-Hop Sequence
                      </span>

                      <div className="relative flex flex-col items-center w-full max-w-[280px]">
                        {/* The actual fiber line */}
                        <div className="absolute top-4 bottom-4 w-1.5 bg-indigo-500/20 dark:bg-indigo-400/20 rounded-full" />

                        {routeNodes.sequence.map((step: any, idx: number) => {
                          const isPop = isPopNode(step.node);
                          const alignLeft = idx % 2 === 0;
                          return (
                            <div
                              key={idx}
                              onClick={() => onViewOnMap?.(step.node)}
                              className="relative flex items-center justify-center w-full py-4 group cursor-pointer hover:scale-105 transition-transform"
                            >
                              <div
                                className={`z-10 p-2.5 border-[3px] rounded-full shadow-md bg-white dark:bg-gray-900 transition-all ${isPop ? "border-red-500" : "border-purple-500"} group-hover:shadow-lg`}
                              >
                                {isPop ? (
                                  <Building2 className="w-5 h-5 text-red-500" />
                                ) : (
                                  <User className="w-5 h-5 text-purple-500" />
                                )}
                              </div>

                              <div
                                className={`absolute ${alignLeft ? "right-1/2 mr-8 text-right" : "left-1/2 ml-8 text-left"} w-[120px] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-2 rounded-xl shadow-sm group-hover:border-indigo-300 transition-colors`}
                              >
                                <span className="text-[9px] font-black text-gray-400 block">
                                  {isPop ? "HUB NODE" : "CUSTOMER"}
                                </span>
                                <span className="text-[11px] font-bold text-gray-800 dark:text-gray-200 truncate block mt-0.5">
                                  {step.node.properties.name}
                                </span>
                                <span className="text-[9px] font-semibold text-teal-600 dark:text-teal-400 mt-1 block">
                                  {(step.distanceKm * 1000).toFixed(0)}m from
                                  line
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-[0.25em] mb-4 flex items-center gap-2">
              <Info className="w-3 h-3" /> Technical Properties
            </h3>
            <div className="space-y-4">
              {Object.entries(properties).map(([key, value]) => {
                const ignored = [
                  "icon",
                  "stroke",
                  "style",
                  "fill",
                  "folder",
                  "color",
                  "opacity",
                  "hash",
                  "url",
                  "scale",
                  "weight",
                ];
                if (
                  key === "name" ||
                  key === "type" ||
                  ignored.some((i) => key.toLowerCase().includes(i))
                )
                  return null;
                const displayValue =
                  typeof value === "object" && value !== null
                    ? JSON.stringify(value, null, 2)
                    : String(value);

                return (
                  <div
                    key={key}
                    className="flex flex-col gap-1 border-b border-gray-50 dark:border-white/5 pb-3"
                  >
                    <span className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em]">
                      {key.replace(/_/g, " ")}
                    </span>
                    <div className="text-sm text-gray-800 dark:text-gray-200 break-words font-medium leading-relaxed whitespace-pre-wrap">
                      {displayValue}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <details className="group">
            <summary className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-4 flex items-center gap-2 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 transition-colors select-none list-none [&::-webkit-details-marker]:hidden">
              <MapIcon className="w-3 h-3" /> Geometry Signature
              <ChevronRight className="w-4 h-4 ml-auto transition-transform group-open:rotate-90" />
            </summary>
            <div className="bg-gray-950 p-4 rounded-xl border border-gray-800 shadow-inner mt-2">
              <pre className="text-[11px] text-teal-400 font-mono overflow-x-auto custom-scrollbar">
                {JSON.stringify(item.geometry, null, 2)}
              </pre>
            </div>
          </details>
        </div>

        {/* Fixed Footer */}
        <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex gap-3 sticky bottom-0 z-10">
          <button
            onClick={() => {
              onClose();
              onViewOnMap?.(item);
            }}
            className="flex-1 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white font-black py-3.5 rounded-xl shadow-xl shadow-teal-500/30 transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3 tracking-widest text-xs uppercase"
          >
            <MapIcon className="w-5 h-5 antialiased" />
            FOCUS ON MAPVIEW
          </button>
        </div>
      </div>
    </div>
  );
};

export default DarkFiberDashboard;
