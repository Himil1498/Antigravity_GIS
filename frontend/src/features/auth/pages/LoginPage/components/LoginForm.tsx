import React from 'react';
import { useLogin } from '../hooks/useLogin';
import LoginFormFields from './LoginFormFields';

interface LoginFormProps {
  loginState: ReturnType<typeof useLogin>;
  onForgotPassword: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ loginState, onForgotPassword }) => {
  const {
    formData,
    showPassword,
    setShowPassword,
    rememberMe,
    setRememberMe,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    preLoginInfo
  } = loginState;

  return (
    <div className="sp-card">
      {/* Card Header — Eyebrow style */}
      <div className="sp-card-header">
        <div className="sp-card-eyebrow">
          <div className="sp-card-eyebrow-line" />
          <span className="sp-card-eyebrow-text">Secure Access</span>
        </div>
        <p className="sp-card-title-bold">Sign in</p>
        <p className="sp-card-subtitle">
          Enter your credentials to access the portal
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <LoginFormFields
          formData={formData}
          handleInputChange={handleInputChange}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          rememberMe={rememberMe}
          setRememberMe={setRememberMe}
          onForgotPassword={onForgotPassword}
          error={error}
          preLoginInfo={preLoginInfo}
        />

        {/* Submit Button */}
        <button
          type="submit"
          className="sp-btn-primary"
          disabled={isLoading || !formData.username || !formData.password}
        >
          {isLoading ? (
            <>
              <div className="sp-spinner" />
              <span>Signing in…</span>
            </>
          ) : (
            <span>Sign in</span>
          )}
        </button>
      </form>

      {/* Security Footer */}
      <div className="sp-card-footer">
        <div className="flex items-center justify-center gap-3 w-full">
          <div className="flex items-center gap-1.5">
            <div className="sp-secure-dot" />
            <span>Secure connection</span>
          </div>
          {preLoginInfo?.is_2fa_enabled && (
            <>
              <div className="h-3 w-px bg-gray-300"></div>
              <div className="flex items-center gap-1 text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-100">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="text-[10px] font-bold tracking-wide">2FA PROTECTED</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
