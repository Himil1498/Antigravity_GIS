import React, { lazy } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import ProtectedRoute from "../components/ui/ProtectedRoute";
import { useAppSelector } from "../store/index";
import { hasPermission } from "../utils/permissionUtils/checks";

// 🚀 PERFORMANCE: Lazy-loaded pages for code splitting
// Heavy pages that benefit most from lazy loading
const MapPage = lazy(() => import("../pages/MapPage/MapPage"));
const AdminPage = lazy(() => import("../pages/AdminPage/AdminPage"));
const AnalyticsPage = lazy(() => import("../pages/AnalyticsPage"));
const DarkFiberLayout = lazy(
  () => import("../pages/DarkFiberPage/DarkFiberLayout"),
);
const NetworkPlanningPage = lazy(() => import("../pages/NetworkPlanningPage"));
const Dashboard = lazy(() => import("../pages/Dashboard"));

// Medium pages
const UsersPage = lazy(() => import("../pages/UsersPage"));
const GroupsManagement = lazy(() => import("../pages/GroupsManagement"));
const SecurityPage = lazy(() => import("../features/auth/pages/SecurityPage"));
const NotificationsPage = lazy(
  () => import("../pages/NotificationsPage/NotificationsPage"),
);
const UserProfile = lazy(() => import("../pages/UserProfile"));
const FlowDiagramPage = lazy(
  () => import("../features/flow-diagrams/components/viewer/FlowDiagramPage"),
);
const PasswordResetRequests = lazy(
  () => import("../features/admin/PasswordResetRequests"),
);

// Light pages (still benefit from code splitting)
const LoginPage = lazy(() => import("../features/auth/pages/LoginPage"));
const EmailVerificationPage = lazy(
  () => import("../features/auth/pages/EmailVerificationPage"),
);
const ResendVerificationPage = lazy(
  () => import("../features/auth/pages/ResendVerificationPage"),
);
const RegionRequestForm = lazy(
  () => import("../features/users/region-requests/RegionAccessRequestForm"),
);

const ComingSoonPage = lazy(
  () => import("../pages/ComingSoonPage/ComingSoonPage"),
);

const KeyboardShortcutsPage = lazy(
  () => import("../pages/KeyboardShortcutsPage/KeyboardShortcutsPage"),
);

const DatabaseSchemaViewer = lazy(
  () => import("../features/system/schema/DatabaseSchemaViewer"),
);

const ApiDocsViewer = lazy(
  () => import("../features/system/api-docs/ApiDocsViewer"),
);

const ServerArchitecturePage = lazy(
  () => import("../pages/ServerArchitecturePage/ServerArchitecturePage"),
);

const LoginWorkflowGuidePage = lazy(() =>
  import("../pages/LoginWorkflowGuidePage/LoginWorkflowGuidePage").then(
    (module) => ({ default: module.default }),
  ),
);
const PlatformInterfaceGuidePage = lazy(() =>
  import("../pages/PlatformInterfaceGuidePage/PlatformInterfaceGuidePage").then(
    (module) => ({ default: module.default }),
  ),
);
const DashboardGuidePage = lazy(() =>
  import("../pages/DashboardGuidePage/DashboardGuidePage").then((module) => ({
    default: module.DashboardGuidePage,
  })),
);
const MapOperationsGuidePage = lazy(() =>
  import("../pages/MapOperationsGuidePage/MapOperationsGuidePage").then(
    (module) => ({ default: module.default }),
  ),
);
const NetworkPlanningGuidePage = lazy(() =>
  import("../pages/NetworkPlanningGuidePage/NetworkPlanningGuidePage").then(
    (module) => ({ default: module.default }),
  ),
);
const UsersGuidePage = lazy(() =>
  import("../features/interactive-guides/Users/UsersGuidePage").then(
    (module) => ({ default: module.UsersGuidePage }),
  ),
);
const AdminGuidePage = lazy(() =>
  import("../features/interactive-guides/Admin/AdminGuidePage").then(
    (module) => ({ default: module.AdminGuidePage }),
  ),
);
const GroupsGuidePage = lazy(() =>
  import("../features/interactive-guides/Groups/GroupsGuidePage").then(
    (module) => ({ default: module.GroupsGuidePage }),
  ),
);
const AnalyticsGuidePage = lazy(() =>
  import("../features/interactive-guides/Analytics/AnalyticsGuidePage").then(
    (module) => ({ default: module.AnalyticsGuidePage }),
  ),
);
const ToolsGuidePage = lazy(() =>
  import("../features/interactive-guides/Tools/ToolsGuidePage").then(
    (module) => ({ default: module.ToolsGuidePage }),
  ),
);

