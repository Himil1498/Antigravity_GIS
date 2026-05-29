import React, { useState } from "react";
import { useAppSelector } from "../store/index";
import PageContainer from "../components/ui/PageContainer";
import Footer from "../components/layout/Footer/index";
import {
  StaticInfrastructureCards,
  DashboardHeader,
  RecentUploads,
  NewNotifications,
  QuickActions,
  SystemHealthMonitor,
  LatestUpdatesPanel,
} from "../features/dashboard";
import { useDashboardData } from "../features/dashboard/hooks/useDashboardData";
import GlobalAnnouncement from "../components/ui/GlobalAnnouncement";

const Dashboard: React.FC = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [showAllUsers, setShowAllUsers] = useState(false);

  // Use the unified dashboard data hook
  const {
    handleRefresh,
    loading,
    lastRefresh,
    performanceData,
    performanceLoading,
    totalRegions,
  } = useDashboardData(showAllUsers);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Please log in to access the dashboard
          </h1>
        </div>
      </div>
    );
  }

  return (
    <PageContainer className="bg-gray-50 dark:bg-gray-900">
      <GlobalAnnouncement />
      <DashboardHeader
        loading={loading}
        onRefresh={handleRefresh}
        lastRefresh={lastRefresh}
        totalRegions={totalRegions}
      />

      {/* Main Content Areas */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-12">
        
        {/* Top Section: Infrastructure Grid & Sidebar Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* KPI Area (8/12) */}
          <div className="lg:col-span-8">
            <StaticInfrastructureCards />
          </div>

          {/* Sidebar Area (4/12) - Aligned parallel to KPI cards */}
          <div className="lg:col-span-4 space-y-8 lg:pt-[100px]">
            {/* Notifications Panel */}
            <section>
              <NewNotifications />
            </section>

            {/* Quick Actions */}
            <section>
              <QuickActions />
            </section>
          </div>
        </div>

        {/* Full-Width Body Content (Centered) */}
        <div className="w-full space-y-12">
          {/* Recent Uploads at 100% width */}
          <section className="min-h-[500px]">
            <RecentUploads />
          </section>

          {/* System Health & Latest Updates at 100% width */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <section>
              <SystemHealthMonitor 
                health={performanceData?.health || null} 
                loading={performanceLoading}
                onRefresh={handleRefresh}
              />
            </section>
            <section>
              <LatestUpdatesPanel />
            </section>
          </div>
        </div>

      </div>

      {/* Footer — full width, outside max-w wrapper */}
      <div className="mt-12">
        <Footer showDetails={true} position="relative" />
      </div>
    </PageContainer>
  );
};

export default Dashboard;
