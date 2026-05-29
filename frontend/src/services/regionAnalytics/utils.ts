
import { getAllRegionUsageStats } from './regionAnalyticsDataService';

/**
 * Export region analytics to CSV
 */
export const exportRegionAnalyticsCSV = (): string => {
  const stats = getAllRegionUsageStats();

  const headers = [
    'Region',
    'Total Accesses',
    'Successful Accesses',
    'Denied Accesses',
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

  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  return csv;
};