const UserWorkflowsPage = lazy(
  () => import("../pages/UserWorkflowsPage/UserWorkflowsPage"),
);

const InteractiveMapGuidePage = lazy(
  () => import("../pages/InteractiveMapGuidePage/InteractiveMapGuidePage"),
);

const ToolsLayout = lazy(
  () => import("../features/tools/components/layout/ToolsLayout"),
);
const ExcelKmlPage = lazy(() => import("../features/tools/pages/ExcelKmlPage"));
const KmlExcelPage = lazy(() => import("../features/tools/pages/KmlExcelPage"));
const KmlKmzConverterPage = lazy(
  () => import("../features/tools/pages/KmlKmzConverterPage"),
);
const KmlViewerPage = lazy(
  () => import("../features/tools/pages/KmlViewerPage"),
);
const IconGallery = lazy(() => import("../pages/IconGallery"));

const AppRoutes: React.FC = () => {
  const location = useLocation();
  const isMapRoute = location.pathname === "/map";
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  // Check if user has map permission (same logic as ProtectedRoute)
  const canViewMap =
    isAuthenticated &&
    user &&
    (user.role === "superadmin" ||
      String(user.role).toLowerCase() === "admin" ||
      hasPermission(user, "map:view"));

  // Track if MapPage has ever been activated (lazy mount on first visit)
  const mapMountedRef = React.useRef(false);
  if (isMapRoute && canViewMap) mapMountedRef.current = true;

  return (
    <>
      {/* Persistent Map Page — stays mounted once visited, hidden via CSS when on other routes */}
      {mapMountedRef.current && canViewMap && (
        <div
          style={{
            display: isMapRoute ? "block" : "none",
            position: isMapRoute ? "relative" : "absolute",
            width: "100%",
            height: "100%",
          }}
        >
          <MapPage />
        </div>
      )}

      <Routes>
        <Route path="/login" element={<LoginPage />} />
        {/* Guide Routes */}
        <Route path="/login-guide" element={<LoginWorkflowGuidePage />} />
        <Route path="/verify-email" element={<EmailVerificationPage />} />
        <Route
          path="/resend-verification"
          element={<ResendVerificationPage />}
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        {/* Map Route: ProtectedRoute handles auth redirect when not logged in.
          When canViewMap is true, the persistent div above takes visual priority.
          This Route acts as a fallback for unauthenticated users. */}
        <Route
          path="/map"
          element={
            <ProtectedRoute requiredPermission="map:view">
              {/* If persistent map is already mounted, don't render a duplicate */}
              {!mapMountedRef.current ? <MapPage /> : null}
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute requiredPermission="users:view">
              <main className="pt-16">
                <UsersPage />
              </main>
            </ProtectedRoute>
          }
        />
        <Route
          path="/groups"
          element={
            <ProtectedRoute requiredPermission="groups:view">
              <GroupsManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredPermission="admin:view">
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/password-reset-requests"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <PasswordResetRequests />
            </ProtectedRoute>
          }
        />
        {/* Notifications - Accessible to ALL authenticated users */}
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <main className="pt-16">
                <NotificationsPage />
              </main>
            </ProtectedRoute>
          }
        />
        {/* Legacy admin route - redirect to new route */}
        <Route
          path="/admin/notifications"
          element={<Navigate to="/notifications" replace />}
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute requiredPermission="analytics:view">
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tools"
          element={
            <ProtectedRoute requiredPermission="converter:view">
              <ToolsLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="excel-to-kml" replace />} />
          <Route path="excel-to-kml" element={<ExcelKmlPage />} />
          <Route path="kml-to-excel" element={<KmlExcelPage />} />
          <Route path="viewer" element={<KmlViewerPage />} />
          <Route path="kml-kmz" element={<KmlKmzConverterPage />} />
        </Route>
        <Route
          path="/dark-fiber"
          element={
            <ProtectedRoute requiredPermission="darkfiber:view">
              <main className="pt-16 h-screen bg-gray-50 dark:bg-gray-900">
                <DarkFiberLayout />
              </main>
            </ProtectedRoute>
          }
        />
        <Route
          path="/network-planning"
          element={
            <ProtectedRoute requiredPermission="network:view">
              <main className="pt-16 h-screen bg-gray-50 dark:bg-gray-900">
                <NetworkPlanningPage />
              </main>
            </ProtectedRoute>
          }
        />
        <Route
          path="/user-guide"
          element={
            <ProtectedRoute>
              <main className="pt-16">
                <FlowDiagramPage />
              </main>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/request-region"
          element={
            <ProtectedRoute>
              <main className="pt-16">
                <RegionRequestForm />
              </main>
            </ProtectedRoute>
          }
        />
        <Route
          path="/security"
          element={
            <ProtectedRoute>
              <SecurityPage />
            </ProtectedRoute>
          }
        />

        {/* Coming Soon Pages */}
        <Route
          path="/coming-soon"
          element={
            <ProtectedRoute>
              <ComingSoonPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/keyboard-shortcuts"
          element={
            <ProtectedRoute>
              <KeyboardShortcutsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/system/schema"
          element={
            <ProtectedRoute requiredPermission="system:schema:view">
              <main className="pt-16 h-screen flex flex-col">
                <DatabaseSchemaViewer />
              </main>
            </ProtectedRoute>
          }
        />
        <Route
          path="/system/api-docs"
          element={
            <ProtectedRoute requiredPermission="system:api:view">
              <main className="pt-16 min-h-screen bg-gray-50 dark:bg-gray-900">
                <ApiDocsViewer />
              </main>
            </ProtectedRoute>
          }
        />
        <Route
          path="/server-architecture"
          element={
            <ProtectedRoute requiredPermission="system:architecture:view">
              <main className="pt-16 h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 flex flex-col">
                <ServerArchitecturePage />
              </main>
            </ProtectedRoute>
          }
        />
        <Route
          path="/user-workflows"
          element={
            <ProtectedRoute>
              <main className="pt-16 min-h-screen bg-gray-50 dark:bg-gray-900">
                <UserWorkflowsPage />
              </main>
            </ProtectedRoute>
          }
        />
        <Route
          path="/login-guide"
          element={
            <ProtectedRoute>
              <main className="pt-16 min-h-screen bg-gray-50 dark:bg-gray-900">
                <LoginWorkflowGuidePage />
              </main>
            </ProtectedRoute>
          }
        />
        <Route
          path="/interface-guide"
          element={
            <ProtectedRoute>
              <main className="pt-16 min-h-screen bg-gray-50 dark:bg-gray-900">
                <PlatformInterfaceGuidePage />
              </main>
            </ProtectedRoute>
          }
        />
        <Route
          path="/map-operations-guide"
          element={
            <ProtectedRoute>
              <main className="pt-16 min-h-screen bg-gray-50 dark:bg-gray-900">
                <MapOperationsGuidePage />
              </main>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard-guide"
          element={
            <ProtectedRoute>
              <main className="pt-16 min-h-screen bg-gray-50 dark:bg-gray-900">
                <DashboardGuidePage />
              </main>
            </ProtectedRoute>
          }
        />
        <Route
          path="/network-planning-guide"
          element={
            <ProtectedRoute>
              <main className="pt-16 min-h-screen bg-gray-50 dark:bg-gray-900">
                <NetworkPlanningGuidePage />
              </main>
            </ProtectedRoute>
          }
        />
        <Route
          path="/users-guide"
          element={
            <ProtectedRoute>
              <main className="pt-16 min-h-screen bg-gray-50 dark:bg-gray-900">
                <UsersGuidePage />
              </main>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-guide"
          element={
            <ProtectedRoute>
              <main className="pt-16 min-h-screen bg-gray-50 dark:bg-gray-900">
                <AdminGuidePage />
              </main>
            </ProtectedRoute>
          }
        />
        <Route
          path="/groups-guide"
          element={
            <ProtectedRoute>
              <main className="pt-16 min-h-screen bg-gray-50 dark:bg-gray-900">
                <GroupsGuidePage />
              </main>
            </ProtectedRoute>
          }
        />
        <Route
          path="/map-guide"
          element={
            <ProtectedRoute>
              <main className="pt-16 min-h-screen bg-gray-50 dark:bg-gray-900">
                <InteractiveMapGuidePage />
              </main>
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics-guide"
          element={
            <ProtectedRoute>
              <main className="pt-16 min-h-screen bg-gray-50 dark:bg-gray-900">
                <AnalyticsGuidePage />
              </main>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tools-guide"
          element={
            <ProtectedRoute>
              <main className="pt-16 min-h-screen bg-gray-50 dark:bg-gray-900">
                <ToolsGuidePage />
              </main>
            </ProtectedRoute>
          }
        />
        <Route
          path="/video-tutorials"
          element={
            <Navigate to="/coming-soon?feature=Video Tutorials" replace />
          }
        />

        {/* Temporary Icon Review Route */}
        <Route
          path="/icon-gallery"
          element={
            <ProtectedRoute>
              <main className="pt-16 min-h-screen bg-gray-50 dark:bg-gray-900">
                <IconGallery />
              </main>
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Page Not Found
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  The page you're looking for doesn't exist.
                </p>
                <Navigate to="/dashboard" replace />
              </div>
            </div>
          }
        />
      </Routes>
    </>
  );
};

export default AppRoutes;
