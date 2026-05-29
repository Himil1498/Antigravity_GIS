import {
  DistanceMeasurement
} from "../../../../../types/gisToolTypes/index";

export interface Point {
  lat: number;
  lng: number;
  label: string;
}

export interface Segment {
  distance: number;
  from: string;
  to: string;
}

export interface DistanceMeasurementToolProps {
  map: google.maps.Map | null;
  onSave?: (measurement: DistanceMeasurement) => void;
  onClose?: () => void;
  initialData?: {
    points: Array<Point>;
    segments?: Array<Segment>;
    totalDistance?: number;
    name?: string;
    description?: string;
  };
  containerStyle?: React.CSSProperties;
}

export interface NotificationState {
  isOpen: boolean;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
}

export interface ElevationDataPoint {
  elevation: number;
  resolution: number;
  location: {
    lat: number;
    lng: number;
  };
  distance: number;
}

