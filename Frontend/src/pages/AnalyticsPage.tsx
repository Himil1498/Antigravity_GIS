import React from "react";
import { DashboardLayout } from "../features/dashboard";

/**
 * Analytics Page - Phase 7
 * Dashboard & Analytics with KPIs for ALL users across the platform
 *
 * Shows aggregated infrastructure statistics for all users from Backend DB:
 * - All 8 infrastructure categories (POP, Sub POP, BTS-CO-LO, Bandwidth BTS, Office Location, NNI, Data Center, Customer)
 * - Total counts across ALL users (not just logged-in user)
 * - Status information (Active, Inactive, Maintenance, Planned, RFS, Damaged)
 * - Real-time data updates from database
 *
 * Uses DashboardLayout with showAllUsersData={true} to fetch ALL users' infrastructure data
 */
const AnalyticsPage: React.FC = () => {
  return <DashboardLayout showAllUsersData={true} />;
};

export default AnalyticsPage;

