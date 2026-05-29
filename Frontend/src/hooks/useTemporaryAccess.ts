import { useState, useEffect } from "react";
import { getMyActiveTemporaryAccess } from "../services/temporaryAccess/index";
import type { TemporaryRegionAccess } from '../types/temporaryAccess.types';

interface UseTemporaryAccessReturn {
  temporaryAccessCount: number;
  tempAccessGrants: TemporaryRegionAccess[];
}

export const useTemporaryAccess = (
  user: any,
  isAuthenticated: boolean
): UseTemporaryAccessReturn => {
  const [temporaryAccessCount, setTemporaryAccessCount] = useState(0);
  const [tempAccessGrants, setTempAccessGrants] = useState<
    TemporaryRegionAccess[]
  >([]);

  useEffect(() => {
    const fetchTemporaryAccess = async () => {
      // Skip if tab is hidden
      if (document.hidden) return;

      try {
        // Use the correct endpoint for regular users
        const activeAccess = await getMyActiveTemporaryAccess();

        // Filter out expired grants (double-check on frontend)
        const now = new Date();
        const validGrants = activeAccess.filter((grant) => {
          const expiresAt = new Date(grant.expiresAt);
          return expiresAt > now;
        });

        setTemporaryAccessCount(validGrants.length);
        setTempAccessGrants(validGrants);
      } catch (error) {
        console.error("Error fetching temporary access:", error);
        setTemporaryAccessCount(0);
        setTempAccessGrants([]);
      }
    };

    // Listen for region update events
    const handleRegionUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { userIds } = customEvent.detail;

      // Refresh if this user's regions were updated
      if (user && userIds.includes(user.id)) {
        console.log(
          "🔄 NavigationBar: Regions updated, refreshing temporary access..."
        );
        fetchTemporaryAccess();
      }
    };

    if (isAuthenticated && user) {
      fetchTemporaryAccess();

      // Add event listener for region updates
      window.addEventListener("userRegionsUpdated", handleRegionUpdate);

      // Refresh every 10 seconds for accurate countdown
      const interval = setInterval(fetchTemporaryAccess, 10000);

      return () => {
        window.removeEventListener("userRegionsUpdated", handleRegionUpdate);
        clearInterval(interval);
      };
    }
  }, [user, isAuthenticated]);

  return { temporaryAccessCount, tempAccessGrants };
};

