import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Download,
  Database,
  AlertTriangle,
  CheckCircle,
  Shield,
  List,
  Link as LinkIcon,
  Server
} from "lucide-react";
import { showToast } from "../../../utils/toastUtils";

import { usePermission } from "../../../hooks/usePermission";
import AccessDenied from "../../../features/admin/AuditLogViewer/components/AccessDenied";

// Mock environment check - in real app, might come from API or build env
const isDev = process.env.NODE_ENV === "development";

export const DatabaseManagement: React.FC = () => {
  const { can, isAdmin } = usePermission();
  const canAccess = isAdmin || can("admin:database");
  const canTargetExport = isAdmin || can("admin:database:export");

  const [exportMode, setExportMode] = useState<"full" | "targeted">("full");

  // Full Dump State
  const [includeData, setIncludeData] = useState(true);

  // Targeted Export State
  const [schemaMap, setSchemaMap] = useState<any[]>([]);
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [targetedIncludeData, setTargetedIncludeData] = useState(true);
  const [autoIncludeConnected, setAutoIncludeConnected] = useState(true);
  const [isLoadingSchema, setIsLoadingSchema] = useState(false);

  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (exportMode === "targeted" && schemaMap.length === 0) {
      fetchSchema();
    }
  }, [exportMode]);

  const fetchSchema = async () => {
    setIsLoadingSchema(true);
    try {
      const token =
        sessionStorage.getItem("opti_connect_token") ||
        localStorage.getItem("opti_connect_token");
      const API_BASE =
        process.env.REACT_APP_API_URL || "http://localhost:82/api";

      const res = await fetch(`${API_BASE}/admin/backup/tables`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setSchemaMap(data.data);
      } else {
        showToast.error("Failed to load database schema.");
      }
    } catch (e) {
      console.error(e);
      showToast.error("Error loading database schema.");
    } finally {
      setIsLoadingSchema(false);
    }
  };

  const handleTableToggle = (tableName: string) => {
    if (selectedTables.includes(tableName)) {
      setSelectedTables((prev) => prev.filter((t) => t !== tableName));
    } else {
      if (autoIncludeConnected) {
        const tableDef = schemaMap.find((t) => t.tableName === tableName);
        if (tableDef) {
          const toAdd = [tableName, ...(tableDef.dependsOn || [])];
          setSelectedTables((prev) => Array.from(new Set([...prev, ...toAdd])));

          if (toAdd.length > 1) {
            showToast.success(
              `Auto-included ${toAdd.length - 1} connected table(s)`,
            );
          }
        } else {
          setSelectedTables((prev) => [...prev, tableName]);
        }
      } else {
        setSelectedTables((prev) => [...prev, tableName]);
      }
    }
  };

  const selectAllTables = () => {
    setSelectedTables(schemaMap.map((t) => t.tableName));
  };

  const clearSelection = () => {
    setSelectedTables([]);
  };

  const handleDownload = async () => {
    if (exportMode === "targeted" && selectedTables.length === 0) {
      showToast.error("Please select at least one table to export.");
      return;
    }

    setIsDownloading(true);
    try {
      // Retrieve token from correct storage (sessionStorage per authSlice)
      const token =
        sessionStorage.getItem("opti_connect_token") ||
        localStorage.getItem("opti_connect_token");

      if (!token) {
        showToast.error("Authentication token not found. Please log in again.");
        setIsDownloading(false);
        return;
      }

      // Use API_URL from env or default to localhost:82/api
      // Note: REACT_APP_API_URL usually includes '/api' suffix
      const API_BASE =
        process.env.REACT_APP_API_URL || "http://localhost:82/api";

      // 1. Create Backup Request
      const bodyPayload =
        exportMode === "full"
          ? {
              includeData,
              description: "Manual Full Export via Admin Panel",
            }
          : {
              includeData: targetedIncludeData,
              description: "Targeted Tables Export",
              tables: selectedTables,
            };

      const createRes = await fetch(`${API_BASE}/admin/backup/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bodyPayload),
      });

      const createData = await createRes.json();

      if (!createRes.ok || !createData.success) {
        throw new Error(createData.message || "Failed to create backup");
      }

      const backupId = createData.data.id;
      const filename = createData.data.filename;

      // 2. Download the file
      // Fetch as blob to support Auth Header
      const downloadRes = await fetch(
        `${API_BASE}/admin/backup/${backupId}/download`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!downloadRes.ok) throw new Error("Download failed");

      const blob = await downloadRes.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showToast.success(
        `Database dump executed successfully! (${createData.data.size})`,
      );
    } catch (error: any) {
      console.error("Dump failed", error);
      showToast.error(`Failed to generate dump: ${error.message}`);
    } finally {
      setIsDownloading(false);
    }
  };

  if (!canAccess) {
    return <AccessDenied />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Environment Status Banner */}
      <div
        className={`p-4 rounded-xl border ${isDev ? "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800" : "bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800"}`}
      >
        <div className="flex items-center gap-3">
          {isDev ? (
            <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
              <Database className="w-6 h-6 text-blue-600 dark:text-blue-300" />
            </div>
          ) : (
            <div className="p-2 bg-amber-100 dark:bg-amber-800 rounded-lg">
              <Shield className="w-6 h-6 text-amber-600 dark:text-amber-300" />
            </div>
          )}
          <div>
            <h3
              className={`font-semibold ${isDev ? "text-blue-900 dark:text-blue-100" : "text-amber-900 dark:text-amber-100"}`}
            >
              Environment: {isDev ? "Development" : "Production"}
            </h3>
            <p
              className={`text-sm ${isDev ? "text-blue-700 dark:text-blue-300" : "text-amber-700 dark:text-amber-300"}`}
            >
              {isDev
                ? "Manual backups are enabled for development purposes."
                : "Automated backups are configured. Manual dumps should be performed with caution."}
            </p>
          </div>
        </div>
      </div>

      {/* Export Modes Tabs — Admin-style 3D Pill Navigation */}
      {canTargetExport && (
        <div
          className="w-fit relative flex overflow-hidden rounded-full bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-gray-200/60 dark:border-gray-700/60"
          style={{
            boxShadow: `
              inset 0 2px 4px rgba(0,0,0,0.06),
              0 1px 3px rgba(0,0,0,0.08),
              0 4px 12px rgba(0,0,0,0.04)
            `,
            padding: '5px',
          }}
        >
          {/* Full Database Backup Tab */}
          <motion.button
            onClick={() => setExportMode("full")}
            whileTap={{ scale: 0.96, y: 1 }}
            initial="idle"
            whileHover="hover"
            animate={exportMode === "full" ? "active" : "idle"}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className={`
              relative flex items-center gap-2 px-5 py-2.5 text-sm font-semibold
              rounded-full whitespace-nowrap cursor-pointer select-none z-10
              transition-colors duration-200
              ${exportMode === "full"
                ? "text-white"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              }
            `}
          >
            <motion.span
              className={`${exportMode === "full" ? "text-white" : "text-blue-500"} flex-shrink-0 relative z-20`}
              variants={{
                idle: { scale: 1, rotate: 0, y: 0 },
                hover: { scale: 1.25, rotate: [0, -15, 15, 0], y: [0, -4, 0], transition: { duration: 0.4, y: { duration: 0.3, ease: "easeOut" } } },
                active: { scale: [1, 1.03, 1], transition: { duration: 2, repeat: Infinity, ease: "easeInOut" } }
              }}
            >
              <Database className="w-4 h-4" />
            </motion.span>
            <span className={`relative z-20 ${exportMode === "full" ? "drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]" : ""}`}>
              Full Database Backup
            </span>
            {exportMode === "full" && (
              <>
                <motion.div
                  layoutId="db-tab-pill-bg"
                  className="absolute inset-0 rounded-full -z-10 bg-blue-600"
                  initial={false}
                  transition={{ layout: { type: "spring", stiffness: 400, damping: 32 } }}
                  style={{
                    boxShadow: `
                      0 3px 10px rgba(37,99,235,0.35),
                      0 1px 3px rgba(0,0,0,0.15),
                      inset 0 1px 2px rgba(255,255,255,0.3),
                      inset 0 -2px 4px rgba(0,0,0,0.12)
                    `,
                  }}
                />
                <motion.div
                  layoutId="db-tab-pill-gloss"
                  className="absolute inset-0 rounded-full -z-[5] overflow-hidden"
                  initial={false}
                  transition={{ layout: { type: "spring", stiffness: 400, damping: 32 } }}
                  style={{
                    background: `linear-gradient(180deg, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0.08) 45%, transparent 50%, rgba(0,0,0,0.05) 100%)`,
                  }}
                />
              </>
            )}
          </motion.button>

          {/* Targeted Export Tab */}
          <motion.button
            onClick={() => setExportMode("targeted")}
            whileTap={{ scale: 0.96, y: 1 }}
            initial="idle"
            whileHover="hover"
            animate={exportMode === "targeted" ? "active" : "idle"}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className={`
              relative flex items-center gap-2 px-5 py-2.5 text-sm font-semibold
              rounded-full whitespace-nowrap cursor-pointer select-none z-10
              transition-colors duration-200
              ${exportMode === "targeted"
                ? "text-white"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              }
            `}
          >
            <motion.span
              className={`${exportMode === "targeted" ? "text-white" : "text-purple-500"} flex-shrink-0 relative z-20`}
              variants={{
                idle: { scale: 1, rotate: 0, y: 0 },
                hover: { scale: 1.25, rotate: [0, -15, 15, 0], y: [0, -4, 0], transition: { duration: 0.4, y: { duration: 0.3, ease: "easeOut" } } },
                active: { scale: [1, 1.03, 1], transition: { duration: 2, repeat: Infinity, ease: "easeInOut" } }
              }}
            >
              <List className="w-4 h-4" />
            </motion.span>
            <span className={`relative z-20 ${exportMode === "targeted" ? "drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]" : ""}`}>
              Targeted Export
            </span>
            {exportMode === "targeted" && (
              <>
                <motion.div
                  layoutId="db-tab-pill-bg"
                  className="absolute inset-0 rounded-full -z-10 bg-purple-600"
                  initial={false}
                  transition={{ layout: { type: "spring", stiffness: 400, damping: 32 } }}
                  style={{
                    boxShadow: `
                      0 3px 10px rgba(147,51,234,0.35),
                      0 1px 3px rgba(0,0,0,0.15),
                      inset 0 1px 2px rgba(255,255,255,0.3),
                      inset 0 -2px 4px rgba(0,0,0,0.12)
                    `,
                  }}
                />
                <motion.div
                  layoutId="db-tab-pill-gloss"
                  className="absolute inset-0 rounded-full -z-[5] overflow-hidden"
                  initial={false}
                  transition={{ layout: { type: "spring", stiffness: 400, damping: 32 } }}
                  style={{
                    background: `linear-gradient(180deg, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0.08) 45%, transparent 50%, rgba(0,0,0,0.05) 100%)`,
                  }}
                />
              </>
            )}
          </motion.button>
        </div>
      )}

      {/* Manual Backup Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {exportMode === "full" ? (
          <>
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
              <h4 className="text-lg font-bold text-blue-700 dark:text-blue-400 flex items-center gap-2">
                <Download className="w-5 h-5 text-blue-500" />
                Manual Database Dump
              </h4>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                Generate a full SQL dump of the PostgreSQL database.
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Options */}
              <div className="space-y-4">
                <label className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeData}
                    onChange={(e) => setIncludeData(e.target.checked)}
                    className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <div className="flex-1">
                    <span className="font-medium text-gray-900 dark:text-white block">
                      Include Table Data (Full Dump)
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 block mt-1">
                      If checked, includes all rows (INSERT statements). If
                      unchecked, exports SCHEMA ONLY (CREATE TABLE statements).
                    </span>
                  </div>
                </label>
              </div>

              {!isDev && (
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm bg-amber-50 dark:bg-amber-900/10 p-3 rounded-lg border border-amber-100 dark:border-amber-800/30">
                  <AlertTriangle className="w-4 h-4" />
                  Warning: Generating a full dump in Production may impact
                  performance.
                </div>
              )}

              {/* Action */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDownloading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Generating Dump...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Download SQL Dump
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          // TARGETED EXPORT UI
          <>
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h4 className="text-lg font-bold text-purple-700 dark:text-purple-400 flex items-center gap-2">
                    <List className="w-5 h-5 text-purple-500" />
                    Targeted Export
                  </h4>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                    Select specific tables to query and download. Parent tables (foreign keys) can be auto-included to ensure successful re-import.
                  </p>
                </div>
                
                <div className="flex flex-col gap-2 min-w-[250px]">
                  <label className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm cursor-pointer hover:border-indigo-300 transition-colors">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Include Data</span>
                    </div>
                    <div className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={targetedIncludeData} onChange={(e) => setTargetedIncludeData(e.target.checked)} className="sr-only peer" />
                      <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:bg-gray-700 peer-checked:bg-indigo-600"></div>
                    </div>
                  </label>
                  
                  <label className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm cursor-pointer hover:border-indigo-300 transition-colors">
                    <div className="flex items-center gap-2">
                      <LinkIcon className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Auto-include Connected</span>
                    </div>
                    <div className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={autoIncludeConnected} onChange={(e) => setAutoIncludeConnected(e.target.checked)} className="sr-only peer" />
                      <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:bg-gray-700 peer-checked:bg-indigo-600"></div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="p-6">
              {isLoadingSchema ? (
                <div className="flex flex-col items-center justify-center py-12">
                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
                   <p className="text-gray-500">Loading database schema...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Table List */}
                  <div className="lg:col-span-2 flex flex-col h-[500px] border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
                    <div className="bg-gray-50 dark:bg-gray-800/80 px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                      <h5 className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <Server className="w-4 h-4 text-gray-500" />
                        Available Tables ({schemaMap.length})
                      </h5>
                      <div className="space-x-2 text-sm">
                        <button onClick={selectAllTables} className="text-indigo-600 hover:text-indigo-800 font-medium">Select All</button>
                        <span className="text-gray-300">|</span>
                        <button onClick={clearSelection} className="text-red-500 hover:text-red-700 font-medium">Clear</button>
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 grid grid-cols-1 sm:grid-cols-2 gap-2 custom-scrollbar bg-white dark:bg-gray-900">
                      {schemaMap.map((table) => (
                        <label 
                          key={table.tableName} 
                          className={`flex items-center p-2 rounded border cursor-pointer transition-colors ${selectedTables.includes(table.tableName) ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 dark:border-indigo-400' : 'border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800'}`}
                        >
                          <input 
                            type="checkbox" 
                            checked={selectedTables.includes(table.tableName)}
                            onChange={() => handleTableToggle(table.tableName)}
                            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="ml-2 text-sm font-mono text-gray-700 dark:text-gray-300 truncate" title={table.tableName}>
                            {table.tableName}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Summary & Action */}
                  <div className="flex flex-col gap-4">
                    <div className="bg-gray-50 dark:bg-gray-800/80 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                      <h5 className="font-semibold text-gray-900 dark:text-white mb-4 border-b pb-2 dark:border-gray-700">Export Summary</h5>
                      
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-500">Selected Tables:</span>
                        <span className="font-bold text-indigo-600 bg-indigo-100 dark:bg-indigo-900/50 px-2 rounded-full">{selectedTables.length}</span>
                      </div>
                      
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-sm text-gray-500">Include Data:</span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${targetedIncludeData ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                          {targetedIncludeData ? 'Yes' : 'No (Schema Only)'}
                        </span>
                      </div>

                      {selectedTables.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <span className="text-xs text-gray-500 uppercase font-semibold">Preview:</span>
                          <div className="mt-2 text-xs font-mono text-gray-600 bg-white dark:bg-black p-2 rounded max-h-32 overflow-y-auto border border-gray-100 dark:border-gray-900">
                            {selectedTables.map(t => <div key={t}>{t}</div>)}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={handleDownload}
                      disabled={isDownloading || selectedTables.length === 0}
                      className="w-full mt-auto flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isDownloading ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Generating...
                        </>
                      ) : (
                        <>
                          <Download className="w-5 h-5" />
                          Download Filtered SQL
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

