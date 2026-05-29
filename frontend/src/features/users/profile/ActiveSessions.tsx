import React from "react";
import type { User } from "../../../types/auth/index";

interface ActiveSessionsProps {
  profileData: User | null;
}

const ActiveSessions: React.FC<ActiveSessionsProps> = ({ profileData }) => {
  // Utility to parse UA string into OS and Browser
  const parseUserAgent = (uaData: string) => {
    const ua = uaData || navigator.userAgent;
    let browser = "Unknown Browser";
    let os = "Unknown OS";

    if (ua.indexOf("Chrome") > -1 && ua.indexOf("Edg") === -1) browser = "Chrome";
    else if (ua.indexOf("Safari") > -1 && ua.indexOf("Chrome") === -1) browser = "Safari";
    else if (ua.indexOf("Firefox") > -1) browser = "Firefox";
    else if (ua.indexOf("Edg") > -1) browser = "Edge";
    else if (ua.indexOf("MSIE") > -1 || ua.indexOf("Trident") > -1) browser = "Internet Explorer";

    if (ua.indexOf("Win") > -1) os = "Windows";
    else if (ua.indexOf("Mac") > -1) os = "macOS";
    else if (ua.indexOf("Linux") > -1) os = "Linux";
    else if (ua.indexOf("Android") > -1) os = "Android";
    else if (ua.indexOf("iOS") > -1) os = "iOS";

    return { browser, os };
  };

  const sessions = profileData?.active_sessions || [];
  const currentSessionData = sessions.length > 0 ? sessions[0] : null;
  const currentSessionUa = currentSessionData ? parseUserAgent(currentSessionData.user_agent) : parseUserAgent(navigator.userAgent);

  const currentSession = {
    device: currentSessionUa.os,
    browser: currentSessionUa.browser,
    location: currentSessionData 
      ? (currentSessionData.ip_address === "127.0.0.1" || currentSessionData.ip_address === "::1" ? "Local Network" : "Unknown Location") 
      : "Resolving Location...",
    ip: currentSessionData?.ip_address || "127.0.0.1",
    lastActive: "Active now"
  };

  const otherSessions = sessions.length > 1 ? sessions.slice(1) : [];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Active Sessions
        </h3>
        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded-full">
          {sessions.length > 0 ? sessions.length : 1} Active
        </span>
      </div>

      {/* Current Session */}
      <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-lg">
              <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-green-900 dark:text-green-100">
                Current Session
              </p>
              <p className="text-xs text-green-700 dark:text-green-300">
                {currentSession.device} • {currentSession.browser}
              </p>
            </div>
          </div>
          <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Active now
          </span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{currentSession.location}</span>
          </div>
          <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
            <span>IP: {currentSession.ip}</span>
          </div>
        </div>
      </div>

      {/* Other Devices */}
      <div className="mt-4">
        {otherSessions.length === 0 ? (
          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span className="text-sm text-gray-600 dark:text-gray-300">Other Devices</span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                0 devices
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Other Active Devices ({otherSessions.length})
            </p>
            <div className="max-h-[350px] overflow-y-auto custom-scrollbar pr-2 space-y-3">
              {otherSessions.map((session, idx) => {
                const parsed = parseUserAgent(session.user_agent);
                return (
                  <div key={session.id || idx} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex justify-between items-center text-sm">
                    <div className="flex items-center gap-3">
                      <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <div>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{parsed.os} • {parsed.browser}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          <span className="inline-block mr-3">IP: {session.ip_address}</span>
                          <span className="inline-flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {session.ip_address === "127.0.0.1" || session.ip_address === "::1" ? "Local Network" : "Unknown Location"}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {new Date(session.last_activity || session.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Info Note */}
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-2">
          <svg className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <p className="text-xs text-blue-700 dark:text-blue-300">
            If you see unfamiliar devices or locations, change your password immediately and contact support.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ActiveSessions;
