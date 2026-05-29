import React from "react";
import { Circle, ChevronUp, X, Trash2 } from "lucide-react";
import InstructionBox from "./InstructionBox";
import ValidationStatus from "./ValidationStatus";
import CenterDetails from "./CenterDetails";
import RadiusControl from "./RadiusControl";
import GeometryStats from "./GeometryStats";
import StyleControls from "./StyleControls";
import NotificationDialog from "../../../../../components/ui/NotificationDialog";

interface CircleToolPanelProps {
  onCollapse?: () => void;
  onClose?: () => void;
  isPlacingCenter: boolean;
  isValidating?: boolean;
  center: { lat: number; lng: number } | null;
  radius: number;
  onRadiusChange: (radius: number) => void;
  formatDistance: (meters: number) => string;
  area: number;
  perimeter: number;
  formatArea: (sqMeters: number) => string;
  color: string;
  onColorChange: (color: string) => void;
  fillOpacity: number;
  onFillOpacityChange: (opacity: number) => void;
  onClear: () => void;
  notification?: {
    isOpen: boolean;
    type: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
  };
  onCloseNotification?: () => void;
  containerStyle?: React.CSSProperties;
  isEmbedded?: boolean;
}

const CircleToolPanel: React.FC<CircleToolPanelProps> = ({
  onCollapse,
  onClose,
  isPlacingCenter,
  isValidating = false,
  center,
  radius,
  onRadiusChange,
  formatDistance,
  area,
  perimeter,
  formatArea,
  color,
  onColorChange,
  fillOpacity,
  onFillOpacityChange,
  onClear,
  notification = { isOpen: false, type: 'info', title: '', message: '' },
  onCloseNotification = () => {},
  containerStyle,
  isEmbedded = false
}) => {
  const content = (
    <div className={`${isEmbedded ? "" : "flex-1 overflow-y-auto px-5 pb-5 pt-3 custom-scrollbar"}`}>
      <InstructionBox isPlacingCenter={isPlacingCenter} />
      {isValidating && <ValidationStatus isValidating={isValidating} />}
      <CenterDetails center={center} />

      {center && (
        <div className="space-y-3 mt-3">
          <RadiusControl
            radius={radius}
            onRadiusChange={onRadiusChange}
            formatDistance={formatDistance}
          />
          <GeometryStats
            area={area}
            perimeter={perimeter}
            formatArea={formatArea}
            formatDistance={formatDistance}
          />
          <StyleControls
            color={color}
            onColorChange={onColorChange}
            fillOpacity={fillOpacity}
            onFillOpacityChange={onFillOpacityChange}
          />
        </div>
      )}

      {!isEmbedded && (
        <NotificationDialog
          isOpen={notification.isOpen}
          onClose={onCloseNotification}
          type={notification.type}
          title={notification.title}
          message={notification.message}
          autoClose={true}
          autoCloseDelay={3000}
        />
      )}
    </div>
  );

  if (isEmbedded) return content;

  return (
    <div 
      className="absolute top-2 sm:top-3 left-4 w-[340px] max-h-[calc(100vh-32px)] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-[24px] shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-gray-200/50 dark:border-white/10 z-40 transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col overflow-hidden"
      style={containerStyle}
    >
      {/* Header - Standardized to match Catalog */}
      <div className="flex-shrink-0">
        <div className="flex items-center justify-between h-[56px] px-5 border-b border-slate-200/50 dark:border-slate-700/50">
          <h3 className="text-[14px] font-bold text-gray-900 dark:text-white flex items-center gap-3 tracking-tight">
            <div className="w-8 h-8 bg-gradient-to-b from-emerald-500 to-emerald-600 rounded-[10px] flex items-center justify-center shadow-[0_4px_12px_rgba(16,185,129,0.4)] border border-emerald-400/30">
              <Circle size={16} className="text-white" />
            </div>
            Circle/Radius Tool
          </h3>
          <div className="flex items-center gap-1">
            <button
              onClick={onClear}
              disabled={!center}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              title="Clear"
            >
              <Trash2 size={15} />
            </button>
            {onCollapse && (
              <button
                onClick={onCollapse}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition-all"
                title="Collapse"
              >
                <ChevronUp size={16} />
              </button>
            )}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-red-500 rounded-lg transition-all duration-300 group"
                title="Close"
              >
                <X size={16} className="transition-transform group-hover:rotate-90 group-hover:scale-110" />
              </button>
            )}
          </div>
        </div>
      </div>
      {content}
    </div>
  );
};

export default CircleToolPanel;
