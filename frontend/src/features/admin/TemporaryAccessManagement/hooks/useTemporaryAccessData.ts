import { useEffect, useState } from "react";
import { getAllUsers } from "../../../../services/user/index";
import {
  getTemporaryAccess,
  getFilteredTemporaryAccess,
  getTemporaryAccessStats,
  getExpiringGrants,
} from "../../../../services/temporaryAccess/index";
import type {
  TemporaryRegionAccess,
  TemporaryAccessFilter,
} from "../../../../types/temporaryAccess.types";
import type { SimpleUser, AccessStats } from "../types/types";

export const useTemporaryAccessData = (
  currentUser: any,
  filterUserId: string,
  filterRegion: string,
  filterStatus: "all" | "active" | "expired" | "revoked"
) => {
  const [grants, setGrants] = useState<TemporaryRegionAccess[]>([]);
  const [users, setUsers] = useState<SimpleUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<AccessStats>({
    total: 0,
    active: 0,
    expired: 0,
    revoked: 0,
  });
  const [expiringGrants, setExpiringGrants] = useState<TemporaryRegionAccess[]>([]);

  const loadData = async () => {
    setLoading(true);

    try {
      try {
        const backendUsers = await getAllUsers();
        const mappedUsers: SimpleUser[] = backendUsers
          .filter(
            (u: any) =>
              u.id?.toString() !== currentUser?.id &&
              u.role !== "Admin" &&
              u.role !== "admin"
          )
          .map((u: any) => ({
            id: u.id?.toString() || u.user_id || "",
            username: u.username || "",
            name: u.full_name || u.name || u.username || "",
            email: u.email || "",
            role: u.role || "User",
            isActive: u.is_active !== undefined ? u.is_active : true,
          }));
        setUsers(mappedUsers);
      } catch (error: any) {
        console.error("Failed to load users:", error);
        if (error.response?.status !== 401) {
          setUsers([]);
        }
      }

      const filter: TemporaryAccessFilter = {};
      if (filterUserId) filter.userId = filterUserId;
      if (filterRegion) filter.region = filterRegion;
      if (filterStatus === "active") {
        filter.isActive = true;
      }

      try {
        let filteredGrants: TemporaryRegionAccess[];

        if (filterUserId || filterRegion || filterStatus !== "all") {
          filteredGrants = await getFilteredTemporaryAccess(filter);
        } else {
          filteredGrants = await getTemporaryAccess();
        }

        const now = new Date();
        if (filterStatus === "expired") {
          filteredGrants = filteredGrants.filter((g) => !g.revokedAt && g.expiresAt < now);
        } else if (filterStatus === "revoked") {
          filteredGrants = filteredGrants.filter((g) => g.revokedAt);
        }

        setGrants(filteredGrants);
      } catch (error) {
        console.error("Failed to load grants:", error);
        setGrants([]);
      }

      try {
        const tempStats = await getTemporaryAccessStats();
        setStats({
          total: tempStats.totalGrants,
          active: tempStats.activeGrants,
          expired: tempStats.expiredGrants,
          revoked: tempStats.revokedGrants,
        });
      } catch (error) {
        console.error("Failed to load stats:", error);
        setStats({ total: 0, active: 0, expired: 0, revoked: 0 });
      }

      try {
        const expiring = await getExpiringGrants(7);
        setExpiringGrants(expiring);
      } catch (error) {
        console.error("Failed to load expiring grants:", error);
        setExpiringGrants([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterUserId, filterRegion, filterStatus, currentUser]);

  return {
    grants,
    users,
    loading,
    setLoading,
    stats,
    expiringGrants,
    loadData,
  };
};


