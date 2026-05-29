import { User } from '../../../types/auth/index';
import { parseUserId } from '../../../utils/userHelpers';

/**
 * Generate unique user ID in OCGID format (OptiConnect GIS ID)
 * Format: OCGID001, OCGID002, etc.
 */
export const generateUserId = (users: User[]): string => {
  const maxId = users.reduce((max, user) => {
    const num = parseUserId(user.id);
    return num > max && !isNaN(num) ? num : max;
  }, 0);
  return `OCGID${String(maxId + 1).padStart(3, '0')}`;
};

/**
 * Filter users based on search term, role, and status
 */
export const filterUsers = (
  users: User[],
  searchTerm: string,
  filterRole: string,
  filterStatus: string
): User[] => {
  return users.filter(user => {
    const matchesSearch = (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (user.username?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesRole = !filterRole || user.role === filterRole;
    const matchesStatus = !filterStatus || user.status === filterStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });
};


