import { useState, useEffect, useMemo } from "react";
import { INDIA_ADMIN_REGIONS } from "../../../shared/constants/india-regions";
import { RegionOption } from "../components/Shared/MultiSelectDropdown";
import { apiClient } from "../../../services/api/client";

interface ApiRegion {
  id: number;
  name: string;
  code: string;
}

const fetchRegions = async (): Promise<ApiRegion[]> => {
  try {
    const response = await apiClient.get("/regions");
    // console.log("Fetched Regions:", response.data);
    return (response.data as any).regions || [];
  } catch (e) {
    console.error("Failed to fetch regions", e);
  }
  return [];
};

export const useCatalogRegions = (
  token: string | null,
  externalRegionId?: number | null,
  onRegionSelect?: (
    lat: number,
    lng: number,
    zoom: number,
    regionIds: number[] | null,
  ) => void,
) => {
  const [apiRegions, setApiRegions] = useState<ApiRegion[]>([]);
  const [selectedRegionIds, setSelectedRegionIds] = useState<number[]>([]);

  // Fetch Regions
  useEffect(() => {
    if (token) {
      fetchRegions().then(setApiRegions);
    }
  }, [token]);

  // Construct options
  const regionOptions: RegionOption[] = useMemo(() => {
    return apiRegions.map((r) => {
      const constRegion = INDIA_ADMIN_REGIONS.find((c) => c.name === r.name);
      return {
        id: r.id,
        name: r.name,
        lat: constRegion?.lat || 20.5937,
        lng: constRegion?.lng || 78.9629,
        zoom: constRegion?.zoom || 4,
      };
    });
  }, [apiRegions]);

  // Sync with external
  useEffect(() => {
    if (externalRegionId !== undefined && externalRegionId !== null) {
      setSelectedRegionIds([externalRegionId]);
    } else if (externalRegionId === null) {
      setSelectedRegionIds([]);
    }
  }, [externalRegionId]);

  const handleRegionChange = (newIds: number[]) => {
    setSelectedRegionIds(newIds);

    // Calculate View
    let lat = 20.5937,
      lng = 78.9629,
      zoom = 4;

    if (newIds.length === 1) {
      const region = regionOptions.find((r) => r.id === newIds[0]);
      if (region) {
        lat = region.lat;
        lng = region.lng;
        zoom = region.zoom;
      }
    }

    if (onRegionSelect) {
      onRegionSelect(lat, lng, zoom, newIds.length > 0 ? newIds : null);
    }
  };

  return {
    regionOptions,
    selectedRegionIds,
    handleRegionChange,
  };
};

