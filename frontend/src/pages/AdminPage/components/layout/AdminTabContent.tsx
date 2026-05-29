/**
 * Admin Tab Content Component
 * Renders the appropriate admin component based on the active tab
 */

import React from "react";
import type { AdminTab } from "./adminTabs";
import AuditLogViewer from "../../../../features/admin/AuditLogViewer";
import RegionRequestManagement from "../../../../features/admin/RegionRequestManagement/index";
import BulkRegionAssignment from "../../../../features/admin/BulkRegionAssignment";
import TemporaryAccessManagement from "../../../../features/admin/TemporaryAccessManagement";
import RegionReportsExport from "../../../../features/admin/RegionReports";
import PasswordResetRequests from "../../../../features/admin/PasswordResetRequests/PasswordResetRequests";
import BoundaryManagement from "../../../../features/admin/BoundaryManagement/index";
import RoleManagement from "../../../../features/admin/RoleManagement";
import SystemUpdatesManagement from "../../../../features/admin/SystemUpdatesManagement/SystemUpdatesManagement";

import { DatabaseManagement } from "../DatabaseManagement";
import DataManagementTab from "../DataManagementTab";

interface AdminTabContentProps {
  activeTab: AdminTab;
}

const AdminTabContent: React.FC<AdminTabContentProps> = ({ activeTab }) => {
  return (
    <div className="bg-transparent">
      {activeTab === "audit-logs" && <AuditLogViewer />}
      {activeTab === "region-requests" && <RegionRequestManagement />}
      {activeTab === "bulk-assignment" && <BulkRegionAssignment />}
      {activeTab === "temporary-access" && <TemporaryAccessManagement />}
      {activeTab === "reports" && <RegionReportsExport />}
      {activeTab === "password-reset" && <PasswordResetRequests />}
      {activeTab === "region-boundaries" && <BoundaryManagement />}
      {activeTab === "database" && <DatabaseManagement />}
      {activeTab === "data-management" && <DataManagementTab />}
      {activeTab === "role-management" && <RoleManagement />}
      {activeTab === "system-updates" && <SystemUpdatesManagement />}
    </div>
  );
};

export default AdminTabContent;

