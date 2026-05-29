import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { apiService } from "../../../../services/api/index";
import { 
  Search, 
  Map as MapIcon, 
  UploadCloud, 
  FileCode, 
  FileJson, 
  Database, 
  FileText,
  MousePointer2,
  ExternalLink,
  Loader2
} from "lucide-react";

interface UploadedFile {
  id: number;
  name: string;
  file_type: string;
  icon_type: string | null;
  feature_count: number;
  created_at: string;
  folder_id: number | null;
  folder_name: string | null;
  category: string | null;
}

/** Get color/icon config based on file type */
const getFileTypeConfig = (fileType: string, iconType: string | null) => {
  const type = (iconType || fileType || "").toLowerCase();
  
  if (type.includes("kml") || type.includes("kmz"))
    return {
      gradient: "from-emerald-400 to-teal-500",
      glow: "shadow-emerald-400/30",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      text: "text-emerald-600 dark:text-emerald-400",
      border: "border-emerald-200 dark:border-emerald-800/50",
      dot: "bg-emerald-400",
      label: "KML",
      icon: <FileCode className="w-4 h-4" />,
    };
    
  if (type.includes("geojson") || type.includes("json"))
    return {
      gradient: "from-violet-400 to-purple-600",
      glow: "shadow-violet-400/30",
      bg: "bg-violet-50 dark:bg-violet-900/20",
      text: "text-violet-600 dark:text-violet-400",
      border: "border-violet-200 dark:border-violet-800/50",
      dot: "bg-violet-400",
      label: "GeoJSON",
      icon: <FileJson className="w-4 h-4" />,
    };
    
  if (type.includes("shp") || type.includes("shapefile"))
    return {
      gradient: "from-amber-400 to-orange-500",
      glow: "shadow-amber-400/30",
      bg: "bg-amber-50 dark:bg-amber-900/20",
      text: "text-amber-600 dark:text-amber-400",
      border: "border-amber-200 dark:border-amber-800/50",
      dot: "bg-amber-400",
      label: "SHP",
      icon: <Database className="w-4 h-4" />,
    };
    
  if (type.includes("csv") || type.includes("xlsx") || type.includes("excel"))
    return {
      gradient: "from-teal-400 to-cyan-500",
      glow: "shadow-teal-400/30",
      bg: "bg-teal-50 dark:bg-teal-900/20",
      text: "text-teal-600 dark:text-teal-400",
      border: "border-teal-200 dark:border-teal-800/50",
      dot: "bg-teal-400",
      label: "CSV",
      icon: <FileText className="w-4 h-4" />,
    };
    
  return {
    gradient: "from-blue-400 to-indigo-600",
    glow: "shadow-blue-400/30",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-800/50",
    dot: "bg-blue-400",
    label: fileType?.toUpperCase()?.slice(0, 4) || "FILE",
    icon: <FileCode className="w-4 h-4" />,
  };
};

/** Format relative time from ISO string */
const getRelativeTime = (dateStr: string): string => {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const RecentUploads: React.FC = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFiles = useMemo(() => {
    return files.filter(file => 
      file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.folder_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [files, searchQuery]);

  useEffect(() => {
    const fetchUploads = async () => {
      try {
        const response = await apiService.get("/analytics/recent-uploads?limit=10");
        if (response.data?.success) {
          setFiles(response.data.data || []);
        }
      } catch (error) {
        console.error("Error fetching recent uploads:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUploads();
    const interval = setInterval(fetchUploads, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col shadow-xl shadow-gray-200/40 dark:shadow-black/20 h-full">
      {/* Header Area */}
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
              <UploadCloud className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                My Recent Uploads
              </h3>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium mt-0.5">
                Manage your last {files.length} GIS imports
              </p>
            </div>
          </div>
          
          <div className="hidden sm:block">
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search recent uploads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50 rounded-xl text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all"
          />
        </div>
      </div>

      {/* Content List */}
      <div className="flex-1 overflow-y-auto px-3 pb-4 custom-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-gray-300 dark:text-gray-600" />
            </div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">No results found</p>
            <p className="text-xs text-gray-500 mt-1">Try a different search term</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {filteredFiles.map((file) => {
              const config = getFileTypeConfig(file.file_type, file.icon_type);
              return (
                <div 
                  key={file.id}
                  className="group relative flex items-center gap-4 p-3.5 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800/70 border border-transparent hover:border-gray-100 dark:hover:border-gray-700/50 transition-all duration-200"
                >
                  {/* File Gradient Icon */}
                  <div className={`relative w-12 h-12 rounded-2xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-md ${config.glow} scale-100 group-hover:scale-105 transition-transform shrink-0`}>
                    <div className="text-white drop-shadow-sm">{config.icon}</div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                       <h4 className="text-[13.5px] font-bold text-gray-900 dark:text-white truncate">
                        {file.name}
                      </h4>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${config.bg} ${config.text} border ${config.border}`}>
                        {config.label}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                        <MousePointer2 className="w-3 h-3" />
                        <span>{file.feature_count.toLocaleString()} features</span>
                      </div>
                      {file.folder_name && (
                        <div className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500 italic">
                          <span>in {file.folder_name}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Area */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="text-[10px] text-gray-400 dark:text-gray-600 font-bold tabular-nums">
                      {getRelativeTime(file.created_at)}
                    </span>
                    
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                      <Link 
                        to={`/network-planning?folderId=${file.folder_id || ''}&fileId=${file.id}`}
                        className="p-1.5 bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-800 dark:hover:bg-gray-100 hover:text-white dark:hover:text-gray-900 transition-all"
                        title="Open in Hub"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sticky Bottom Blur */}
      {!loading && filteredFiles.length > 4 && (
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white dark:from-gray-900 to-transparent pointer-events-none" />
      )}
    </div>
  );
};

export default RecentUploads;