import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../../store/index';
import { parseUserId } from '../../../utils/userHelpers';
import { calculateSessionInfo, SessionInfo } from '../../../components/NavigationBar/ProfileDropdown/sessionUtils';
import SecuritySettings from '../../../components/ui/SecuritySettings/SecuritySettings';
import PageContainer from '../../../components/ui/PageContainer';
import './SecurityPage.css';

const SecurityPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  
  const [sessionInfo, setSessionInfo] = React.useState<SessionInfo>(
    calculateSessionInfo(user)
  );

  React.useEffect(() => {
    const interval = setInterval(() => {
      setSessionInfo(calculateSessionInfo(user));
    }, 1000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <PageContainer>
      <div className="security-page-wrapper">
        {/* Page Header */}
        <div className="security-header">
          <button 
            onClick={() => navigate(-1)}
            className="security-back-btn"
          >
            <svg className="security-back-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
          <h1 className="security-title">Security Settings</h1>
          <p className="security-subtitle">
            Manage your account security and authentication preferences
          </p>
        </div>

        {/* Security Grid Layout */}
        <div className="security-grid">
          
          {/* Two-Factor Authentication (Spans 2 columns on large screens) */}
          <div className="security-card span-2">
            <SecuritySettings userId={user?.id ? parseUserId(user.id) : undefined} />
          </div>

          {/* Account Information */}
          <div className="security-card">
            <h3 className="security-card-title">Account Information</h3>
            <div>
              <div className="security-info-row">
                <span className="security-info-label">Email</span>
                <span className="security-info-value">{user?.email || 'N/A'}</span>
              </div>
              <div className="security-info-row">
                <span className="security-info-label">Username</span>
                <span className="security-info-value">{user?.username || 'N/A'}</span>
              </div>
              <div className="security-info-row">
                <span className="security-info-label">Role</span>
                <span className="security-badge badge-blue">
                  {user?.role || 'N/A'}
                </span>
              </div>
              <div className="security-info-row">
                <span className="security-info-label">Account Status</span>
                <span className={`security-badge ${user?.isActive ? 'badge-green' : 'badge-red'}`}>
                  {user?.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          {/* Active Session Activity */}
          <div className="security-card">
            <h3 className="security-card-title">Current Session Activity</h3>
            <div>
              <div className="security-info-row">
                <span className="security-info-label">Session Started</span>
                <span className="security-info-value">
                  {sessionInfo.sessionStart ? sessionInfo.sessionStart.toLocaleString("en-IN") : 'Active'}
                </span>
              </div>
              <div className="security-info-row">
                <span className="security-info-label">Token Expiry</span>
                <span className="security-info-value">
                  {sessionInfo.expiryTime ? sessionInfo.expiryTime.toLocaleString("en-IN") : 'N/A'}
                </span>
              </div>
              <div className="security-info-row">
                <span className="security-info-label">Duration Elapsed</span>
                <span className="security-info-value value-highlight">
                  {sessionInfo.sessionDuration}
                </span>
              </div>
              <div className="security-info-row">
                <span className="security-info-label">Idle Timeout Policy</span>
                <span className="security-info-value value-warning">
                  Automatic logout after 2 hours of inactivity
                </span>
              </div>
            </div>
          </div>

          {/* Security Best Practices */}
          <div className="security-card span-2">
            <div className="security-best-practices">
              <div className="bp-header">
                <svg className="bp-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="bp-title">Security Best Practices</h3>
                  <ul className="bp-list">
                    <li className="bp-item">
                      <span className="bp-bullet">•</span>
                      <span>Enable two-factor authentication for enhanced account security</span>
                    </li>
                    <li className="bp-item">
                      <span className="bp-bullet">•</span>
                      <span>Use a strong, unique password for your account</span>
                    </li>
                    <li className="bp-item">
                      <span className="bp-bullet">•</span>
                      <span>Never share your verification codes with anyone</span>
                    </li>
                    <li className="bp-item">
                      <span className="bp-bullet">•</span>
                      <span>Log out from shared or public devices</span>
                    </li>
                    <li className="bp-item">
                      <span className="bp-bullet">•</span>
                      <span>Review your active sessions regularly</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </PageContainer>
  );
};

export default SecurityPage;
