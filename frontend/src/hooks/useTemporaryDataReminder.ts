/**
 * Hook for managing temporary data expiry reminders
 * Shows notifications every 30 minutes about temporary data that will expire soon
 */

import { useEffect, useCallback, useRef } from 'react';
import { getTemporaryData, isNearExpiry, getTimeRemaining, type TemporaryStorageItem } from '../services/temporaryStorage/index';
import { showToast } from '../utils/toastUtils';

interface UseTemporaryDataReminderProps {
  userId: string | undefined;
  isEnabled?: boolean;
}

export const useTemporaryDataReminder = ({
  userId,
  isEnabled = true
}: UseTemporaryDataReminderProps) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastNotificationRef = useRef<number>(0);

  const checkTemporaryDataExpiry = useCallback(() => {
    if (!userId || !isEnabled) return;

    try {
      const tempData = getTemporaryData(userId);

      if (tempData.length === 0) return;

      // Count items expiring soon (within 2 hours)
      const nearExpiryItems = tempData.filter(item => isNearExpiry(item));
      const totalItems = tempData.length;

      // Get items by tool type for detailed breakdown
      const itemsByType = tempData.reduce((acc, item) => {
        acc[item.toolType] = (acc[item.toolType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Create notification message
      let message = '';
      let toastType: 'info' | 'warning' | 'error' = 'info';

      if (nearExpiryItems.length > 0) {
        // Critical warning for items expiring soon
        toastType = 'error';
        message = `⚠️ ${nearExpiryItems.length} temporary item${nearExpiryItems.length > 1 ? 's' : ''} expiring soon! Transfer to permanent storage or they will be lost.`;

        // Show detailed breakdown for near-expiry items
        const nearExpiryBreakdown = nearExpiryItems.map(item =>
          `• ${item.name} (${item.toolType}) - ${getTimeRemaining(item)}`
        ).join('\n');

        console.log('🔥 Critical temporary data expiry warning:', {
          nearExpiryItems: nearExpiryItems.length,
          details: nearExpiryBreakdown
        });
      } else {
        // Regular reminder for all temporary data
        toastType = 'warning';
        message = `💾 You have ${totalItems} temporary item${totalItems > 1 ? 's' : ''} that will expire in 24h. Consider saving to permanent storage.`;

        // Show breakdown by tool type
        const typeBreakdown = Object.entries(itemsByType)
          .map(([type, count]) => `${type}: ${count}`)
          .join(', ');

        console.log('📋 Temporary data reminder:', {
          totalItems,
          breakdown: typeBreakdown
        });
      }

      // Show notification with appropriate severity
      switch (toastType) {
        case 'error':
          showToast.error(message);
          break;
        case 'warning':
          showToast.warning(message);
          break;
        default:
          showToast.info(message);
      }

      // Update last notification time
      lastNotificationRef.current = Date.now();

    } catch (error) {
      console.error('❌ Error checking temporary data expiry:', error);
    }
  }, [userId, isEnabled]);

  // Check if enough time has passed since last notification (30 minutes = 1800000ms)
  const shouldShowNotification = useCallback(() => {
    const now = Date.now();
    const timeSinceLastNotification = now - lastNotificationRef.current;
    const thirtyMinutes = 30 * 60 * 1000; // 30 minutes in milliseconds

    return timeSinceLastNotification >= thirtyMinutes;
  }, []);

  // Run check every 5 minutes, but only notify every 30 minutes
  useEffect(() => {
    if (!userId || !isEnabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Initial check after 1 minute to avoid startup noise
    const initialTimeout = setTimeout(() => {
      if (shouldShowNotification()) {
        checkTemporaryDataExpiry();
      }
    }, 60000); // 1 minute

    // Set up interval to check every 5 minutes
    intervalRef.current = setInterval(() => {
      if (shouldShowNotification()) {
        checkTemporaryDataExpiry();
      } else {
        // Still check for critical items even if we haven't hit 30min threshold
        if (!userId) return;

        try {
          const tempData = getTemporaryData(userId);
          const criticalItems = tempData.filter(item => {
            const remaining = item.expiresAt - Date.now();
            // Less than 1 hour remaining = critical
            return remaining < 60 * 60 * 1000;
          });

          if (criticalItems.length > 0) {
            showToast.error(`🚨 ${criticalItems.length} item${criticalItems.length > 1 ? 's' : ''} expiring in less than 1 hour!`);
          }
        } catch (error) {
          console.error('Error checking critical items:', error);
        }
      }
    }, 5 * 60 * 1000); // 5 minutes

    // Cleanup function
    return () => {
      clearTimeout(initialTimeout);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [userId, isEnabled, checkTemporaryDataExpiry, shouldShowNotification]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  // Manual trigger function for testing or immediate checks
  const triggerImmediateCheck = useCallback(() => {
    checkTemporaryDataExpiry();
  }, [checkTemporaryDataExpiry]);

  return {
    triggerImmediateCheck,
    isEnabled
  };
};

export default useTemporaryDataReminder;

