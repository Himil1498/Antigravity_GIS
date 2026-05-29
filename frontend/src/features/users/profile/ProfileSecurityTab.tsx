import React from "react";
import { useNavigate } from "react-router-dom";
import type { User } from "../../../types/auth/index";
import { SectionHeader } from "./ProfileComponents";
import { ShieldIcon } from "./ProfileIcons";

interface ProfileSecurityTabProps {
  profileData: User | null;
}

const ProfileSecurityTab: React.FC<ProfileSecurityTabProps> = ({
  profileData,
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
      <SectionHeader
        icon={<ShieldIcon />}
        title="Security & Verification"
        color="border-blue-300 dark:border-blue-600"
      />
      <div className="space-y-4">
        {/* Email Verification Status */}
        <div
          className={`p-5 rounded-lg border flex items-start justify-between ${
            profileData?.isEmailVerified
              ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
              : "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
          }`}
        >
          <div>
            <h4
              className={`font-semibold ${
                profileData?.isEmailVerified
                  ? "text-green-900 dark:text-green-100"
                  : "text-amber-900 dark:text-amber-100"
              }`}
            >
              Email Verification
            </h4>
            <p
              className={`text-sm mt-1 ${
                profileData?.isEmailVerified
                  ? "text-green-700 dark:text-green-300"
                  : "text-amber-700 dark:text-amber-300"
              }`}
            >
              {profileData?.isEmailVerified
                ? "Your email has been verified"
                : "Email verification pending"}
            </p>
          </div>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
              profileData?.isEmailVerified
                ? "bg-green-200 dark:bg-green-700 text-green-800 dark:text-green-100"
                : "bg-amber-200 dark:bg-amber-700 text-amber-800 dark:text-amber-100"
            }`}
          >
            {profileData?.isEmailVerified ? "✓ Verified" : "⏳ Pending"}
          </span>
        </div>

        {/* Two-Factor Authentication Status */}
        <div
          className={`p-5 rounded-lg border ${
            profileData?.mfaEnabled
              ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
              : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4
                  className={`font-semibold ${
                    profileData?.mfaEnabled
                      ? "text-green-900 dark:text-green-100"
                      : "text-blue-900 dark:text-blue-100"
                  }`}
                >
                  Two-Factor Authentication
                </h4>
                {profileData?.mfaEnabled && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-green-200 dark:bg-green-700 text-green-800 dark:text-green-100">
                    ✓ Active
                  </span>
                )}
              </div>
              <p
                className={`text-sm mt-1 ${
                  profileData?.mfaEnabled
                    ? "text-green-700 dark:text-green-300"
                    : "text-blue-700 dark:text-blue-300"
                }`}
              >
                {profileData?.mfaEnabled ? (
                  <>
                    <span className="font-medium">
                      Enabled via{" "}
                      {profileData.mfaMethod?.toUpperCase() || "EMAIL"}
                    </span>
                    {profileData.mfaEnabledAt && (
                      <>
                        <br />
                        <span className="text-xs">
                          Activated on{" "}
                          {new Date(
                            profileData.mfaEnabledAt,
                          ).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </>
                    )}
                    <br />
                    <span className="text-xs">
                      Additional verification required at login
                    </span>
                  </>
                ) : (
                  <>Add an extra layer of security to your account</>
                )}
              </p>
            </div>
          </div>

          {/* Benefits List (when disabled) */}
          {!profileData?.mfaEnabled && (
            <div className="mt-4 space-y-2">
              <p className="text-xs font-semibold text-blue-800 dark:text-blue-300">
                Why enable 2FA?
              </p>
              <ul className="space-y-1.5">
                <li className="flex items-start gap-2 text-xs text-blue-700 dark:text-blue-300">
                  <svg
                    className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Protects against unauthorized access</span>
                </li>
                <li className="flex items-start gap-2 text-xs text-blue-700 dark:text-blue-300">
                  <svg
                    className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Secure even if password is compromised</span>
                </li>
                <li className="flex items-start gap-2 text-xs text-blue-700 dark:text-blue-300">
                  <svg
                    className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Get instant alerts for suspicious login attempts</span>
                </li>
                <li className="flex items-start gap-2 text-xs text-blue-700 dark:text-blue-300">
                  <svg
                    className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Quick setup - verification codes via email</span>
                </li>
              </ul>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={() => navigate("/security")}
            className={`mt-4 w-full sm:w-auto px-5 py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl ${
              profileData?.mfaEnabled
                ? "bg-white border-2 border-green-500 text-green-700 hover:bg-green-50 dark:bg-gray-700 dark:border-green-600 dark:text-green-400 dark:hover:bg-green-900/30"
                : "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800"
            }`}
          >
            {profileData?.mfaEnabled ? (
              <>
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Disable 2FA
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                Enable 2FA
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSecurityTab;
