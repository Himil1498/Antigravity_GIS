import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../../contexts/AuthContext';
import { useAppDispatch } from '../../../../../store/index';
import { loginSuccess, loginFailure } from '../../../../../store/slices/authSlice';
import { apiService } from '../../../../../services/api/index';

export const useLogin = () => {
  const { login, isLoading, error, clearError } = useAuth();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const [show2FAPrompt, setShow2FAPrompt] = useState(false);
  const [twoFactorUserId, setTwoFactorUserId] = useState<number | null>(null);
  const [twoFactorEmail, setTwoFactorEmail] = useState("");
  const [twoFactorExpiresIn, setTwoFactorExpiresIn] = useState(600);

  // Pre-login Info State
  const [preLoginInfo, setPreLoginInfo] = useState<{
    last_login_at?: string;
    last_login_ip?: string;
    is_2fa_enabled?: boolean;
  } | null>(null);

  // Debounce username input and fetch pre-login info
  useEffect(() => {
    if (formData.username && formData.username.length > 3) {
      const timer = setTimeout(async () => {
        try {
          const response = await apiService.post('/auth/pre-login', { username: formData.username });
          if (response.data?.success && response.data.data) {
            setPreLoginInfo(response.data.data);
          } else {
            setPreLoginInfo(null);
          }
        } catch (e) {
          setPreLoginInfo(null);
        }
      }, 600);
      return () => clearTimeout(timer);
    } else {
      setPreLoginInfo(null);
    }
  }, [formData.username]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    if (error) {
      clearError();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username || !formData.password) {
      return;
    }

    try {
      // Persist rememberMe preference BEFORE login so authSlice can read it
      if (rememberMe) {
        localStorage.setItem('opti_remember_me', 'true');
      } else {
        localStorage.removeItem('opti_remember_me');
      }

      await login({
        email: formData.username,
        password: formData.password,
        rememberMe
      });

      // If login is successful (no 2FA), context handles redirect usually, 
      // but here we might need to handle 2FA response if it throws with specific data
    } catch (err: any) {
      // Check if error response indicates 2FA is required
      if (err?.response?.data?.require2FA) {
        setTwoFactorUserId(err.response.data.userId);
        setTwoFactorEmail(err.response.data.email);
        setTwoFactorExpiresIn(err.response.data.expiresIn || 600);
        setShow2FAPrompt(true);
      }
      // Other errors handled by auth context
    }
  };

  const handle2FAVerify = async (code: string) => {
    if (!twoFactorUserId) {
      throw new Error('No user ID for 2FA verification');
    }

    // Verify the 2FA code
    const response = await apiService.verify2FACode(twoFactorUserId, code);

    if (response.token && response.user) {
      // Store token in the correct storage based on rememberMe preference
      // (loginSuccess in authSlice handles this, but we set it here too for the API interceptor)
      if (rememberMe) {
        localStorage.setItem('opti_connect_token', response.token);
      } else {
        sessionStorage.setItem('opti_connect_token', response.token);
      }

      // Dispatch login success to Redux (authSlice handles full storage logic)
      dispatch(loginSuccess({
        user: response.user,
        token: response.token
      }));

      setShow2FAPrompt(false);
      navigate('/dashboard');
    }
  };

  const handle2FAResend = async () => {
    if (!twoFactorUserId) return;
    await apiService.send2FACode(twoFactorUserId);
  };

  const handle2FAClose = () => {
    setShow2FAPrompt(false);
    setTwoFactorUserId(null);
    setTwoFactorEmail('');
    dispatch(loginFailure('2FA verification cancelled'));
  };

  return {
    formData,
    showPassword,
    setShowPassword,
    rememberMe,
    setRememberMe,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    // 2FA
    show2FAPrompt,
    twoFactorEmail,
    twoFactorExpiresIn,
    handle2FAVerify,
    handle2FAResend,
    handle2FAClose,
    // Pre-login Info
    preLoginInfo
  };
};

