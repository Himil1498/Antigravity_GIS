
import type { Coordinates } from '../common/index';

// ===================================
// Geofencing
// ===================================

export interface GeofenceAction {
  type: 'notification' | 'webhook' | 'email' | 'log';
  configuration: Record<string, any>;
}

export interface GeofenceTrigger {
  id: string;
  event: 'enter' | 'exit' | 'dwell';
  minDwellTime?: number; // for dwell events
  actions: GeofenceAction[];
}

export interface Geofence {
  id: string;
  name: string;
  type: 'circle' | 'polygon';
  coordinates: Coordinates[];
  radius?: number; // for circle type
  isActive: boolean;
  triggers: GeofenceTrigger[];
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

