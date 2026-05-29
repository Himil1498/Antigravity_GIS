import React, { useState } from 'react';

interface LoginFormFieldsProps {
  formData: { username: string; password: string };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  rememberMe: boolean;
  setRememberMe: (val: boolean) => void;
  onForgotPassword: () => void;
  error?: string | null;
  preLoginInfo?: {
    last_login_at?: string;
    last_login_ip?: string;
    is_2fa_enabled?: boolean;
  } | null;
}

const LoginFormFields: React.FC<LoginFormFieldsProps> = ({
  formData,
  handleInputChange,
  showPassword,
  setShowPassword,
  rememberMe,
  setRememberMe,
  onForgotPassword,
  error,
  preLoginInfo
}) => {
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  // Helper to format date
  const formatTimeAgo = (dateString?: string) => {
    if (!dateString) return "recently";
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return "less than an hour ago";
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days ago`;
  };

  return (
    <>


      {/* ── Email / Username Field ── */}
      <div className="sp-field">
        <label htmlFor="username">Email / Username</label>
        <div className="sp-input-wrap">
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            required
            value={formData.username}
            onChange={handleInputChange}
            className="sp-input"
            placeholder="you@organisation.com"
          />
          <span className="sp-input-icon">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <rect x="1" y="3" width="13" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
              <path d="M1 5l6.5 4.5L14 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </span>
        </div>
        {error && !preLoginInfo && (
          <div className="sp-field-error">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Invalid email or username
          </div>
        )}
      </div>

      {/* ── Password Field ── */}
      <div className="sp-field">
        <label htmlFor="password">Password</label>
        <div className="sp-input-wrap">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            value={formData.password}
            onChange={handleInputChange}
            onFocus={() => setIsPasswordFocused(true)}
            onBlur={() => setIsPasswordFocused(false)}
            className="sp-input"
            placeholder="Enter your password"
          />
          <button
            className="sp-toggle-btn"
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label="Toggle password visibility"
          >
            {showPassword ? (
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path d="M1.5 7.5C3 4.5 5 3 7.5 3s4.5 1.5 6 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                <path d="M2 11l11-7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <ellipse cx="7.5" cy="7.5" rx="5.5" ry="3.5" stroke="currentColor" strokeWidth="1.2" />
                <circle cx="7.5" cy="7.5" r="1.75" fill="currentColor" />
              </svg>
            )}
          </button>
        </div>
        {error && preLoginInfo && (
          <div className="sp-field-error">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Invalid password
          </div>
        )}
        {formData.username && isPasswordFocused && preLoginInfo && preLoginInfo.last_login_at && (
          <div className="mt-2 text-[11px] text-emerald-600 flex items-center gap-1.5 animate-pulse">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Last login: {formatTimeAgo(preLoginInfo.last_login_at)} from {preLoginInfo.last_login_ip || 'unknown IP'}
          </div>
        )}
      </div>
      



      {/* ── Remember Me + Forgot Password ── */}
      <div className="sp-form-row">
        <label className="sp-check-label">
          <input
            type="checkbox"
            id="remember-me"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          Keep me signed in for 7 days
        </label>
        <button
          type="button"
          className="sp-forgot flex items-center gap-1.5"
          onClick={onForgotPassword}
        >
          <svg className="w-3.5 h-3.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
          Forgot password?
        </button>
      </div>
    </>
  );
};

export default LoginFormFields;
