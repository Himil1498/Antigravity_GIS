export interface CustomMapControlsProps {
  map: google.maps.Map | null;
  showMyLocation?: boolean;
  showCenterToIndia?: boolean;
  showMapTypeSwitch?: boolean;
}

export interface MapTypeSwitcherProps {
  currentType: string;
  onTypeChange: (type: string) => void;
}

export interface ControlButtonProps {
  onClick: () => void;
}

