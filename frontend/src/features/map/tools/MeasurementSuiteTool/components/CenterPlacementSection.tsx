/**
 * Center Placement Section
 * Displays instruction banner for placing tower location
 */

import React from 'react';

interface CenterPlacementSectionProps {
  isPlacingCenter: boolean;
}

const CenterPlacementSection: React.FC<CenterPlacementSectionProps> = ({ isPlacingCenter }) => {
  if (!isPlacingCenter) return null;

  return (
    <div className="mb-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
      <p className="text-sm text-blue-800 dark:text-blue-200">
        📍 Click on the map to place the tower location
      </p>
    </div>
  );
};

export default CenterPlacementSection;

