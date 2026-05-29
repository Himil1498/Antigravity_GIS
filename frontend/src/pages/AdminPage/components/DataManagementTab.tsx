import React, { useState } from "react";
import { 
  Download, 
  Database, 
  FileSpreadsheet, 
  Table, 
  Layers,
  Users,
  Shield,
  Radio,
  Map as MapIcon,
  Activity,
  Archive,
  Search,
  Bell
} from "lucide-react";
import { showToast } from "../../../utils/toastUtils";
import { usePermission } from "../../../hooks/usePermission";
import AccessDenied from "../../../features/admin/AuditLogViewer/components/AccessDenied";
import EnhancedSelect from "../../../components/ui/EnhancedSelect";

const getTableMetadata = (tableName: string) => {
  const metadataMap: Record<string, any> = {
    users: { label: "Users", icon: <Users className="w-4 h-4" />, description: "User accounts and profiles" },
    roles: { label: "Roles", icon: <Shield className="w-4 h-4" />, description: "Role definitions" },
    system_permissions: { label: "System Permissions", icon: <Shield className="w-4 h-4" />, description: "System permissions definitions" },
    permissions: { label: "Permissions", icon: <Shield className="w-4 h-4" />, description: "Permission assignments" },
    regions: { label: "Regions", icon: <MapIcon className="w-4 h-4" />, description: "Geographic regions" },
    network_towers: { label: "Towers / Sites", icon: <Radio className="w-4 h-4" />, description: "Tower infrastructure" },
    fiber_cables: { label: "Fiber Cables", icon: <Activity className="w-4 h-4" />, description: "Fiber network routes" },
    audit_logs: { label: "Audit Logs", icon: <Archive className="w-4 h-4" />, description: "System activity logs" },
    api_performance_logs: { label: "API Logs", icon: <Activity className="w-4 h-4" />, description: "Performance metrics" },
    bookmarks: { label: "Bookmarks", icon: <MapIcon className="w-4 h-4" />, description: "User saved locations" },
    layers: { label: "Layers", icon: <Layers className="w-4 h-4" />, description: "Map layer configurations" },
    notifications: { label: "Notifications", icon: <Bell className="w-4 h-4" />, description: "System notifications" },
    search_history: { label: "Search History", icon: <Search className="w-4 h-4" />, description: "User search queries" },
  };
  
  if (metadataMap[tableName]) {
    return { value: tableName, ...metadataMap[tableName] };
  }
  
  const formattedLabel = tableName.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  return {
    value: tableName,
    label: formattedLabel,
    icon: <Database className="w-4 h-4" />,
    description: `Data for ${formattedLabel}`
  };
};

