import { GISToolsService } from './gisToolsService';

// Export singleton instance
export const gisToolsService = new GISToolsService();

// Export individual services for direct access
export const distanceMeasurementService = gisToolsService.distanceMeasurements;
export const polygonDrawingService = gisToolsService.polygonDrawings;
export const circleDrawingService = gisToolsService.circleDrawings;
export const sectorRFService = gisToolsService.sectorRF;
export const elevationProfileService = gisToolsService.elevationProfiles;
export const inventoryService = gisToolsService.inventory;

// Export types and classes
export * from './types';
export * from './distanceMeasurementService';
export * from './polygonDrawingService';
export * from './circleDrawingService';
export * from './sectorRFService';
export * from './elevationProfileService';
export * from './inventoryService';
export * from './gisToolsService';

