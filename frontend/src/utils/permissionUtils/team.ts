
import type { User } from '../../types/auth/index';

/**
 * Check if resource belongs to user's team
 * (Helper for team-based permissions)
 */
export function isTeamMember(
  userId: string,
  teamMemberIds: string[]
): boolean {
  return teamMemberIds.includes(userId);
}

/**
 * Get user's team members (users under same manager)
 */
export function getTeamMembers(user: User): string[] {
  try {
    const storedUsers = localStorage.getItem('users');
    if (!storedUsers) return [];

    const allUsers: User[] = JSON.parse(storedUsers);

    // Users with same manager (assignedUnder) are considered team members
    const managers = user.assignedUnder;
    if (!managers || managers.length === 0) return [];

    return allUsers
      .filter(u =>
        u.id !== user.id &&
        u.assignedUnder.some(m => managers.includes(m))
      )
      .map(u => u.id);
  } catch (error) {
    console.error('Failed to get team members:', error);
    return [];
  }
}

