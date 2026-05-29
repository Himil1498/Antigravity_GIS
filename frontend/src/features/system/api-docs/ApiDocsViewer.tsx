import React, { useEffect, useState, useMemo } from 'react';
import { fetchApiDocs, ApiAnnotation, updateApiAnnotation } from '../../../services/apiDocsService';
import { useAppSelector } from '../../../store';
import { hasPermission } from '../../../utils/rbac/helpers';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
// Basic Toast Shim
const toast = {
  success: (msg: string) => console.log('Success:', msg),
  error: (msg: string) => console.error('Error:', msg)
};
// import { toast } from 'react-hot-toast';

const ApiDocsViewer: React.FC = () => {
    const [apis, setApis] = useState<ApiAnnotation[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'GET' | 'POST' | 'PUT' | 'DELETE' | 'ALL'>('ALL');
    const [editingApi, setEditingApi] = useState<ApiAnnotation | null>(null);
    const { user } = useAppSelector(state => state.auth);
    const [autoRefresh, setAutoRefresh] = useState(false);

    const canEdit = hasPermission(user, 'system:api:edit' as any);

    const handleDownloadPdf = () => {
        const doc = new jsPDF();
        
        // Title
        doc.setFontSize(22);
        doc.setTextColor(40, 40, 40);
        doc.text("API Documentation", 14, 20);
        
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
        doc.text(`Total Endpoints: ${filteredApis.length}`, 14, 35);
        
        doc.setDrawColor(200, 200, 200);
        doc.line(14, 38, 196, 38);

        let yPos = 45;

        filteredApis.forEach((api, index) => {
            // Check for page break
            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
            }

            const parsed = parseDescription(api.description);

            // Method & Path Header
            doc.setFillColor(245, 247, 250);
            doc.rect(14, yPos, 182, 12, 'F');
            doc.setDrawColor(220, 220, 220);
            doc.rect(14, yPos, 182, 12, 'S');
            
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            
            // Method Color Logic
            if (api.method === 'GET') doc.setTextColor(37, 99, 235);
            else if (api.method === 'POST') doc.setTextColor(22, 163, 74);
            else if (api.method === 'DELETE') doc.setTextColor(220, 38, 38);
            else if (api.method === 'PUT') doc.setTextColor(217, 119, 6);
            else doc.setTextColor(75, 85, 99);

            doc.text(api.method, 18, yPos + 8);
            
            doc.setTextColor(55, 65, 81);
            doc.text(api.path, 40, yPos + 8);
            
            yPos += 18;
            
            // Description Sections
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(0);

            const addSection = (title: string, content: string) => {
                if (!content) return;
                
                // Check page break for section
                if (yPos > 270) { doc.addPage(); yPos = 20; }

                doc.setFont("helvetica", "bold");
                doc.setTextColor(50, 50, 50);
                doc.text(title, 14, yPos);
                
                doc.setFont("helvetica", "normal");
                doc.setTextColor(80, 80, 80);
                const splitText = doc.splitTextToSize(content, 150);
                doc.text(splitText, 35, yPos);
                
                yPos += (splitText.length * 5) + 3;
            };

            if (parsed) {
                if(parsed.what) addSection("What:", parsed.what);
                if(parsed.why) addSection("Why:", parsed.why);
                if(parsed.where) addSection("Where:", parsed.where);
                if(parsed.how) addSection("How:", parsed.how);
                if(parsed.connects) addSection("Connects:", parsed.connects);
                if (parsed.other) addSection("Details:", parsed.other);
            } else {
                addSection("Description:", api.description || "No description.");
            }

            // Technical Details (Usage/Response)
             if (api.usage_example) {
                autoTable(doc, {
                    startY: yPos,
                    head: [['Usage Example']],
                    body: [[api.usage_example]],
                    theme: 'grid',
                    headStyles: { fillColor: [245, 245, 245], textColor: 50, fontStyle: 'bold', lineWidth: 0.1, lineColor: 200 },
                    styles: { font: 'courier', fontSize: 8, cellPadding: 3, overflow: 'linebreak', lineColor: 200 },
                    margin: { left: 14, right: 14 },
                });
                yPos = (doc as any).lastAutoTable.finalY + 6;
            }

            if (api.response_schema) {
                autoTable(doc, {
                    startY: yPos,
                    head: [['Response Schema']],
                    body: [[api.response_schema]],
                    theme: 'grid',
                    headStyles: { fillColor: [245, 245, 245], textColor: 50, fontStyle: 'bold', lineWidth: 0.1, lineColor: 200 },
                    styles: { font: 'courier', fontSize: 8, cellPadding: 3, overflow: 'linebreak', lineColor: 200 },
                    margin: { left: 14, right: 14 },
                });
                yPos = (doc as any).lastAutoTable.finalY + 12;
            } else {
                yPos += 10;
            }
        });

        doc.save('api-docs-full.pdf');
    };

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (autoRefresh) {
            interval = setInterval(() => {
                loadData(true); // silent refresh
            }, 30000);
        }
        return () => clearInterval(interval);
    }, [autoRefresh]);

    const loadData = async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            const data = await fetchApiDocs();
            setApis(data.apis);
        } catch (error) {
            console.error("Failed to load API docs", error);
            if (!silent) toast.error("Failed to load API documentation");
        } finally {
            if (!silent) setLoading(false);
        }
    };

    const handleSave = async (data: Partial<ApiAnnotation>) => {
        if (!editingApi) return;
        try {
            await updateApiAnnotation({
                method: editingApi.method,
                path: editingApi.path,
                ...data
            });
            toast.success("Documentation updated");
            
            // Optimistic update
            setApis(prev => prev.map(api => 
                (api.method === editingApi.method && api.path === editingApi.path) 
                ? { ...api, ...data, last_updated: new Date().toISOString() } 
                : api
            ));
            setEditingApi(null);
        } catch (error) {
            console.error(error);
            toast.error("Failed to save changes");
        }
    };

    const filteredApis = useMemo(() => {
        return apis.filter(api => {
            const matchesSearch = 
                api.path.toLowerCase().includes(searchTerm.toLowerCase()) || 
                (api.description || '').toLowerCase().includes(searchTerm.toLowerCase());
            const matchesTab = activeTab === 'ALL' || api.method === activeTab;
            return matchesSearch && matchesTab;
        });
    }, [apis, searchTerm, activeTab]);

    const getMethodColor = (method: string) => {
        switch (method) {
            case 'GET': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800';
            case 'POST': return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border-green-200 dark:border-green-800';
            case 'PUT': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300 border-orange-200 dark:border-orange-800';
            case 'DELETE': return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-800';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
        }
    };

    // Helper to parse description sections if they exist
    const parseDescription = (desc: string) => {
        if (!desc) return null;
        
        const sections = { what: '', why: '', connects: '', how: '', where: '', other: '' };
        
        const whatMatch = desc.match(/### What\s+([\s\S]*?)(?=###|$)/i);
        const whyMatch = desc.match(/### Why\s+([\s\S]*?)(?=###|$)/i);
        const connectsMatch = desc.match(/### Connects\s+([\s\S]*?)(?=###|$)/i);
        const howMatch = desc.match(/### How\s+([\s\S]*?)(?=###|$)/i);
        const whereMatch = desc.match(/### Where\s+([\s\S]*?)(?=###|$)/i);
        
        if (whatMatch) sections.what = whatMatch[1].trim();
        if (whyMatch) sections.why = whyMatch[1].trim();
        if (connectsMatch) sections.connects = connectsMatch[1].trim();
        if (howMatch) sections.how = howMatch[1].trim();
        if (whereMatch) sections.where = whereMatch[1].trim();
        
        if (!whatMatch && !whyMatch && !connectsMatch && !howMatch && !whereMatch) {
            sections.other = desc;
        }
        
        return sections;
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-8 animate-fadeIn">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <span className="text-4xl">⚡</span> 
                            API Documentation
                            <div className="ml-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm rounded-full font-mono border border-indigo-100 dark:border-indigo-800">
                                {filteredApis.length}
                            </div>
                        </h1>
                        <p className="text-base text-gray-500 dark:text-gray-400 mt-2 max-w-2xl">
                            Explore endpoints, integration guides, and data models. Documentation includes context on <span className="font-semibold text-indigo-500">What</span>, <span className="font-semibold text-pink-500">Why</span>, and <span className="font-semibold text-emerald-500">Connections</span>.
                        </p>
                    </div>
                    
                    {/* Search & Filter */}
                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-center">
                        <div className="flex items-center gap-2 mb-2 sm:mb-0">
                             <button
                                onClick={() => loadData()}
                                className={`p-2.5 rounded-xl border transition-all ${loading ? 'animate-spin bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-500 hover:text-indigo-600 hover:border-indigo-300 shadow-sm'}`}
                                title="Refresh Data"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                            </button>

                            {hasPermission(user, 'system:api:export' as any) && (
                                <button
                                    onClick={handleDownloadPdf}
                                    className="p-2.5 rounded-xl border bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-500 hover:text-indigo-600 hover:border-indigo-300 shadow-sm transition-all"
                                    title="Download PDF"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                </button>
                            )}
                            <input
                                type="text"
                                placeholder="Search endpoints..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2.5 w-full md:w-64 border rounded-xl dark:bg-gray-700/50 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
                            />
                            <svg className="absolute left-3 top-3 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <div className="flex bg-gray-100 dark:bg-gray-700/50 rounded-xl p-1 shadow-inner overflow-x-auto max-w-full">
                            {['ALL', 'GET', 'POST', 'PUT', 'DELETE'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab as any)}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                                        activeTab === tab 
                                        ? 'bg-white dark:bg-gray-600 shadow text-indigo-600 dark:text-white transform scale-105' 
                                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="space-y-6">
                {filteredApis.length === 0 ? (
                    <div className="text-center py-20 text-gray-500 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                        <p className="text-xl font-medium">No matching endpoints found.</p>
                        <p className="text-sm mt-2">Try adjusting your search or filters.</p>
                    </div>
                ) : filteredApis.map((api) => {
                    const parsedDesc = parseDescription(api.description);
                    const isEditing = editingApi?.path === api.path && editingApi?.method === api.method;
                    
                    return (
                        <div 
                            key={`${api.method}-${api.path}`}
                            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group"
                        >
                            {/* Header Row */}
                            <div className="p-5 flex flex-col sm:flex-row gap-4 border-b border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50">
                                <div className="flex-shrink-0 flex items-center">
                                    <span className={`px-3 py-1.5 rounded-lg text-sm font-black font-mono border shadow-sm ${getMethodColor(api.method)}`}>
                                        {api.method}
                                    </span>
                                </div>
                                <div className="flex-grow min-w-0 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <h3 
                                            className="font-mono text-lg font-semibold text-gray-800 dark:text-gray-100 cursor-pointer hover:text-indigo-600 transition-colors"
                                            onClick={() => {
                                                navigator.clipboard.writeText(api.path);
                                                toast.success("Endpoint copied!");
                                            }}
                                            title="Click to copy path"
                                        >
                                            {api.path}
                                        </h3>
                                        {api.last_updated && (
                                            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 uppercase tracking-wide">
                                                Verified
                                            </span>
                                        )}
                                    </div>
                                    
                                    {/* Actions */}
                                    {!isEditing && canEdit && (
                                        <button 
                                            onClick={() => setEditingApi(api)}
                                            className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-indigo-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
                                            title="Edit Documentation"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                                
                            {/* Body Content */}
                            <div className="p-6">
                                {isEditing ? (
                                    <EditForm 
                                        initialData={api} 
                                        onSave={handleSave} 
                                        onCancel={() => setEditingApi(null)} 
                                    />
                                ) : (
                                    <div className="space-y-6">
                                        {/* Structured Description */}
                                        {parsedDesc ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {parsedDesc.other ? (
                                                    <div className="md:col-span-2 prose dark:prose-invert text-sm text-gray-600 dark:text-gray-300">
                                                        {parsedDesc.other}
                                                    </div>
                                                ) : (
                                                    <>
                                                        {/* What */}
                                                        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800/50">
                                                            <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                                                <span className="text-lg">🎯</span> What
                                                            </h4>
                                                            <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                                                                {parsedDesc.what || "-"}
                                                            </p>
                                                        </div>

                                                        {/* Why */}
                                                        <div className="bg-pink-50 dark:bg-pink-900/20 p-4 rounded-xl border border-pink-100 dark:border-pink-800/50">
                                                            <h4 className="text-xs font-bold text-pink-600 dark:text-pink-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                                                <span className="text-lg">💡</span> Why
                                                            </h4>
                                                            <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                                                                {parsedDesc.why || "-"}
                                                            </p>
                                                        </div>

                                                        {/* Where (New) */}
                                                        <div className="bg-sky-50 dark:bg-sky-900/20 p-4 rounded-xl border border-sky-100 dark:border-sky-800/50">
                                                            <h4 className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                                                <span className="text-lg">📍</span> Where
                                                            </h4>
                                                            <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                                                                {parsedDesc.where || "-"}
                                                            </p>
                                                        </div>

                                                        {/* How (New) */}
                                                        <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-100 dark:border-amber-800/50">
                                                            <h4 className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                                                <span className="text-lg">�️</span> How
                                                            </h4>
                                                            <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                                                                {parsedDesc.how || "-"}
                                                            </p>
                                                        </div>

                                                        {/* Connects */}
                                                        <div className="md:col-span-2 bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800/50">
                                                            <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                                                <span className="text-lg">🔗</span> Connects
                                                            </h4>
                                                            <div className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                                                                {parsedDesc.connects || "-"}
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-500 italic">No description available.</p>
                                        )}
                                        
                                        {/* Technical Details */}
                                        {(api.usage_example || api.response_schema) && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                                                {api.usage_example && (
                                                    <div className="flex flex-col">
                                                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Request / Payload</div>
                                                        <div className="relative group/code">
                                                            <pre className="bg-gray-900 text-gray-50 p-4 rounded-xl text-xs font-mono overflow-x-auto shadow-inner h-full min-h-[100px] border border-gray-800">
                                                                {api.usage_example}
                                                            </pre>
                                                            <button 
                                                                className="absolute top-2 right-2 p-1.5 bg-gray-800 text-gray-400 rounded opacity-0 group-hover/code:opacity-100 transition-opacity hover:text-white"
                                                                onClick={() => {
                                                                    navigator.clipboard.writeText(api.usage_example || '');
                                                                    toast.success("Copied!");
                                                                }}
                                                            >
                                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                                {api.response_schema && (
                                                    <div className="flex flex-col">
                                                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Response Schema</div>
                                                        <div className="relative group/code">
                                                            <pre className="bg-gray-900 text-indigo-100 p-4 rounded-xl text-xs font-mono overflow-x-auto shadow-inner h-full min-h-[100px] border border-gray-800">
                                                                {api.response_schema}
                                                            </pre>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Scroll Controls */}
            <div className="fixed bottom-8 right-8 flex flex-col gap-3 z-50">
                <button 
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="p-3 bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 border border-gray-200 dark:border-gray-700 rounded-full shadow-lg hover:shadow-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all transform hover:scale-110 active:scale-95 group"
                    title="Scroll to Top"
                >
                    <svg className="w-6 h-6 group-hover:-translate-y-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                </button>
                <button 
                    onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
                    className="p-3 bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 border border-gray-200 dark:border-gray-700 rounded-full shadow-lg hover:shadow-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all transform hover:scale-110 active:scale-95 group"
                    title="Scroll to Bottom"
                >
                    <svg className="w-6 h-6 group-hover:translate-y-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                </button>
            </div>
        </div>
    );
};

const EditForm: React.FC<{ 
    initialData: ApiAnnotation; 
    onSave: (data: Partial<ApiAnnotation>) => void; 
    onCancel: () => void 
}> = ({ initialData, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        description: initialData.description,
        usage_example: initialData.usage_example,
        response_schema: initialData.response_schema
    });

    return (
        <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4 border border-indigo-100 dark:border-indigo-900/30 space-y-4 animate-fadeIn">
            <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full text-sm p-3 border rounded-xl dark:bg-gray-800 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 shadow-sm min-h-[200px] transition-all"
                    rows={8}
                    placeholder="Enter detailed description. You can use markdown headers like: ### What, ### Why, ### Connects, ### How, ### Where"
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Usage / Request Body (JSON)</label>
                    <textarea
                        value={formData.usage_example}
                        onChange={e => setFormData({...formData, usage_example: e.target.value})}
                        className="w-full text-xs font-mono p-2 border rounded dark:bg-gray-800 dark:border-gray-600 focus:ring-1 focus:ring-indigo-500"
                        rows={4}
                        placeholder={`{\n  "key": "value"\n}`}
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Response Schema (JSON)</label>
                    <textarea
                        value={formData.response_schema}
                        onChange={e => setFormData({...formData, response_schema: e.target.value})}
                        className="w-full text-xs font-mono p-2 border rounded dark:bg-gray-800 dark:border-gray-600 focus:ring-1 focus:ring-indigo-500"
                        rows={4}
                        placeholder={`{\n  "status": "success",\n  "data": [...]\n}`}
                    />
                </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
                <button 
                    onClick={onCancel}
                    className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                >
                    Cancel
                </button>
                <button 
                    onClick={() => onSave(formData)}
                    className="px-3 py-1.5 text-xs font-medium bg-indigo-600 text-white rounded hover:bg-indigo-700 shadow-sm"
                >
                    Save Documentation
                </button>
            </div>
        </div>
    );
}

export default ApiDocsViewer;