import { useState, useEffect } from 'react';
import type { User } from '../../../types/auth/index';
import type { GroupMember, GroupRegion } from '../../../services/group/index';
import {
  getGroupMembersAPI,
  getGroupPermissionsAPI,
  getGroupRegionsAPI,
} from '../../../services/group/index';
import { getAllUsers } from '../../../services/user/index';
import type { GroupDetailsData } from '../types/types';

export const useGroupDetails = (groupId: number): GroupDetailsData => {
  const [users, setUsers] = useState<User[]>([]);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [regions, setRegions] = useState<GroupRegion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const fetchedUsers = await getAllUsers();
        setUsers(fetchedUsers);

        const [membersData, permsData, regionsData] = await Promise.all([
          getGroupMembersAPI(groupId),
          getGroupPermissionsAPI(groupId),
          getGroupRegionsAPI(groupId),
        ]);

        setMembers(membersData);
        setPermissions(permsData.permissions);
        setRegions(regionsData);
      } catch (error) {
        console.error('Error loading group data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [groupId]);

  return {
    members,
    permissions,
    regions,
    users,
    isLoading,
  };
};


