import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAppSelector } from "../../../../store/index";
import { RootState } from "../../../../store/index";
import { ModeIndicator } from "../../../../components/layout/ModeIndicator/ModeIndicator";
import TwoFactorPrompt from "../../../../components/ui/TwoFactorPrompt/index";
import packageJson from "../../../../../package.json";
import { apiService } from "../../../../services/api/index";

// Components
import LoginForm from "./components/LoginForm";
import ForgotPasswordModal from "./components/ForgotPasswordModal";
import ContactSupportModal from "../../../../components/ui/ContactSupport/ContactSupportModal";
import WavyBackground from "./components/WavyBackground";

// Hooks
import { useLogin } from "./hooks/useLogin";
import { useForgotPassword } from "./hooks/useForgotPassword";
import { useContactSupport } from "../../../../components/ui/ContactSupport/useContactSupport";

import "./login-page.css";

const LoginPage: React.FC = () => {
  const { isAuthenticated } = useAppSelector((state: RootState) => state.auth);

  // Hooks
  const loginState = useLogin();
  const forgotState = useForgotPassword();
  const contactState = useContactSupport();

  // URL Sync for Modals
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    
    // Initial check on mount
    if (params.get('forgot-password') === 'true' && !forgotState.showForgotModal) {
      forgotState.handleForgotPassword();
    }
    if (params.get('contact-support') === 'true' && !contactState.showContactModal) {
      contactState.handleContactSupport();
    }
  }, []);

  // Update URL when modals open/close
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (forgotState.showForgotModal) {
      params.set('forgot-password', 'true');
    } else {
      params.delete('forgot-password');
    }
    
    if (contactState.showContactModal) {
      params.set('contact-support', 'true');
    } else {
      params.delete('contact-support');
    }
    
    const newRelativePathQuery = window.location.pathname + '?' + params.toString();
    window.history.replaceState(null, '', newRelativePathQuery === window.location.pathname + '?' ? window.location.pathname : newRelativePathQuery);
  }, [forgotState.showForgotModal, contactState.showContactModal]);

  // System Status State
  const [systemStatus, setSystemStatus] = useState<'checking' | 'operational' | 'degraded'>('checking');
  const [publicUpdate, setPublicUpdate] = useState<{ id: number; title: string; content: string; type: string } | null>(null);

  useEffect(() => {
    // Check system health
    const checkHealth = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulated latency
        setSystemStatus('operational');
      } catch (err) {
        setSystemStatus('degraded');
      }
    };
    checkHealth();

    // Fetch public updates
    const fetchUpdates = async () => {
      try {
        const response = await apiService.get('/updates/public');
        if (response.data?.success && response.data.data) {
          const update = response.data.data;
          const dismissedId = localStorage.getItem('dismissed_notice_id');
          if (dismissedId !== String(update.id)) {
            setPublicUpdate(update);
          }
        }
      } catch (err) {
        console.error("Failed to fetch public updates", err);
      }
    };
    fetchUpdates();
  }, []);

  const handleDismissNotice = () => {
    if (publicUpdate) {
      localStorage.setItem('dismissed_notice_id', String(publicUpdate.id));
      setPublicUpdate(null);
    }
  };

  const getThemeClasses = (type?: string) => {
    switch (type?.toLowerCase()) {
      case "maintenance":
      case "critical":
      case "outage":
      case "alert":
        return {
          text: "text-red-600 font-semibold",
          icon: "text-red-600",
          button: "text-red-600 hover:text-red-800 hover:bg-red-50",
        };
      case "feature":
      case "update":
      case "info":
        return {
          text: "text-blue-600 font-semibold",
          icon: "text-blue-600",
          button: "text-blue-600 hover:text-blue-800 hover:bg-blue-50",
        };
      case "success":
        return {
          text: "text-emerald-600 font-semibold",
          icon: "text-emerald-600",
          button: "text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50",
        };
      default: // 'warning', 'notice'
        return {
          text: "text-amber-600 font-semibold",
          icon: "text-amber-600",
          button: "text-amber-600 hover:text-amber-800 hover:bg-amber-50",
        };
    }
  };

  const theme = publicUpdate ? getThemeClasses(publicUpdate.type) : null;

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="sp-login-root">
      {/* ═══ Top Navigation Bar ═══ */}
      <header className="sp-topbar">
        <a className="sp-topbar-brand" href="#">
          <div className="sp-topbar-logo-wrap">
            <img
              src="/Logos/Transparent_Dark/logo1.png"
              alt="OptiConnect GIS"
              className="sp-topbar-logo"
            />
          </div>
        </a>
        <div className="sp-topbar-right">
          Need help?{" "}
          <button
            type="button"
            onClick={contactState.handleContactSupport}
            className="sp-topbar-link flex items-center gap-1.5"
          >
            <svg 
              className="w-4 h-4" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
              <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
            </svg>
            <span>Contact support</span>
          </button>
        </div>
      </header>

      {/* ── Announcement Banner ── */}
      {publicUpdate && theme && (
        <div className={`sp-announcement-banner ${theme.text}`} >
          <div className="w-full flex items-center justify-between px-4 py-1.5">
            <div className="flex-1"></div>
            <div className="flex items-center justify-center flex-1 min-w-max">
              {publicUpdate.type?.toLowerCase() === 'maintenance' ? (
                 <svg className={`w-4 h-4 mr-2 ${theme.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                 </svg>
              ) : (
                 <svg className={`w-4 h-4 mr-2 ${theme.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                 </svg>
              )}
              <span><strong>Notice:</strong> {publicUpdate.title} - {publicUpdate.content}</span>
            </div>
            <div className="flex-1 flex justify-end">
              <button 
                onClick={handleDismissNotice}
                className={`focus:outline-none p-1 rounded transition-colors ${theme.button}`}
                aria-label="Dismiss notice"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Main Content ═══ */}
      <main className="sp-main">
        <WavyBackground />
        <div className="sp-wrapper">

          {/* ── Left Info Panel ── */}
          <div className="sp-panel-left relative z-10">
            <div className={`sp-badge ${systemStatus === 'checking' ? 'opacity-70 transition-opacity' : 'transition-opacity'}`}>
              <div className={`sp-badge-dot ${
                systemStatus === 'operational' ? 'bg-emerald-500' : 
                systemStatus === 'checking' ? 'bg-amber-400' : 'bg-red-500'
              }`} />
              {systemStatus === 'checking' ? 'Checking system status...' : 
               systemStatus === 'operational' ? 'All systems operational' : 
               'Systems degraded'}
            </div>
            <h2>
              Your complete{" "}
              <strong>Geospatial Intelligence</strong>{" "}
              platform
            </h2>
            <p>
              Plan, deploy, and monitor telecom infrastructure seamlessly.
              OptiConnect GIS unifies live network mapping, inventory workflows,
              and dark fiber analytics into one enterprise command center.
            </p>

            <div className="sp-features">
              {/* Feature 1 — Infrastructure Mapping */}
              <div className="sp-feature-item">
                <div className="sp-feature-icon sp-fi-lock">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 1.5v11M1.5 7h11" stroke="#1E6FD9" strokeWidth="1.3" strokeLinecap="round" />
                    <circle cx="7" cy="7" r="5" stroke="#1E6FD9" strokeWidth="1.2" />
                    <circle cx="7" cy="7" r="2" stroke="#1E6FD9" strokeWidth="1" />
                  </svg>
                </div>
                <div className="sp-feature-text">
                  <strong>Live Infrastructure Mapping</strong>
                  <span>Visualize POPs, fiber routes, towers &amp; customer sites dynamically.</span>
                </div>
              </div>

              {/* Feature 2 — Dark Fiber Management */}
              <div className="sp-feature-item">
                <div className="sp-feature-icon sp-fi-clock">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 10l3-4 3 2 4-5" stroke="#D97706" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="2" cy="10" r="1" fill="#D97706" />
                    <circle cx="12" cy="3" r="1" fill="#D97706" />
                  </svg>
                </div>
                <div className="sp-feature-text">
                  <strong>Dark Fiber Management</strong>
                  <span>Import, manage &amp; trace routes with robust KML/KMZ integration.</span>
                </div>
              </div>

              {/* Feature 3 — Unified Platform Modules */}
              <div className="sp-feature-item">
                <div className="sp-feature-icon sp-fi-check">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <rect x="1" y="8" width="2.5" height="4" rx="0.5" fill="#0EA5A0" />
                    <rect x="4.5" y="5" width="2.5" height="7" rx="0.5" fill="#0EA5A0" />
                    <rect x="8" y="2" width="2.5" height="10" rx="0.5" fill="#0EA5A0" />
                    <rect x="11.5" y="3.5" width="1.5" height="8.5" rx="0.5" fill="#0EA5A0" opacity="0.5" />
                  </svg>
                </div>
                <div className="sp-feature-text">
                  <strong>Unified Ecosystem</strong>
                  <span>Centralized Data Hub, Network Planning, and real-time Analytics.</span>
                </div>
              </div>

              {/* Feature 4 — RBAC */}
              <div className="sp-feature-item">
                <div className="sp-feature-icon sp-fi-workflow">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <rect x="2" y="4" width="10" height="8" rx="1.5" stroke="#7c3aed" strokeWidth="1.2" />
                    <path d="M4.5 4V3a2.5 2.5 0 015 0v1" stroke="#7c3aed" strokeWidth="1.2" strokeLinecap="round" />
                    <circle cx="7" cy="8" r="1" fill="#7c3aed" />
                  </svg>
                </div>
                <div className="sp-feature-text">
                  <strong>Enterprise Security &amp; RBAC</strong>
                  <span>Granular access controls with region &amp; group level permissions.</span>
                </div>
              </div>
            </div>

            {/* ── Platform Metrics Strip ── */}
            <div className="sp-metrics-strip">
              <div className="sp-metric">
                <span className="sp-metric-value">Pan-India</span>
                <span className="sp-metric-label">Coverage</span>
              </div>
              <div className="sp-metric-divider" />
              <div className="sp-metric">
                <span className="sp-metric-value">Real-time</span>
                <span className="sp-metric-label">Analytics</span>
              </div>
              <div className="sp-metric-divider" />
              <div className="sp-metric">
                <span className="sp-metric-value">Secure</span>
                <span className="sp-metric-label">Enterprise</span>
              </div>
            </div>
          </div>

          {/* ── Login Card ── */}
          <LoginForm
            loginState={loginState}
            onForgotPassword={forgotState.handleForgotPassword}
          />
        </div>
      </main>

      {/* ═══ Bottom Bar ═══ */}
      <footer className="sp-bottombar relative z-10">
        <div className="flex flex-col gap-1">
          <p>© {new Date().getFullYear()} Optimal Telemedia. All rights reserved.</p>
        </div>
        {/* <div className="sp-bottombar-meta">
          <span>v{packageJson.version}</span>
          <span>·</span>
          <span>Privacy Policy</span>
          <span>·</span>
          <span>Terms of Use</span>
        </div> */}
      </footer>

      {/* ═══ Modals ═══ */}
      <ContactSupportModal
        isOpen={contactState.showContactModal}
        onClose={contactState.handleCloseContactModal}
        onOpenOutlook={contactState.handleOpenOutlookWeb}
        onCopyEmail={contactState.handleCopyEmail}
        emailCopied={contactState.emailCopied}
      />
      <ForgotPasswordModal
        isOpen={forgotState.showForgotModal}
        onClose={forgotState.handleCloseForgotModal}
        onSubmit={forgotState.handleSendForgotRequest}
        username={forgotState.forgotUsername}
        onUsernameChange={forgotState.setForgotUsername}
        reason={forgotState.forgotReason}
        onReasonChange={forgotState.setForgotReason}
        requestSent={forgotState.requestSent}
        isSending={forgotState.isSendingRequest}
        error={forgotState.requestError}
      />
      {loginState.show2FAPrompt && (
        <TwoFactorPrompt
          isOpen={loginState.show2FAPrompt}
          onClose={loginState.handle2FAClose}
          onVerify={loginState.handle2FAVerify}
          onResendCode={loginState.handle2FAResend}
          email={loginState.twoFactorEmail}
          expiresIn={loginState.twoFactorExpiresIn}
        />
      )}

      {/* Mode Indicator */}
      <ModeIndicator position="bottom-right" />
    </div>
  );
};

export default LoginPage;
