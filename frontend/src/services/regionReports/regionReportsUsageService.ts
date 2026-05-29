
import { getAllRegionUsageStats, getUserRegionActivity } from '../regionAnalytics/index';

/**
 * Generate region usage report
 */
export const generateRegionUsageReport = (format: 'csv' | 'json' | 'xlsx'): string => {
  const stats = getAllRegionUsageStats();

  if (format === 'json') {
    return JSON.stringify(stats, null, 2);
  }

  // CSV format
  const headers = [
    'Region',
    'Total Accesses',
    'Successful',
    'Denied',
    'Unique Users',
    'Success Rate (%)',
    'Most Active User',
    'Last Accessed'
  ];

  const rows = stats.map(s => [
    s.region,
    s.totalAccesses.toString(),
    s.successfulAccesses.toString(),
    s.deniedAccesses.toString(),
    s.uniqueUsers.toString(),
    (s.totalAccesses > 0 ? (s.successfulAccesses / s.totalAccesses) * 100 : 0).toFixed(2),
    s.mostActiveUser?.userName || 'N/A',
    s.lastAccessed?.toISOString() || 'N/A'
  ]);

  return [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
};

/**
 * Generate user activity report
 */
export const generateUserActivityReport = (format: 'csv' | 'json' | 'xlsx'): string => {
  const activity = getUserRegionActivity();

  if (format === 'json') {
    return JSON.stringify(activity, null, 2);
  }

  // CSV format
  const headers = [
    'User Name',
    'Email',
    'Total Accesses',
    'Denied Attempts',
    'Regions Accessed',
    'Most Accessed Region',
    'Last Active'
  ];

  const rows = activity.map(a => [
    a.userName,
    a.userEmail,
    a.totalAccesses.toString(),
    a.deniedAttempts.toString(),
    a.regionsAccessed.join('; '),
    a.mostAccessedRegion || 'N/A',
    a.lastActive?.toISOString() || 'N/A'
  ]);

  return [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
};

/**
 * Generate access denials report
 */
export const generateAccessDenialsReport = (format: 'csv' | 'json' | 'xlsx'): string => {
  const stats = getAllRegionUsageStats();
  const denialsData = stats
    .filter(s => s.deniedAccesses > 0)
    .sort((a, b) => b.deniedAccesses - a.deniedAccesses);

  if (format === 'json') {
    return JSON.stringify(denialsData, null, 2);
  }

  // CSV format
  const headers = ['Region', 'Total Denials', 'Total Attempts', 'Denial Rate (%)', 'Unique Users Denied'];

  const rows = denialsData.map(s => [
    s.region,
    s.deniedAccesses.toString(),
    s.totalAccesses.toString(),
    (s.totalAccesses > 0 ? (s.deniedAccesses / s.totalAccesses) * 100 : 0).toFixed(2),
    s.uniqueUsers.toString()
  ]);

  return [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
};

