
import * as regionCoreService from './regionCoreService';
import * as regionBoundaryService from './regionBoundaryService';
import * as regionBoundaryVersionService from './regionBoundaryVersionService';
import * as publicBoundaryService from './publicBoundaryService';

export * from './types';
export * from './regionCoreService';
export * from './regionBoundaryService';
export * from './regionBoundaryVersionService';
export * from './publicBoundaryService';

export { default as publicBoundaryService } from './publicBoundaryService';

// Default export to match legacy service structure
export default {
  ...regionCoreService,
  ...regionBoundaryService,
  ...regionBoundaryVersionService,
  ...publicBoundaryService.default
};

