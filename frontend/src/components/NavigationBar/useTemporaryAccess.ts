import { useState, useEffect } from "react";
import { getMyActiveTemporaryAccess } from "../../services/temporaryAccess/index";
import type { TemporaryRegionAccess } from '../../types/temporaryAccess.types';

interface UseTemporaryAccessProps {
  userId?: string;
  isAuthenticated: boolean;
}

export const useTemporaryAccess = ({ userId, isAuthenticated }: UseTemporaryAccessProps) => {
  const [temporaryAccessCount, setTemporaryAccessCount] = useState(0);
  const [tempAccessGrants, setTempAccessGrants] = useState<TemporaryRegionAccess[]>([]);

  useEffect(() => {
    const fetchTemporaryAccess = async () => {
      try {
        const activeAccess = await getMyActiveTemporaryAccess();

        // Filter out expired grants (double-check on frontend)
        const now = new Date();
        const validGrants = activeAccess.filter((grant: TemporaryRegionAccess) => {
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
      if (userId && userIds.includes(userId)) {
        console.log(
          "🔄 NavigationBar: Regions updated, refreshing temporary access..."
        );
        fetchTemporaryAccess();
      }
    };

    if (isAuthenticated && userId) {
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
  }, [userId, isAuthenticated]);

  return {
    temporaryAccessCount,
    tempAccessGrants
  };
};

