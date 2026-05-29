import { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../../../store/index";
import { updateUser } from "../../../store/slices/authSlice";
import { getUserAssignedRegions } from "../../../utils/regionMapping/index";
import { getUserById } from "../../../services/user/index";
import { getMyActiveTemporaryAccess } from "../../../services/temporaryAccess/index";
import type { TemporaryAccessInfo } from "../../../types/auth/index";

export const useMapUser = () => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const [assignedRegions, setAssignedRegions] = useState<string[]>([]);
  const [userFilter, setUserFilter] = useState<"me" | "all" | "user">("me");
  const [selectedUserId, setSelectedUserId] = useState<number | undefined>(undefined);

  // Get user's assigned regions (including temporary access)
  useEffect(() => {
    const fetchRegions = async () => {
      if (user) {
        const regions = await getUserAssignedRegions(user);
        setAssignedRegions(regions);
      } else {
        console.warn("⚠️ No user found, cannot fetch assigned regions");
      }
    };

    // Fetch fresh user data from backend and update Redux
    const refreshUserData = async () => {
      if (!user) return;

      try {
        const freshUser = await getUserById(user.id);
        const activeAccess = await getMyActiveTemporaryAccess();

        const temporaryAccessInfo: TemporaryAccessInfo[] = activeAccess.map(
          (grant) => {
            const now = new Date();
            const expiresAt = new Date(grant.expiresAt);
            const total_seconds = Math.max(
              0,
              Math.floor((expiresAt.getTime() - now.getTime()) / 1000)
            );
            const expired = total_seconds <= 0;

            const days = Math.floor(total_seconds / 86400);
            const hours = Math.floor((total_seconds % 86400) / 3600);
            const minutes = Math.floor((total_seconds % 3600) / 60);
            const seconds = total_seconds % 60;

            let display = expired ? "Expired" : "";
            if (!expired) {
              if (days > 0) display = `${days}d ${hours}h`;
              else if (hours > 0) display = `${hours}h ${minutes}m`;
              else if (minutes > 0) display = `${minutes}m ${seconds}s`;
              else display = `${seconds}s`;
            }

            return {
              ...grant,
              grantedByName: grant.grantedByName || "Unknown",
              secondsRemaining: total_seconds,
              timeRemaining: {
                expired,
                display,
                days,
                hours,
                minutes,
                seconds,
                total_seconds,
              },
            };
          }
        );

        dispatch(
          updateUser({
            assignedRegions: freshUser.assignedRegions,
            temporaryAccess: temporaryAccessInfo,
          })
        );

        const allRegions = Array.from(
          new Set([
            ...freshUser.assignedRegions,
            ...temporaryAccessInfo.map((t) => t.region),
          ])
        );
        setAssignedRegions(allRegions);
      } catch (error) {
        console.error("Error refreshing user data for map:", error);
        await fetchRegions();
      }
    };

    const handleRegionUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { userIds } = customEvent.detail;
      if (user && userIds.includes(user.id)) {
        refreshUserData();
      }
    };

    fetchRegions();
    window.addEventListener("userRegionsUpdated", handleRegionUpdate);

    return () => {
      window.removeEventListener("userRegionsUpdated", handleRegionUpdate);
    };
  }, [user, dispatch]);

  return {
    user,
    assignedRegions,
    userFilter,
    setUserFilter,
    selectedUserId,
    setSelectedUserId,
  };
};

