import { useMemo } from "react";
import { User } from '../../../types/auth/index';
import { SortBy } from '../types/userStats.types';

interface UseUserFilteringParams {
  users: User[];
  searchTerm: string;
  sortBy: SortBy;
}

/**
 * Custom hook for filtering and sorting users
 */
export const useUserFiltering = ({
  users,
  searchTerm,
  sortBy,
}: UseUserFilteringParams): User[] => {
  return useMemo(() => {
    return users
      .filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.role.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        switch (sortBy) {
          case "name":
            return a.name.localeCompare(b.name);
          case "role":
            return a.role.localeCompare(b.role);
          case "recent":
            return (a.minutesSinceLogin || 0) - (b.minutesSinceLogin || 0);
          default:
            return 0;
        }
      });
  }, [users, searchTerm, sortBy]);
};

