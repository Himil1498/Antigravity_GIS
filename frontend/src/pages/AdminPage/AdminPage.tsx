import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, Variants } from "framer-motion";
import { useAppSelector } from "../../store/index";
import { rolesMatch } from "../../utils/userHelpers";
import { usePermission } from "../../hooks/usePermission";
import PageContainer from "../../components/ui/PageContainer";
import AdminPageHeader from "./components/layout/AdminPageHeader";
import AdminTabNavigation from "./components/layout/AdminTabNavigation";
import AdminTabContent from "./components/layout/AdminTabContent";
import { adminTabs, type AdminTab } from "./components/layout/adminTabs";

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAppSelector((state) => state.auth);
  const { can, isAdmin } = usePermission();

  // Define icon variants for hover consistency
  const iconVariants: Variants = {
    idle: { scale: 1, rotate: 0, y: 0 },
    hover: { 
      scale: 1.15, 
      rotate: [0, -10, 10, 0],
      y: [0, -2, 0],
      transition: { duration: 0.4 }
    }
  };

  // Read initial tab from URL, fallback to "password-reset"
  const tabFromUrl = (searchParams.get("tab") as AdminTab) || "password-reset";
  const [activeTab, setActiveTab] = useState<AdminTab>(tabFromUrl);

  // Consolidated Tab sync: Prevents infinite re-renders & Framer layout shaking
  useEffect(() => {
    const urlTab = searchParams.get("tab") as AdminTab;

    if (!urlTab) {
      // No tab in URL — set default without triggering sync effect
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set("tab", activeTab);
          return next;
        },
        { replace: true }
      );
      return;
    }

    // Sync state from URL only when they differ
    if (urlTab !== activeTab) {
      setActiveTab(urlTab);
    }
  }, [searchParams]); // ← Only depend on searchParams, NOT activeTab


  // Check if user has permission to view admin page (granular)
  const canAccessAdminPage = isAdmin || can("admin:view");

  // Filter tabs based on permissions
  const availableTabs = React.useMemo(() => {
    if (!user) return [];

    return adminTabs.filter((tab) => {
      // If user is Admin role, show all
      if (isAdmin) return true;

      // If no permission required, show it
      if (!tab.requiredPermission) return true;

      return can(tab.requiredPermission);
    });
  }, [user, isAdmin, can]);

  // Update document title for context (Breadcrumb logic)
  useEffect(() => {
    const activeTabData = availableTabs.find(t => t.id === activeTab);
    const tabName = activeTabData ? activeTabData.name : "Management";
    document.title = `${tabName} | Admin | OptiConnect GIS`;
    
    return () => {
      document.title = "OptiConnect GIS";
    };
  }, [activeTab, availableTabs]);

  // Handle tab click — update state AND URL
  const handleTabClick = (tabId: AdminTab) => {
    setActiveTab(tabId);
    setSearchParams(
      (prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.set("tab", tabId);
        return newParams;
      },
      { replace: true }
    );
  };

  // Update active tab if current active tab is not in available tabs
  React.useEffect(() => {
    if (
      availableTabs.length > 0 &&
      !availableTabs.find((t) => t.id === activeTab)
    ) {
      const fallbackTab = availableTabs[0].id;
      setActiveTab(fallbackTab);
      setSearchParams(
        (prev) => {
          const newParams = new URLSearchParams(prev);
          newParams.set("tab", fallbackTab);
          return newParams;
        },
        { replace: true }
      );
    }
  }, [availableTabs, activeTab, setSearchParams]);

  if (!canAccessAdminPage) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <motion.div 
            className="flex-shrink-0 cursor-pointer flex justify-center mb-4"
            initial="idle"
            whileHover="hover"
          >
            <div className="h-10 w-10 rounded-lg bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center shadow-sm">
              <motion.svg
                variants={iconVariants}
                className="h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </motion.svg>
            </div>
          </motion.div>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            Access Denied
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            You must be an administrator to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <PageContainer>
      <div className="bg-gray-50 dark:bg-gray-900 min-h-full flex flex-col transition-colors duration-200">
        {/* Header */}
        <AdminPageHeader />

        {/* Tabs */}
        <AdminTabNavigation
          tabs={availableTabs}
          activeTab={activeTab}
          onTabClick={handleTabClick}
        />

        {/* Tab Content */}
        <div className="max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">
          {/* Tab Description */}
          <div className="mb-6">
            {availableTabs
              .filter((t) => t.id === activeTab)
              .map((tab) => (
                <motion.div
                  key={tab.id}
                  initial="idle"
                  whileHover="hover"
                  className={`
                  ${tab.bgColor} 
                  border-l-4 ${tab.borderColor}
                  rounded-lg p-4 shadow-sm
                  transform transition-all duration-300 ease-out
                `}
                >
                  <div className="flex items-start gap-3">
                    <motion.div 
                      variants={iconVariants}
                      className={`${tab.iconColor} mt-0.5 flex-shrink-0`}
                    >
                      {tab.icon}
                    </motion.div>
                    <div className="flex-1">
                      <h3
                        className={`text-sm font-semibold ${tab.iconColor} mb-1`}
                      >
                        {tab.name}
                      </h3>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {tab.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
          </div>

          {/* Content */}
          <AdminTabContent activeTab={activeTab} />
        </div>
      </div>
    </PageContainer>
  );
};

export default AdminPage;

