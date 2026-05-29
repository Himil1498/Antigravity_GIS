import { useState, useEffect } from 'react';
import { useAppDispatch } from '../../../store/index';
import { updateUser } from '../../../store/slices/authSlice';
import { apiService } from '../../../services/api/index';
import { MFAStatus, PendingAction } from './types';

export const useSecuritySettings = () => {
  const dispatch = useAppDispatch();
  const [mfaStatus, setMfaStatus] = useState<MFAStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnabling, setIsEnabling] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [showVerificationPrompt, setShowVerificationPrompt] = useState(false);
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  useEffect(() => { fetchMFAStatus(); }, []);

  const fetchMFAStatus = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.get2FAStatus();
      setMfaStatus(response.mfa);
    } catch (err: any) {
      console.error('Failed to fetch 2FA status:', err);
      setError('Failed to load 2FA status');
    } finally {
      setIsLoading(false);
    }
  };

  const updateReduxUserProfile = async () => {
    try {
      const freshUserData = await apiService.getCurrentUserProfile();
      dispatch(updateUser(freshUserData));
    } catch (err: any) {
      console.error('Failed to update Redux store:', err);
    }
  };

  const handleEnableRequest = () => { setPendingAction('enable'); setShowPasswordPrompt(true); setError(''); setSuccess(''); };
  const handleDisableRequest = () => { setPendingAction('disable'); setShowPasswordPrompt(true); setError(''); setSuccess(''); };

  const handlePasswordSubmit = async () => {
    if (!password) { setError('Password is required'); return; }
    setError('');
    if (pendingAction === 'enable') await handleEnable2FA();
    else if (pendingAction === 'disable') await handleDisable2FA();
  };

  const handleEnable2FA = async () => {
    try {
      setIsEnabling(true);
      const response = await apiService.enable2FA(password);
      if (response.requireVerification) {
        setShowPasswordPrompt(false);
        setShowVerificationPrompt(true);
        setSuccess('Verification code sent to your email. Please check your inbox.');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to enable 2FA');
    } finally { setIsEnabling(false); setPassword(''); }
  };

  const handleVerifyAndEnable = async () => {
    if (verificationCode.length !== 6) { setError('Please enter the 6-digit code'); return; }
    try {
      setIsEnabling(true);
      await apiService.verifyAndEnable2FA(verificationCode);
      setSuccess('2FA enabled successfully! You will need to enter a code on your next login.');
      setShowVerificationPrompt(false); setVerificationCode(''); setPendingAction(null);
      await fetchMFAStatus();
      await updateReduxUserProfile();
    } catch (err: any) { setError(err.response?.data?.error || 'Failed to verify code'); }
    finally { setIsEnabling(false); }
  };

  const handleDisable2FA = async () => {
    try {
      setIsDisabling(true);
      await apiService.disable2FA(password);
      setSuccess('2FA disabled successfully');
      setShowPasswordPrompt(false); setPassword(''); setPendingAction(null);
      await fetchMFAStatus();
      await updateReduxUserProfile();
    } catch (err: any) { setError(err.response?.data?.error || 'Failed to disable 2FA'); }
    finally { setIsDisabling(false); }
  };

  const closePasswordPrompt = () => { setShowPasswordPrompt(false); setPassword(''); setPendingAction(null); setError(''); };
  const closeVerificationPrompt = () => { setShowVerificationPrompt(false); setVerificationCode(''); setError(''); };

  return {
    mfaStatus, isLoading, isEnabling, isDisabling, showPasswordPrompt, showVerificationPrompt,
    password, setPassword, verificationCode, setVerificationCode, error, success, pendingAction,
    handleEnableRequest, handleDisableRequest, handlePasswordSubmit, handleVerifyAndEnable,
    closePasswordPrompt, closeVerificationPrompt,
  };
};

