
import { getAuditLogs } from '../audit/index';
import { UserRegionActivity } from './types';

/**
 * Get user region activity
 */
export const getUserRegionActivity = (): UserRegionActivity[] => {
  const logs = getAuditLogs();
  const regionLogs = logs.filter(
    log => log.eventType === 'REGION_ACCESS_GRANTED' || log.eventType === 'REGION_ACCESS_DENIED'
  );

  const userMap = new Map<string, UserRegionActivity>();

  regionLogs.forEach(log => {
    if (!userMap.has(log.userId)) {
      userMap.set(log.userId, {
        userId: log.userId,
        userName: log.userName,
        userEmail: log.userEmail,
        regionsAccessed: [],
        totalAccesses: 0,
        deniedAttempts: 0,
        mostAccessedRegion: '',
        lastActive: undefined
      });
    }

    const activity = userMap.get(log.userId)!;
    activity.totalAccesses++;

    if (log.eventType === 'REGION_ACCESS_GRANTED') {
      if (log.region && !activity.regionsAccessed.includes(log.region)) {
        activity.regionsAccessed.push(log.region);
      }
    } else {
      activity.deniedAttempts++;
    }

    if (!activity.lastActive || log.timestamp > activity.lastActive) {
      activity.lastActive = log.timestamp;
    }
  });

  // Calculate most accessed region for each user
  userMap.forEach((activity, userId) => {
    const userLogs = regionLogs.filter(
      log => log.userId === userId && log.eventType === 'REGION_ACCESS_GRANTED'
    );

    const regionCount = new Map<string, number>();
    userLogs.forEach(log => {
      if (log.region) {
        regionCount.set(log.region, (regionCount.get(log.region) || 0) + 1);
      }
    });

    let maxCount = 0;
    let mostAccessedRegion = '';

    regionCount.forEach((count, region) => {
      if (count > maxCount) {
        maxCount = count;
        mostAccessedRegion = region;
      }
    });

    activity.mostAccessedRegion = mostAccessedRegion;
  });

  return Array.from(userMap.values()).sort((a, b) => b.totalAccesses - a.totalAccesses);
};

