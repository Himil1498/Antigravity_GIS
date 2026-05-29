import React from "react";
import { useNavigate } from "react-router-dom";
import type { User } from "../../../types/auth/index";

interface SecurityScoreProps {
  profileData: User | null;
}

const SecurityScore: React.FC<SecurityScoreProps> = ({ profileData }) => {
  const navigate = useNavigate();

  // Calculate security score
  const calculateScore = () => {
    let score = 0;
    let maxScore = 100;

    // Email verified (40 points)
    if (profileData?.isEmailVerified) score += 40;

    // 2FA enabled (40 points)
    const is2FAEnabled = profileData?.mfaEnabled === true;
    if (is2FAEnabled) score += 40;

    // Account active (10 points)
    if (profileData?.isActive) score += 10;

    // Recent login activity (10 points)
    if (profileData?.lastLogin) {
      const daysSinceLogin = Math.floor(
        (Date.now() - new Date(profileData.lastLogin).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceLogin < 7) score += 10;
    }

    return { score, maxScore };
  };

  const { score, maxScore } = calculateScore();
  const percentage = Math.round((score / maxScore) * 100);

  const getScoreColor = () => {
    if (percentage >= 90) return "emerald";
    if (percentage >= 70) return "blue";
    if (percentage >= 50) return "amber";
    return "red";
  };

  const color = getScoreColor();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Security Score
        </h3>
        <span className={`text-2xl font-bold text-${color}-600 dark:text-${color}-400`}>
          {score}/{maxScore}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-600 dark:text-gray-400">Account Security</span>
          <span className={`text-xs font-bold text-${color}-600 dark:text-${color}-400`}>
            {percentage}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r transition-all duration-500 ${
              color === "emerald"
                ? "from-emerald-500 to-emerald-600"
                : color === "blue"
                ? "from-blue-500 to-blue-600"
                : color === "amber"
                ? "from-amber-500 to-amber-600"
                : "from-red-500 to-red-600"
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Security Checklist */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm">
          {profileData?.isEmailVerified ? (
            <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          )}
          <span className="text-gray-700 dark:text-gray-300">Email Verified</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          {profileData?.mfaEnabled === true ? (
            <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          )}
          <span className="text-gray-700 dark:text-gray-300">
            2FA {profileData?.mfaEnabled === true ? "Enabled" : "Not Enabled"}
          </span>
        </div>
      </div>

      {/* Action Button */}
      {profileData?.mfaEnabled !== true && (
        <button
          onClick={() => navigate('/security')}
          className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-semibold text-sm transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
          Improve Score
        </button>
      )}
    </div>
  );
};

export default SecurityScore;

