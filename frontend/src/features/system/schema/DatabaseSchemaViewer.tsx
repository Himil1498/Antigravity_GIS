
import React, { useState, useEffect, useRef } from "react";
import { TableSchema, getDatabaseSchemaAPI, executeQueryAPI, updateAnnotationAPI } from "../../../services/schemaService";
import html2canvas from "html2canvas";
import { hasPermission } from "../../../utils/rbac/helpers"; 
import { useAppSelector } from "../../../store/index";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import GlobalERDiagram from "./components/GlobalERDiagram";
import { showToast } from "../../../utils/toastUtils";

const DatabaseSchemaViewer: React.FC = () => {
    const { user } = useAppSelector((state) => state.auth);
    const [schema, setSchema] = useState<TableSchema[]>([]);
    const [selectedTable, setSelectedTable] = useState<TableSchema | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showHelp, setShowHelp] = useState(false);
    
    // SQL Runner State
    const [activeTab, setActiveTab] = useState<"schema" | "sql" | "erd">("schema");
    const [sqlQuery, setSqlQuery] = useState("SELECT * FROM users LIMIT 10;");
    const [sqlResults, setSqlResults] = useState<{data: any[], rowCount: number} | null>(null);
    const [sqlError, setSqlError] = useState<string | null>(null);
    const [isExecuting, setIsExecuting] = useState(false);

    // Annotation State
    const [isEditingDesc, setIsEditingDesc] = useState(false);
    const [descValue, setDescValue] = useState("");

    // Dynamic Updates State
    const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
    const [autoRefresh, setAutoRefresh] = useState(false);

    const diagramRef = useRef<HTMLDivElement>(null);

    // Initial Load
    useEffect(() => {
        fetchSchema();
    }, []);

    // Sync Description State
    useEffect(() => {
        if (selectedTable) {
            setDescValue(selectedTable.description || "");
            setIsEditingDesc(false);
        }
    }, [selectedTable?.name]); // Only reset when switching tables

    const handleSaveDescription = async () => {
         if (!selectedTable) return;
         try {
             await updateAnnotationAPI(selectedTable.name, descValue);
             const newDesc = descValue;
             
             // Optimistic Update
             setSchema(prev => prev.map(t => 
                 t.name === selectedTable.name ? { ...t, description: newDesc } : t
             ));
             setSelectedTable(prev => prev ? { ...prev, description: newDesc } : null);
             setIsEditingDesc(false);
         } catch(err) {
             console.error(err);
             showToast.error("Failed to save description");
         }
    };


    // Auto-Refresh Polling
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (autoRefresh) {
            interval = setInterval(() => {
                fetchSchema(true); // silent refresh
            }, 30000); // 30 seconds
        }
        return () => clearInterval(interval);
    }, [autoRefresh]);
    
    const handleRefresh = () => {
        fetchSchema();
    };
    
    // Add silent flag to fetchSchema to avoid full loading spinner on auto-refresh
    const fetchSchema = async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            const data = await getDatabaseSchemaAPI();
            setSchema(data);
            setLastRefreshed(new Date());
            
            // If we have a selected table, ensure we update its reference from new data
            if (data.length > 0) {
                 setSelectedTable(prev => {
                     if (!prev) return data[0];
                     return data.find(t => t.name === prev.name) || data[0];
                 });
            }
        } catch (err: any) {
            if (!silent) setError(err.message || "Failed to load schema");
        } finally {
            if (!silent) setLoading(false);
        }
    };

    const handleRunQuery = async (queryOverride?: string) => {
        const queryToRun = queryOverride || sqlQuery;
        if (!queryToRun.trim()) return;
        
        // Update the editor if we're running from a click
        if (queryOverride) setSqlQuery(queryOverride);

        setIsExecuting(true);
        setSqlError(null);
        setSqlResults(null);
        try {
            const res = await executeQueryAPI(queryToRun);
            setSqlResults(res);
        } catch (err: any) {
            setSqlError(err.response?.data?.error || err.message || "Query failed");
        } finally {
            setIsExecuting(false);
        }
    };
    
    const handleExportDiagram = async () => {
        if (!diagramRef.current) return;
        try {
            const canvas = await html2canvas(diagramRef.current);
            const image = canvas.toDataURL("image/png");
            const link = document.createElement("a");
            link.href = image;
            link.download = `schema_diagram_${selectedTable?.name || "export"}.png`;
            link.click();
        } catch (err) {
            console.error("Export failed", err);
        }
    };

    const handleDownloadSchemaPdf = () => {
        const doc = new jsPDF();
        
        doc.setFontSize(22);
        doc.setTextColor(40, 40, 40);
        doc.text("Database Schema Documentation", 14, 20);
        
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
        doc.text(`Total Tables: ${schema.length}`, 14, 35);
        
        doc.setDrawColor(200, 200, 200);
        doc.line(14, 38, 196, 38);

        schema.forEach((table, index) => {
             // Start new page for each table (except maybe the first one if we can fit it, but safer to page break)
             // However, let's try to fit if possible, or force page break for cleanliness.
             // Actually, force page break for every table after the first is cleaner.
             if (index > 0) doc.addPage();
             
             let yPos = 20;
             if (index === 0) yPos = 45; 

             // Table Header
             doc.setFillColor(245, 247, 250);
             doc.rect(14, yPos, 182, 10, 'F');
             
             doc.setFontSize(14);
             doc.setFont("helvetica", "bold");
             doc.setTextColor(37, 99, 235); // Blue
             doc.text(`Table: ${table.name}`, 18, yPos + 7);
             
             yPos += 15;
             doc.setFontSize(10);
             doc.setFont("helvetica", "normal");
             doc.setTextColor(60);
             doc.text(`Type: ${table.type}`, 14, yPos);
             yPos += 6;

             // Description
             if (table.description) {
                 doc.setFont("helvetica", "italic");
                 doc.setTextColor(80);
                 const splitDesc = doc.splitTextToSize(table.description, 180);
                 doc.text(splitDesc, 14, yPos);
                 yPos += splitDesc.length * 5 + 4;
                 doc.setFont("helvetica", "normal");
             } else {
                 yPos += 4;
             }

             // Columns Table
             autoTable(doc, {
                 startY: yPos,
                 head: [['Column', 'Type', 'Nullable', 'Default']],
                 body: table.columns.map(c => [
                     c.column_name, 
                     c.data_type + (c.character_maximum_length ? `(${c.character_maximum_length})` : ''), 
                     c.is_nullable === 'YES' ? 'NULL' : 'NOT NULL', 
                     c.column_default || '-'
                 ]),
                 theme: 'grid',
                 headStyles: { fillColor: [63, 81, 181], textColor: 255, fontSize: 9 },
                 styles: { fontSize: 8, cellPadding: 2 },
                 margin: { left: 14, right: 14 }
             });

             yPos = (doc as any).lastAutoTable.finalY + 10;

             // Relationships
             doc.setFontSize(11);
             doc.setFont("helvetica", "bold");
             doc.setTextColor(0);
             doc.text("Relationships", 14, yPos);
             yPos += 6;

             if (table.relationships.incoming.length === 0 && table.relationships.outgoing.length === 0) {
                 doc.setFontSize(9);
                 doc.setFont("helvetica", "italic");
                 doc.setTextColor(150);
                 doc.text("No relationships found.", 14, yPos);
             } else {
                 const rels = [
                     ...table.relationships.incoming.map(r => ['Incoming (Parent)', r.sourceTable, `${r.sourceColumn} -> ${r.targetColumn}`]),
                     ...table.relationships.outgoing.map(r => ['Outgoing (Child)', r.targetTable, `${r.column} -> ${r.targetColumn}`])
                 ];

                 autoTable(doc, {
                     startY: yPos,
                     head: [['Direction', 'Related Table', 'Key Map']],
                     body: rels,
                     theme: 'striped',
                     headStyles: { fillColor: [0, 150, 136], textColor: 255 }, // Teal
                     styles: { fontSize: 8, cellPadding: 2 },
                     margin: { left: 14, right: 14 }
                 });
             }
        });

        doc.save('database-schema.pdf');
    };

    const filteredTables = schema.filter(t => 
        t.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Permission Check
    // We assume the route is protected, but good to check here too or just fail gracefully if API returns 403
    if (!schema && !loading) return <div>No Access or No Data</div>;

    return (
        <div className="flex flex-1 min-h-0 h-full overflow-hidden bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            {/* Sidebar List */}
            {activeTab !== "erd" && (
                <div className="w-64 flex-shrink-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                        {activeTab === "sql" ? "Run Select Query" : "Database Tables"} 
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-normal ml-2">
                            ({filteredTables.length})
                        </span>
                    </h2>
                    <input
                        type="text"
                        placeholder="Search tables..."
                        className="w-full px-3 py-2 text-sm border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="p-4 text-center text-gray-500 text-sm">Loading...</div>
                    ) : (
                        <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                            {filteredTables.map(table => (
                                <li key={table.name}>
                                    <button
                                        onClick={() => {
                                            setSelectedTable(table);
                                            const query = `SELECT * FROM ${table.name} LIMIT 50;`;
                                            if (activeTab === "sql") {
                                                handleRunQuery(query);
                                            } else {
                                                setSqlQuery(query);
                                            }
                                        }}
                                        className={`group w-full text-left px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                                            selectedTable?.name === table.name 
                                                ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-medium border-l-4 border-indigo-500" 
                                                : "text-gray-700 dark:text-gray-300 border-l-4 border-transparent"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="truncate mr-2 font-mono text-xs sm:text-sm">{table.name}</span>
                                            <div className="flex items-center flex-shrink-0">
                                                {activeTab === "sql" && (
                                                    <span className="mr-2 text-green-600 bg-green-50 dark:bg-green-900/30 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider opacity-70 group-hover:opacity-100">
                                                        Select
                                                    </span>
                                                )}
                                                <span className="text-xs text-gray-400">{table.columns.length} cols</span>
                                            </div>
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                    </div>

                {/* Help Section */}
                <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4 transition-all duration-300">
                    <button 
                        onClick={() => setShowHelp(!showHelp)}
                        className="flex items-center justify-between w-full text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none transition-colors"
                    >
                        <span className="flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            How to Read Schema
                        </span>
                        <span className="text-lg leading-none">{showHelp ? "−" : "+"}</span>
                    </button>
                    
                    {showHelp && (
                        <div className="mt-4 text-xs text-gray-600 dark:text-gray-400 space-y-4 animate-fadeIn">
                            <div>
                                <h4 className="font-semibold text-gray-900 dark:text-gray-200 mb-1">📌 Entities & Attributes</h4>
                                <p>Each <strong>Table</strong> represents an entity (e.g., User). <strong>Columns</strong> are attributes of that entity.</p>
                            </div>
                            
                            <div>
                                <h4 className="font-semibold text-gray-900 dark:text-gray-200 mb-1">🔗 Relationships</h4>
                                <p>Arrows in the diagram show connections between tables.</p>
                                <ul className="list-disc pl-4 mt-1 space-y-1">
                                    <li><span className="font-mono text-blue-600">↓</span> Incoming: Other tables reference this one (Parents).</li>
                                    <li><span className="font-mono text-green-600">↑</span> Outgoing: This table references others (Children/Foreign Keys).</li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-semibold text-gray-900 dark:text-gray-200 mb-1">🚫 Nullability</h4>
                                <div className="flex gap-2 mt-1">
                                    <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded border border-green-200 text-[10px]">REQ</span>
                                    <span>Required (Not Null)</span>
                                </div>
                                <div className="flex gap-2 mt-1">
                                    <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded border border-yellow-200 text-[10px]">NULL</span>
                                    <span>Optional (Nullable)</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 min-w-0 min-h-0 overflow-hidden relative flex flex-col bg-gray-50 dark:bg-gray-900">
                
                {/* Top Toolbar */}
                <div className="px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center shadow-sm z-10">
                    <div className="flex space-x-4">
                        <button
                            onClick={() => setActiveTab("schema")}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                                activeTab === "schema"
                                    ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"
                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                            }`}
                        >
                            Schema Visualizer
                        </button>
                        {hasPermission(user, "system:schema:query" as any) && (
                            <button
                                onClick={() => setActiveTab("sql")}
                                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                                    activeTab === "sql"
                                        ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"
                                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                }`}
                            >
                                SQL Runner (Read-Only)
                            </button>
                        )}
                        {hasPermission(user, "system:schema:erd" as any) && (
                            <button
                                onClick={() => setActiveTab("erd")}
                                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
                                    activeTab === "erd"
                                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-emerald-900/20 hover:text-emerald-600"
                                }`}
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" /></svg>
                                Global ER Diagram
                            </button>
                        )}
                    </div>

                    <div className="flex items-center space-x-3">
                        {/* Auto-Refresh Toggle */}
                         <button
                            onClick={() => setAutoRefresh(!autoRefresh)}
                            className={`p-2 rounded-full transition-colors ${
                                autoRefresh ? "text-green-600 bg-green-50 dark:bg-green-900/20" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            }`}
                            title={`Auto-Refresh: ${autoRefresh ? "ON (30s)" : "OFF"}`}
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </button>

                        <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline-block">
                           Updated: {lastRefreshed.toLocaleTimeString()}
                        </span>

                        <button
                            onClick={handleRefresh}
                            className="p-2 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors"
                            title="Refresh Schema"
                        >
                            <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        </button>
                        
                        {hasPermission(user, "system:schema:export:pdf" as any) && (
                            <button
                                onClick={handleDownloadSchemaPdf}
                                className="p-2 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors"
                                title="Download Full Schema PDF"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            </button>
                        )}

                        {activeTab === "schema" && selectedTable && hasPermission(user, "system:schema:export:image" as any) && (
                            <button
                                onClick={handleExportDiagram}
                                className="flex items-center space-x-2 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                <span>Export ER</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Content Body */}
                <div className="flex-1 min-h-0 overflow-hidden relative flex flex-col">
                    {activeTab === "sql" ? (
                        <div className="h-full flex flex-col p-6 overflow-y-auto">
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col h-full max-h-full">
                                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
                                    <h3 className="font-semibold text-gray-900 dark:text-white">Run SQL Query</h3>
                                    <span className="text-xs text-gray-500 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-2 py-1 rounded">Read-Only Mode</span>
                                </div>
                                
                                <div className="p-4 flex-none">
                                    <textarea
                                        value={sqlQuery}
                                        onChange={(e) => setSqlQuery(e.target.value)}
                                        className="w-full h-32 p-3 font-mono text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="SELECT * FROM users LIMIT 10;"
                                    />
                                    <div className="mt-3 flex justify-end">
                                        <button
                                            onClick={() => handleRunQuery()}
                                            disabled={isExecuting || !sqlQuery.trim()}
                                            className={`px-4 py-2 rounded-md text-white font-medium text-sm flex items-center ${
                                                isExecuting || !sqlQuery.trim()
                                                ? "bg-gray-400 cursor-not-allowed"
                                                : "bg-indigo-600 hover:bg-indigo-700"
                                            }`}
                                        >
                                            {isExecuting ? (
                                                <>
                                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                    Running...
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                    Run Query
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Results Area */}
                                <div className="flex-1 overflow-hidden flex flex-col border-t border-gray-200 dark:border-gray-700">
                                    {sqlError && (
                                        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm overflow-auto max-h-32">
                                            <strong>Error:</strong> {sqlError}
                                        </div>
                                    )}
                                    
                                    {sqlResults && (
                                        <div className="flex-1 flex flex-col overflow-hidden">
                                            <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 text-xs text-gray-500">
                                                {sqlResults.rowCount} rows returned
                                            </div>
                                            <div className="flex-1 overflow-auto">
                                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                                    <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                                                        <tr>
                                                            {sqlResults.data.length > 0 ? Object.keys(sqlResults.data[0]).map(key => (
                                                                <th key={key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">
                                                                    {key}
                                                                </th>
                                                            )) : <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Result</th>}
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                                        {sqlResults.data.map((row, idx) => (
                                                            <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                                {Object.values(row).map((val: any, cellIdx) => (
                                                                    <td key={cellIdx} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                                        {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                                                                    </td>
                                                                ))}
                                                            </tr>
                                                        ))}
                                                        {sqlResults.data.length === 0 && (
                                                            <tr>
                                                                <td colSpan={100} className="px-6 py-4 text-center text-sm text-gray-500 italic">No rows returned</td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {!sqlResults && !sqlError && (
                                        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm italic">
                                            Results will appear here
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : activeTab === "erd" ? (
                        <div className="flex-1 w-full h-full relative">
                            <GlobalERDiagram 
                                schema={schema} 
                                onNodeClick={(tableName) => {
                                    const t = schema.find(s => s.name === tableName);
                                    if(t) {
                                        setSelectedTable(t);
                                    }
                                }}
                                onNodeDoubleClick={(tableName) => {
                                    const t = schema.find(s => s.name === tableName);
                                    if(t) {
                                        setSelectedTable(t);
                                        setActiveTab("schema");
                                    }
                                }}
                            />
                        </div>
                    ) : selectedTable ? (
                        /* EXISTING SCHEMA VIEW CONTENT */
                        <div className="h-full flex-1 min-h-0 overflow-y-auto p-6">
                            <div className="max-w-6xl mx-auto" ref={diagramRef}>
                                {/* Header */}
                                <div className="mb-6">
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                                        <span className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg mr-3">
                                            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
                                        </span>
                                        {selectedTable.name}
                                    </h1>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 ml-12">
                                        Type: <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded">{selectedTable.type}</span>
                                    </p>
                                </div>

                                {/* Documentation / Annotation */}
                                <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">
                                            Documentation
                                        </h3>
                                        {!isEditingDesc && hasPermission(user, "system:schema:annotate" as any) && (
                                            <button 
                                                onClick={() => setIsEditingDesc(true)}
                                                className="text-xs text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center"
                                            >
                                                <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                Edit
                                            </button>
                                        )}
                                    </div>
                                    
                                    {isEditingDesc ? (
                                        <div className="space-y-3">
                                            <textarea
                                                value={descValue}
                                                onChange={(e) => setDescValue(e.target.value)}
                                                className="w-full text-sm p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-indigo-500 min-h-[200px] font-mono"
                                                placeholder={`# Purpose\nWhat this table is for...\n\n# Usage\nHow it is used in the system...\n\n# Relationships\nKey connections...`}
                                            />
                                            <p className="text-xs text-gray-500 italic flex justify-between">
                                                <span>Describe the table's role, key workflows, and relationships.</span>
                                                <span className={descValue.length > 500 ? "text-green-600" : "text-gray-400"}>
                                                    {descValue.length} chars
                                                </span>
                                            </p>
                                            <div className="flex justify-end space-x-2">
                                                <button 
                                                    onClick={() => { setIsEditingDesc(false); setDescValue(selectedTable.description || ""); }}
                                                    className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                                <button 
                                                    onClick={handleSaveDescription}
                                                    className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded transition-colors shadow-sm"
                                                >
                                                    Save Documentation
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap font-sans">
                                            {selectedTable.description ? (
                                                selectedTable.description
                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-8 text-center bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                                                    <span className="text-gray-400 italic mb-2">No documentation provided for this table.</span>
                                                    {!isEditingDesc && hasPermission(user, "system:schema:annotate" as any) && (
                                                        <button 
                                                            onClick={() => setIsEditingDesc(true)}
                                                            className="text-xs text-indigo-600 font-medium hover:underline"
                                                        >
                                                            + Add Description
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Two Column Layout: Schema & Relationships */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    
                                    {/* Column 1: Table Columns */}
                                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                                        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex justify-between items-center rounded-t-xl">
                                            <div>
                                                <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                                                    <span className="text-xl">📊</span> Structure
                                                </h3>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Column definitions and types</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                 <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-bold border border-indigo-100 dark:border-indigo-800 shadow-sm">
                                                    {selectedTable.columns.length} Columns
                                                 </span>
                                            </div>
                                        </div>
                                        <div className="overflow-x-auto max-h-[600px]">
                                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                                <thead className="bg-gray-50 dark:bg-gray-700/50 sticky top-0">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nullable</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Default</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                                    {selectedTable.columns.map((col, idx) => (
                                                        <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                            <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">
                                                                {col.column_name}
                                                            </td>
                                                            <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-mono text-xs">
                                                                {col.data_type}
                                                                {col.character_maximum_length ? `(${col.character_maximum_length})` : ''}
                                                            </td>
                                                            <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                                {col.is_nullable === 'YES' ? 
                                                                    <span className="text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400 px-1.5 py-0.5 rounded text-xs">NULL</span> : 
                                                                    <span className="text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-1.5 py-0.5 rounded text-xs">REQ</span>
                                                                }
                                                            </td>
                                                            <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-xs truncate max-w-[150px]" title={col.column_default || ""}>
                                                                {col.column_default || "-"}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Column 2: Relationships & Visual */}
                                    <div className="space-y-6">
                                        
                                        {/* Relationships Visualizer Card */}
                                        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl shadow-inner border border-slate-200 dark:border-slate-700 overflow-hidden relative">
                                            {/* Background Pattern */}
                                            <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
                                            
                                            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm flex justify-between items-center relative z-10">
                                                <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                                    <span className="text-xl">🕸️</span> Entity Relationships
                                                </h3>
                                                <span className="text-xs font-semibold px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded-full text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600 shadow-sm">
                                                    {selectedTable.relationships.incoming.length + selectedTable.relationships.outgoing.length} Connections
                                                </span>
                                            </div>

                                            <div className="p-8 relative z-10 min-h-[400px] flex flex-col justify-center items-center gap-8">
                                                
                                                {/* INCOMING (PARENTS) */}
                                                {selectedTable.relationships.incoming.length > 0 && (
                                                    <div className="flex flex-col items-center w-full animate-fadeIn">
                                                        <div className="flex flex-wrap justify-center gap-4 mb-2">
                                                            {selectedTable.relationships.incoming.map((rel, idx) => (
                                                                <button 
                                                                    key={`inc-${idx}`}
                                                                    onClick={() => {
                                                                        const t = schema.find(s => s.name === rel.sourceTable);
                                                                        if(t) setSelectedTable(t);
                                                                    }}
                                                                    className="group relative px-5 py-3 bg-white dark:bg-slate-800 border-l-4 border-l-blue-500 border-y border-r border-slate-200 dark:border-slate-600 rounded-r-lg shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all text-left min-w-[180px]"
                                                                    title={`View ${rel.sourceTable}`}
                                                                >
                                                                    <div className="flex items-center justify-between mb-1">
                                                                        <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded">Parent</span>
                                                                        <svg className="w-3 h-3 text-slate-400 group-hover:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                                                    </div>
                                                                    <div className="font-bold text-slate-800 dark:text-slate-100 text-sm">{rel.sourceTable}</div>
                                                                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
                                                                        {rel.sourceColumn} <span className="text-blue-400">➔</span> {rel.targetColumn}
                                                                    </div>
                                                                </button>
                                                            ))}
                                                        </div>
                                                        {/* Connector Visuals */}
                                                        <div className="flex flex-col items-center -mt-1">
                                                            <div className="h-6 w-px bg-gradient-to-b from-blue-400 to-indigo-500/50"></div>
                                                            <svg className="w-4 h-4 text-indigo-500/50 -mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* ACTIVE TABLE (CENTER) */}
                                                <div className="relative z-20 group cursor-default">
                                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
                                                    <div className="relative px-8 py-6 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-indigo-100 dark:border-slate-600 flex flex-col items-center min-w-[240px]">
                                                        <div className="absolute -top-4 bg-indigo-600 text-white p-2 rounded-xl shadow-lg border-2 border-white dark:border-slate-700">
                                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                                        </div>
                                                        <h2 className="text-xl font-black text-slate-800 dark:text-white mt-2 mb-1 tracking-tight">{selectedTable.name}</h2>
                                                        <div className="flex gap-2 mt-2">
                                                            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] uppercase font-bold rounded tracking-wide border border-slate-200 dark:border-slate-600">
                                                                {selectedTable.type}
                                                            </span>
                                                            <span className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 text-[10px] uppercase font-bold rounded tracking-wide border border-indigo-100 dark:border-indigo-800">
                                                                {selectedTable.columns.length} Cols
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* OUTGOING (CHILDREN) */}
                                                {selectedTable.relationships.outgoing.length > 0 && (
                                                    <div className="flex flex-col items-center w-full animate-fadeIn">
                                                        {/* Connector Visuals */}
                                                        <div className="flex flex-col items-center -mb-1">
                                                            <div className="h-6 w-px bg-gradient-to-b from-indigo-500/50 to-emerald-400"></div>
                                                            <svg className="w-4 h-4 text-emerald-500 -mt-2 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                                        </div>
                                                        
                                                        <div className="flex flex-wrap justify-center gap-4 mt-2">
                                                            {selectedTable.relationships.outgoing.map((rel, idx) => (
                                                                <button 
                                                                    key={`out-${idx}`}
                                                                    onClick={() => {
                                                                        const t = schema.find(s => s.name === rel.targetTable);
                                                                        if(t) setSelectedTable(t);
                                                                    }}
                                                                    className="group relative px-5 py-3 bg-white dark:bg-slate-800 border-l-4 border-l-emerald-500 border-y border-r border-slate-200 dark:border-slate-600 rounded-r-lg shadow-sm hover:shadow-lg hover:translate-y-1 transition-all text-left min-w-[180px]"
                                                                    title={`View ${rel.targetTable}`}
                                                                >
                                                                    <div className="flex items-center justify-between mb-1">
                                                                        <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded">Child</span>
                                                                        <svg className="w-3 h-3 text-slate-400 group-hover:text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                                                                    </div>
                                                                    <div className="font-bold text-slate-800 dark:text-slate-100 text-sm">{rel.targetTable}</div>
                                                                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
                                                                        {rel.column} <span className="text-emerald-400">➔</span> {rel.targetColumn}
                                                                    </div>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {selectedTable.relationships.incoming.length === 0 && selectedTable.relationships.outgoing.length === 0 && (
                                                    <div className="flex flex-col items-center text-slate-400 mt-4 px-8 py-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 w-full max-w-sm text-center">
                                                         <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full mb-3">
                                                             <svg className="w-8 h-8 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                                                         </div>
                                                         <span className="text-sm font-medium">No direct relationships detected</span>
                                                         <span className="text-xs mt-1">This table stands alone in the schema.</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-400">
                            Select a table to view schema
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DatabaseSchemaViewer;
