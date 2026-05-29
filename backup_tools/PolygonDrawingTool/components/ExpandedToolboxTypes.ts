export interface ExpandedToolboxProps {
  vertices: Array<{ lat: number; lng: number }>;
  area: number;
  perimeter: number;
  color: string;
  fillOpacity: number;
  isDrawing: boolean;
  saving: boolean;
  onColorChange: (color: string) => void;
  onOpacityChange: (opacity: number) => void;
  onUndoLastVertex: () => void;
  onCompleteDrawing: () => void;
  onClearAll: () => void;
  onStartDrawing: () => void;
  onSave: () => void;
  onCollapse: () => void;
  onClose?: () => void;
  containerStyle?: React.CSSProperties;
}

