import React from 'react';
import { PendingAction } from './types';
import './Modals.css';

interface PasswordModalProps {
  password: string;
  setPassword: (v: string) => void;
  pendingAction: PendingAction;
  isEnabling: boolean;
  isDisabling: boolean;
  onSubmit: () => void;
  onClose: () => void;
}

export const PasswordModal: React.FC<PasswordModalProps> = ({
  password, setPassword, pendingAction, isEnabling, isDisabling, onSubmit, onClose
}) => (
  <div className="sec-modal-overlay">
    <div className="sec-modal-content">
      <h3 className="sec-modal-title">Confirm Your Password</h3>
      <p className="sec-modal-text">
        Please enter your password to {pendingAction === 'enable' ? 'enable' : 'disable'} two-factor authentication.
      </p>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
        placeholder="Enter your password"
        className="sec-modal-input"
        autoFocus
      />
      <div className="sec-modal-actions">
        <button onClick={onClose} className="sec-modal-btn sec-modal-btn-cancel">Cancel</button>
        <button onClick={onSubmit} disabled={!password || isEnabling || isDisabling} className="sec-modal-btn sec-modal-btn-primary">Continue</button>
      </div>
    </div>
  </div>
);

interface VerificationModalProps {
  verificationCode: string;
  setVerificationCode: (v: string) => void;
  isEnabling: boolean;
  onVerify: () => void;
  onClose: () => void;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({
  verificationCode, setVerificationCode, isEnabling, onVerify, onClose
}) => (
  <div className="sec-modal-overlay">
    <div className="sec-modal-content">
      <h3 className="sec-modal-title">Enter Verification Code</h3>
      <p className="sec-modal-text">We've sent a 6-digit code to your email. Please enter it below.</p>
      <input
        type="text"
        value={verificationCode}
        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
        onKeyDown={(e) => e.key === 'Enter' && onVerify()}
        placeholder="Enter 6-digit code"
        className="sec-modal-input mono-center"
        maxLength={6}
        autoFocus
      />
      <div className="sec-modal-actions">
        <button onClick={onClose} className="sec-modal-btn sec-modal-btn-cancel">Cancel</button>
        <button onClick={onVerify} disabled={verificationCode.length !== 6 || isEnabling} className="sec-modal-btn sec-modal-btn-primary">Verify</button>
      </div>
    </div>
  </div>
);
