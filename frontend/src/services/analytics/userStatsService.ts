/**
 * User Statistics Service
 * Calculates and provides user statistics
 */

import type { User, UserStatistics } from "./types";
import { getRecentActivities } from "./activityService";

/**
 * Get user statistics
 */
export const getUserStatistics = (users: User[]): UserStatistics => {
  try {
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

    const activeUsers = users.filter((user) => {
      // Mock: Consider user active if they have recent activity
      const activities = getRecentActivities(100);
      return activities.some((a) => a.userId === user.id);
    });

    const loggedInUsers = users.filter((user) => {
      // Mock: Check session storage or activity timestamp
      return activeUsers.includes(user);
    });

    const newUsersThisWeek = users.filter((user) => {
      // Mock: Would check user.createdAt in production
      return Math.random() < 0.1; // 10% are new
    }).length;

    return {
      total: users.length,
      active: activeUsers.length,
      inactive: users.length - activeUsers.length,
      loggedIn: loggedInUsers.slice(0, 10), // Show max 10
      newThisWeek: newUsersThisWeek,
      trend: {
        daily: Array.from({ length: 7 }, () =>
          Math.floor(Math.random() * 30) + 10
        ),
        weekly: Array.from({ length: 4 }, () =>
          Math.floor(Math.random() * 100) + 50
        ),
        monthly: Array.from({ length: 12 }, () =>
          Math.floor(Math.random() * 300) + 100
        ),
      },
    };
  } catch (error) {
    console.error("Error getting user statistics:", error);
    return {
      total: 0,
      active: 0,
      inactive: 0,
      loggedIn: [],
      newThisWeek: 0,
      trend: {
        daily: [],
        weekly: [],
        monthly: [],
      },
    };
  }
};

