import { useState, useEffect, useMemo } from 'react';
import { getAllRegions, Region } from '../services/region/index';
import { showToast } from '../utils/toastUtils';

export const useRegionManagement = () => {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');


  const fetchRegions = async () => {
    try {
      setLoading(true);
      const response = await getAllRegions();
      setRegions(response.regions || []);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch regions:', err);
      setError('Failed to load regions. Please make sure you are logged in.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegions();
  }, []);



  const filteredRegions = useMemo(() => {
    return regions.filter(region => {
      const matchesSearch = region.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           region.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || region.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [regions, searchTerm, filterType]);

  const regionTypes = useMemo(() => {
    return ['all', ...Array.from(new Set(regions.map(r => r.type)))];
  }, [regions]);

  const clearFilters = () => {
    setSearchTerm('');
    setFilterType('all');
  };

  return {
    regions,
    loading,
    error,
    selectedRegion,
    setSelectedRegion,
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    fetchRegions,
    filteredRegions,
    regionTypes,
    clearFilters
  };
};
