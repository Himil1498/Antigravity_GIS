/**
 * TypeScript type definitions for SectorRFTool feature
 */

export interface SectorRFToolProps {
  map: google.maps.Map | null;
  onSave?: (sector: any) => void;
  onClose?: () => void;
  containerStyle?: React.CSSProperties;
}

export interface SectorCenter {
  lat: number;
  lng: number;
}

export type TechnologyType = '2G' | '3G' | '4G' | '5G' | 'Wi-Fi' | 'Other';
export type SectorStatus = 'Active' | 'Inactive' | 'Planned' | 'Testing';
export type StorageType = 'permanent' | 'temporary';

export interface NotificationState {
  isOpen: boolean;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
}

export interface PresetOption {
  label: string;
  value: number;
}

