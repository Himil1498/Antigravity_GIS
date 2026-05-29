
import * as userService from './userService';

/**
 * User Service Module
 * Handles API interactions, data transformation, and business logic for Users.
 */

export * from './userService';
export * from './types';
export * from './adminService';
export * from './userPermissionService';
export * from './userMapPreferencesService';
// Optionally export specific utils if other services need them
export { extractNumericId, mapBackendRole, mapFrontendRole } from './utils';

export { default as adminService } from './adminService';
export { default as userPermissionService } from './userPermissionService';
export { default as userMapPreferencesService } from './userMapPreferencesService';

// Default export for backward compatibility
export default userService;

