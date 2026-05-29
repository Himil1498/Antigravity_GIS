/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, Suspense } from "react";
import { BrowserRouter as Router, useLocation } from "react-router-dom";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

// Store
import { store, persistor } from "./store/index";

// Context Providers
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { LogoProvider } from "./contexts/LogoContext";
import { GoogleMapsProvider } from "./contexts/GoogleMapsContext";
import { ToolsProvider } from "./features/tools/contexts/ToolsContext";

// Utils
import {
  config,
  validateEnvironment,
  debugLog,
} from "./utils/environment/index";

// Components
import ErrorBoundary from "./components/ui/ErrorBoundary";
import PageLoader from "./components/ui/PageLoader";
import TemporaryRegionMonitor from "./components/ui/TemporaryRegionMonitor";
import ConditionalNavigationBar from "./components/ui/ConditionalNavigationBar";
import PublicRouteGuard from "./components/ui/PublicRouteGuard";
import AppRoutes from "./routes/AppRoutes";
import NotificationManager from "./components/ui/NotificationManager";
import MaintenanceOverlay from "./components/ui/MaintenanceOverlay";

const GlobalToast = () => {
  const location = useLocation();
  const isToolsPage = location.pathname.startsWith('/tools');
  
  return (
    <ToastContainer
      position={isToolsPage ? "top-right" : "bottom-left"}
      autoClose={3000}
      hideProgressBar={true}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      className="toast-container"
      style={isToolsPage ? { top: '150px' } : undefined}
    />
  );
};

const App: React.FC = () => {
  useEffect(() => {
    // Removed buggy public route override logic

    // Validate environment configuration on startup
    const validation = validateEnvironment();

    if (!validation.valid) {
      console.error("Environment validation failed:", validation.errors);
      validation.errors.forEach((error: string) => {
        console.error(`❌ ${error}`);
      });
    }

    // Log application startup information
    debugLog("Application starting...", {
      mode: config.app.mode,
      environment: config.app.environment,
      version: config.app.version,
      debug: config.app.debug,
      buildDate: config.app.buildDate,
    });
  }, []);

  // Removed buggy intended_public_route injection

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error(
          "React Error Boundary caught an error:",
          error,
          errorInfo,
        );
      }}
    >
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <ThemeProvider>
            <GoogleMapsProvider>
              <AuthProvider>
                <LogoProvider>
                  <ToolsProvider>
                    <Router>
                      <div className="App min-h-screen bg-gray-50 dark:bg-gray-900">
                        {/* Toast Notifications Container */}
                        <GlobalToast />
                        
                        <NotificationManager />
                        <MaintenanceOverlay />

                        {/* Navigation and Route Guards */}
                        <PublicRouteGuard />
                        <TemporaryRegionMonitor />
                        <ConditionalNavigationBar />

                        {/* Main Application Routes */}
                        <Suspense fallback={<PageLoader />}>
                          <AppRoutes />
                        </Suspense>
                      </div>
                    </Router>
                  </ToolsProvider>
                </LogoProvider>
              </AuthProvider>
            </GoogleMapsProvider>
          </ThemeProvider>
        </PersistGate>
      </Provider>
    </ErrorBoundary>
  );
};

export default App;

