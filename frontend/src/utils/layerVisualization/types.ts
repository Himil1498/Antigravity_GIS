
import type { DataHubEntry } from "../../types/gisToolTypes/index";

export interface LayerOverlay {
  id: string;
  type: string;
  overlay: google.maps.MVCObject;
  entry?: DataHubEntry;
}

