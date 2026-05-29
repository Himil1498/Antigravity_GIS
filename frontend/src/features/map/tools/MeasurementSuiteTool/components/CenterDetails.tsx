import React from "react";

interface CenterDetailsProps {
  center: { lat: number; lng: number } | null;
}

const CenterDetails: React.FC<CenterDetailsProps> = ({ center }) => {
  if (!center) return null;

  return (
    <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
        Center
      </div>
      <div className="text-sm font-mono text-gray-900 dark:text-white">
        {center.lat.toFixed(6)}, {center.lng.toFixed(6)}
      </div>
    </div>
  );
};

export default CenterDetails;

