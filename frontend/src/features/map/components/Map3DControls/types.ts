export interface Map3DControlsProps {
  map: google.maps.Map | null;
  controls: {
    reset: () => void;
    adjustTilt: (tilt: number) => void;
    rotate: (degrees: number) => void;
  } | null;
  onClose?: () => void;
  overlays?: Array<google.maps.Marker | google.maps.Polyline | google.maps.InfoWindow>;
}

export type MapType = 'satellite' | 'hybrid' | 'terrain';

