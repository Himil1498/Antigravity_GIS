import React from 'react';
import { SecuritySettingsProps } from './types';
import { useSecuritySettings } from './useSecuritySettings';
import { PasswordModal, VerificationModal } from './Modals';
import './SecuritySettings.css';

const SecuritySettings: React.FC<SecuritySettingsProps> = () => {
  const {
    mfaStatus, isLoading, isEnabling, isDisabling, showPasswordPrompt, showVerificationPrompt,
    password, setPassword, verificationCode, setVerificationCode, error, success, pendingAction,
    handleEnableRequest, handleDisableRequest, handlePasswordSubmit, handleVerifyAndEnable,
    closePasswordPrompt, closeVerificationPrompt,
  } = useSecuritySettings();

  if (isLoading) {
    return (
      <>
        <div style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
          <div style={{ height: '1.5rem', backgroundColor: '#e5e7eb', borderRadius: '0.25rem', width: '33%', marginBottom: '1rem' }}></div>
          <div style={{ height: '1rem', backgroundColor: '#e5e7eb', borderRadius: '0.25rem', width: '66%', marginBottom: '0.5rem' }}></div>
          <div style={{ height: '1rem', backgroundColor: '#e5e7eb', borderRadius: '0.25rem', width: '50%' }}></div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="sec-settings-header">
        <div className="sec-settings-icon-wrapper">
          <svg className="sec-settings-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <div>
          <h3 className="sec-settings-title">Two-Factor Authentication</h3>
          <p className="sec-settings-subtitle">Add an extra layer of security to your account</p>
        </div>
      </div>

      {/* Messages */}
      {success && (
        <div className="sec-alert sec-alert-success">
          <svg className="sec-alert-icon" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <p>{success}</p>
        </div>
      )}
      {error && (
        <div className="sec-alert sec-alert-error">
          <svg className="sec-alert-icon" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <p>{error}</p>
        </div>
      )}

      {/* Status Card */}
      <div className={`sec-status-card ${mfaStatus?.enabled ? 'sec-status-enabled' : 'sec-status-disabled'}`}>
        <div className="sec-status-row">
          <div className="sec-status-left">
            <div className={`sec-status-dot ${mfaStatus?.enabled ? 'enabled' : 'disabled'}`}></div>
            <div>
              <p className="sec-status-text">Status: {mfaStatus?.enabled ? 'Enabled' : 'Disabled'}</p>
              {mfaStatus?.enabled && mfaStatus.enabledAt && (
                <p className="sec-status-date">Enabled on {new Date(mfaStatus.enabledAt).toLocaleDateString()}</p>
              )}
            </div>
          </div>
          <div className={`sec-method-badge ${mfaStatus?.enabled ? 'enabled' : 'disabled'}`}>
            {mfaStatus?.method === 'email' ? 'Email' : mfaStatus?.method || 'None'}
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="sec-how-works">
        <h4 className="sec-how-works-title">How it works:</h4>
        <ul className="sec-how-works-list">
          {['When you log in, you\'ll enter your password as usual', 'We\'ll send a 6-digit code to your email address', 'Enter the code to complete your login'].map((text, i) => (
            <li key={i} className="sec-how-works-item">
              <svg className="sec-how-works-icon" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {text}
            </li>
          ))}
        </ul>
      </div>

      {/* Action Button */}
      <div>
        {mfaStatus?.enabled ? (
          <button onClick={handleDisableRequest} disabled={isDisabling} className="sec-action-btn sec-btn-disable">
            {isDisabling ? 'Disabling...' : 'Disable Two-Factor Authentication'}
          </button>
        ) : (
          <button onClick={handleEnableRequest} disabled={isEnabling} className="sec-action-btn sec-btn-enable">
            {isEnabling ? 'Enabling...' : 'Enable Two-Factor Authentication'}
          </button>
        )}
      </div>

      {/* Modals */}
      {showPasswordPrompt && <PasswordModal password={password} setPassword={setPassword} pendingAction={pendingAction} isEnabling={isEnabling} isDisabling={isDisabling} onSubmit={handlePasswordSubmit} onClose={closePasswordPrompt} />}
      {showVerificationPrompt && <VerificationModal verificationCode={verificationCode} setVerificationCode={setVerificationCode} isEnabling={isEnabling} onVerify={handleVerifyAndEnable} onClose={closeVerificationPrompt} />}
    </>
  );
};

export default SecuritySettings;