const DataManagementTab: React.FC = () => {
  const { can, isAdmin } = usePermission();
  const canAccess = isAdmin || can("data:export");

  const [downloadScope, setDownloadScope] = useState<"all" | "single">("all");
  const [availableTables, setAvailableTables] = useState<any[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [fetchingTables, setFetchingTables] = useState(false);

  React.useEffect(() => {
    const fetchTables = async () => {
      try {
        setFetchingTables(true);
        const token = sessionStorage.getItem("opti_connect_token") || localStorage.getItem("opti_connect_token");
        const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:82/api";
        const res = await fetch(`${API_BASE}/admin/export/tables`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const formatted = json.data.map(getTableMetadata);
          // Sort alphabetically by label
          formatted.sort((a: any, b: any) => a.label.localeCompare(b.label));
          setAvailableTables(formatted);
          if (formatted.length > 0) {
            setSelectedTable(formatted[0].value);
          }
        }
      } catch (err) {
        console.error("Failed to load tables:", err);
      } finally {
        setFetchingTables(false);
      }
    };
    if (canAccess) fetchTables();
  }, [canAccess]);

  const handleDownload = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("opti_connect_token") || localStorage.getItem("opti_connect_token");

      if (!token) {
        showToast.error("Authentication token not found. Please log in again.");
        setLoading(false);
        return;
      }

      const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:82/api";
      const tableParam = downloadScope === "all" ? "all" : selectedTable;

      const response = await fetch(`${API_BASE}/admin/export/database?table=${tableParam}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const dateStr = new Date().toISOString().slice(0, 10);
      const fileName = downloadScope === "all"
        ? `database_export_full_${dateStr}.xlsx`
        : `database_export_${selectedTable}_${dateStr}.xlsx`;

      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      showToast.success("Export downloaded successfully");
    } catch (error: any) {
      console.error("Export failed:", error);
      showToast.error("Failed to download export. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!canAccess) {
    return <AccessDenied />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-lg">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
        <div className="relative p-8 flex items-center gap-6">
          <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl border border-white/20 shadow-inner">
            <Database className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Data Management Console</h1>
            <p className="text-teal-50 mt-2 max-w-xl text-sm leading-relaxed">
              Securely export your organization's data. Generate comprehensive backups of all tables or extract specific datasets for analysis.
              <span className="block mt-1 opacity-75 text-xs">Sensitive Operation: All exports are logged for security auditing.</span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Scope Selection */}
        <div className="lg:col-span-1 space-y-4">
          <label className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">
            Export Scope
          </label>
          
          <button
            onClick={() => setDownloadScope("all")}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 group relative overflow-hidden ${
              downloadScope === "all"
                ? "border-teal-500 bg-teal-50 dark:bg-teal-900/10 shadow-md transform scale-[1.02]"
                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-teal-200 dark:hover:border-teal-800"
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`p-2 rounded-lg ${downloadScope === "all" ? "bg-teal-500 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-500"}`}>
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h3 className={`font-bold ${downloadScope === "all" ? "text-teal-900 dark:text-teal-100" : "text-gray-900 dark:text-white"}`}>
                  Full Database
                </h3>
                <p className={`text-sm mt-1 ${downloadScope === "all" ? "text-teal-700 dark:text-teal-300" : "text-gray-500"}`}>
                  Export every table into a single multi-sheet Excel file.
                </p>
              </div>
            </div>
            {downloadScope === "all" && (
              <div className="absolute top-4 right-4 text-teal-500">
                <div className="w-3 h-3 bg-teal-500 rounded-full ring-4 ring-teal-100 dark:ring-teal-900/30"></div>
              </div>
            )}
          </button>

          <button
            onClick={() => setDownloadScope("single")}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 group relative overflow-hidden ${
              downloadScope === "single"
                ? "border-teal-500 bg-teal-50 dark:bg-teal-900/10 shadow-md transform scale-[1.02]"
                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-teal-200 dark:hover:border-teal-800"
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`p-2 rounded-lg ${downloadScope === "single" ? "bg-teal-500 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-500"}`}>
                <Table className="w-6 h-6" />
              </div>
              <div>
                <h3 className={`font-bold ${downloadScope === "single" ? "text-teal-900 dark:text-teal-100" : "text-gray-900 dark:text-white"}`}>
                  Single Table
                </h3>
                <p className={`text-sm mt-1 ${downloadScope === "single" ? "text-teal-700 dark:text-teal-300" : "text-gray-500"}`}>
                  Select a specific table to export focused data.
                </p>
              </div>
            </div>
             {downloadScope === "single" && (
              <div className="absolute top-4 right-4 text-teal-500">
                <div className="w-3 h-3 bg-teal-500 rounded-full ring-4 ring-teal-100 dark:ring-teal-900/30"></div>
              </div>
            )}
          </button>
        </div>

        {/* Right Column: Action Area */}
        <div className="lg:col-span-2">
          <div className="h-full bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 flex flex-col">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-teal-500" />
              Configuration & Export
            </h2>

            <div className="flex-1 space-y-6">
              {downloadScope === "all" ? (
                 <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 border border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center text-center h-48 animate-in fade-in">
                    <Database className="w-12 h-12 text-gray-300 mb-4" />
                    <p className="text-gray-900 dark:text-white font-medium">Ready to export full database</p>
                    <p className="text-sm text-gray-500 mt-1">This may take a few moments depending on data size.</p>
                 </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                  <EnhancedSelect
                    label="Select Target Table"
                    value={selectedTable}
                    onChange={setSelectedTable}
                    options={availableTables}
                    placeholder={fetchingTables ? "Loading tables..." : "Choose a table..."}
                    searchable={true}
                    icon={<Table className="w-5 h-5 text-gray-400" />}
                    className="w-full"
                  />
                  <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800 flex items-start gap-3">
                    <div className="p-1 bg-blue-100 dark:bg-blue-800 rounded">
                      <FileSpreadsheet className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">Export Preview</h4>
                      <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                        Will generate: <span className="font-mono bg-white/50 px-1 rounded">database_export_{selectedTable}_{new Date().toISOString().slice(0, 10)}.xlsx</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-6 mt-6 border-t border-gray-100 dark:border-gray-700 flex justify-end">
              <button
                onClick={handleDownload}
                disabled={loading}
                className="
                  group relative flex items-center gap-3 px-8 py-4 
                  bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 
                  text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 
                  transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none
                "
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Processing Export...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5 group-hover:animate-bounce" />
                    <span>Download Excel Export</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataManagementTab;
