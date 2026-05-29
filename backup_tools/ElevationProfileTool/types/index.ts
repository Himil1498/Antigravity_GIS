import { ElevationProfile } from "../../../../../types/gisToolTypes/index";

export interface ElevationProfileToolProps {
  map: google.maps.Map | null;
  onSave?: (profile: ElevationProfile) => void;
  onClose?: () => void;
  containerStyle?: React.CSSProperties;
}

export interface ChartDataPoint {
  elevation: number;
  resolution: number;
  location: {
    lat: number;
    lng: number;
  };
  distance: number;
}

