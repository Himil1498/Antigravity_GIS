/**
 * Custom hook for loading user's assigned regions
 */

import { useState, useEffect } from 'react';
import { useAppSelector } from '../../../../../store/index';
import { getUserAssignedRegions } from '../../../../../utils/regionMapping/index';

export const useAssignedRegions = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [assignedRegions, setAssignedRegions] = useState<string[]>([]);

  useEffect(() => {
    const loadRegions = async () => {
      if (user) {
        const regions = await getUserAssignedRegions(user);
        setAssignedRegions(regions);
      }
    };
    loadRegions();
  }, [user]);

  return { assignedRegions };
};

