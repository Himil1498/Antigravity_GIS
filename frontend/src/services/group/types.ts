
import type { UserGroup } from '../../types/permissions/index';

export type { UserGroup };

// Re-export specific sub-types if they exist in permissions, 
// or define new ones here if needed for the service.
export interface GroupData extends Omit<UserGroup, 'id' | 'createdAt' | 'updatedAt'> {}
export interface GroupUpdateData extends Partial<Omit<UserGroup, 'id' | 'createdAt' | 'createdBy'>> {}


