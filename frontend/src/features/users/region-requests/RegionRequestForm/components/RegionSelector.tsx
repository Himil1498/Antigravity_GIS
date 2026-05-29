/**
 * Region Selector Component
 * Location: Frontend/src/features/users/region-requests/RegionRequestForm/components/RegionSelector.tsx
 */

import React from 'react';
import { MapIcon } from '@heroicons/react/24/outline';
import EnhancedSelect from '../../../../../components/ui/EnhancedSelect';
import { INDIAN_STATES } from '../../../../../utils/regionMapping/index';

interface RegionSelectorProps {
  selectedRegion: string;
  onRegionChange: (region: string) => void;
}

const RegionSelector: React.FC<RegionSelectorProps> = ({
  selectedRegion,
  onRegionChange
}) => {
  return (
    <div>
      <EnhancedSelect
        label="Select Region"
        value={selectedRegion}
        onChange={onRegionChange}
        options={INDIAN_STATES.map(state => ({
          value: state,
          label: state,
          icon: <MapIcon className="h-5 w-5" />
        }))}
        placeholder="-- Select Region --"
        required={true}
        searchable={true}
        icon={<MapIcon className="h-5 w-5" />}
      />
    </div>
  );
};

export default RegionSelector;

