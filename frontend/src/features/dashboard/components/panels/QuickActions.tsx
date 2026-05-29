import React from "react";
import { Link } from "react-router-dom";
import { 
  UploadCloud, 
  Map as MapIcon, 
  Search, 
  PlusCircle, 
  FileSearch, 
  Settings,
  ChevronRight,
  Zap
} from "lucide-react";

interface QuickActionProps {
  to: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  bg: string;
}

const QuickAction: React.FC<QuickActionProps> = ({ to, icon, title, description, color, bg }) => (
  <Link
    to={to}
    className="group flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-indigo-100 dark:hover:border-indigo-900/50 transition-all duration-300"
  >
    <div className={`p-3 rounded-xl ${bg} ${color} transition-transform group-hover:scale-110 shadow-sm`}>
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
        {title}
      </h4>
      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 md:line-clamp-1">
        {description}
      </p>
    </div>
    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 transition-all group-hover:translate-x-1 shrink-0" />
  </Link>
);

const QuickActions: React.FC = () => {
  return (
    <div className="bg-transparent space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 px-2">
        <div className="p-2 bg-gradient-to-br from-amber-400 to-orange-600 rounded-xl shadow-lg shadow-orange-500/20">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white uppercase tracking-wider">
            Quick Actions
          </h3>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
            Jump straight into your workspace
          </p>
        </div>
      </div>

      {/* Grid of actions */}
      <div className="grid grid-cols-1 gap-3">
        <QuickAction
          to="/map"
          icon={<PlusCircle className="w-5 h-5" />}
          title="Upload KMZ/KML"
          description="Open Network Planning Workspace"
          color="text-indigo-600 dark:text-indigo-400"
          bg="bg-indigo-50 dark:bg-indigo-900/20"
        />
        <QuickAction
          to="/map"
          icon={<MapIcon className="w-5 h-5" />}
          title="Network Search"
          description="Find specific POPs or routes on Main Map"
          color="text-blue-600 dark:text-blue-400"
          bg="bg-blue-50 dark:bg-blue-900/20"
        />
        <QuickAction
          to="/map"
          icon={<FileSearch className="w-5 h-5" />}
          title="Global Map View"
          description="View all active regions & network"
          color="text-emerald-600 dark:text-emerald-400"
          bg="bg-emerald-50 dark:bg-emerald-900/20"
        />
      </div>
    </div>
  );
};

export default QuickActions;
