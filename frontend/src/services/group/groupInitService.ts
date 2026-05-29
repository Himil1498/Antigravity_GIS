
import type { GroupData } from './types';
import { getAllGroups } from './groupStorage';
import { createGroup } from './groupCoreService';

/**
 * Initialize with sample groups (for development)
 */
export function initializeSampleGroups(currentUserId: string): void {
  const existing = getAllGroups();
  if (existing.length > 0) {
    return; // Already initialized
  }

  const sampleGroups: GroupData[] = [
    {
      name: 'Field Engineers - Maharashtra',
      description: 'Field engineers working in Maharashtra region',
      permissions: [
        'gis.distance.use',
        'gis.distance.save',
        'gis.polygon.use',
        'gis.polygon.save',
        'gis.circle.use',
        'gis.circle.save',
        'gis.elevation.use',
        'gis.elevation.save',
        'data.view.own',
        'data.edit.own',
        'search.use'
      ],
      assignedRegions: ['Maharashtra'],
      members: [],
      managers: [currentUserId],
      isActive: true,
      createdBy: currentUserId
    },
    {
      name: 'Data Analysts',
      description: 'Analysts with view and export permissions',
      permissions: [
        'data.view.all',
        'data.export',
        'search.use',
        'search.history.view'
      ],
      assignedRegions: [],
      members: [],
      managers: [currentUserId],
      isActive: true,
      createdBy: currentUserId
    },
    {
      name: 'Infrastructure Team',
      description: 'Team managing infrastructure assets',
      permissions: [
        'gis.infrastructure.use',
        'gis.infrastructure.save',
        'gis.infrastructure.delete.own',
        'gis.infrastructure.import',
        'data.view.own',
        'data.edit.own',
        'search.use'
      ],
      assignedRegions: [],
      members: [],
      managers: [currentUserId],
      isActive: true,
      createdBy: currentUserId
    }
  ];

  sampleGroups.forEach(groupData => createGroup(groupData));
}

