import { ExpiryWarningLevel } from "./types";

export interface SessionInfo {
  sessionDuration: string;
  timeRemaining: string;
  expiryWarning: ExpiryWarningLevel;
  sessionStart: Date | null;
  expiryTime: Date | null;
}

export const calculateSessionInfo = (user?: any): SessionInfo => {
  let sessionStart = sessionStorage.getItem("opti_connect_session_start");
  let backendSession = null;

  // Use the real backend Postgres session bounds if available
  if (user && user.active_sessions && user.active_sessions.length > 0) {
    backendSession = user.active_sessions[0];
  }

  // Determine actual Start Time (Database > Local Storage > Null)
  let startTime: Date | null = null;
  if (backendSession && backendSession.created_at) {
    startTime = new Date(backendSession.created_at);
  } else if (sessionStart) {
    startTime = new Date(sessionStart);
  }

  if (!startTime) {
    return {
      sessionDuration: "Calculating...",
      timeRemaining: "Calculating...",
      expiryWarning: "safe",
      sessionStart: null,
      expiryTime: null,
    };
  }

  const now = new Date();
  const elapsed = now.getTime() - startTime.getTime();
  
  // Determine actual Expiration Time (Database > 24 Hours Local Hardcode)
  let expiryTime: Date;
  if (backendSession && backendSession.expires_at) {
    expiryTime = new Date(backendSession.expires_at);
  } else {
    // Standard backend JWT expiry is 24 hours, not 4
    expiryTime = new Date(startTime.getTime() + 24 * 60 * 60 * 1000); 
  }

  const remaining = expiryTime.getTime() - now.getTime();

  // Calculate elapsed duration
  const elapsedHours = Math.floor(elapsed / (1000 * 60 * 60));
  const elapsedMinutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
  const elapsedSeconds = Math.floor((elapsed % (1000 * 60)) / 1000);

  // Calculate remaining time
  const remainingHours = Math.floor(remaining / (1000 * 60 * 60));
  const remainingMinutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  const remainingSeconds = Math.floor((remaining % (1000 * 60)) / 1000);

  const sessionDuration = `${elapsedHours}h ${elapsedMinutes}m ${elapsedSeconds}s`;

  let timeRemaining: string;
  let expiryWarning: ExpiryWarningLevel;

  if (remaining > 0) {
    if (remainingHours > 24) {
       const days = Math.floor(remainingHours / 24);
       timeRemaining = `${days}d ${remainingHours % 24}h remaining`;
    } else {
       timeRemaining = `${remainingHours}h ${remainingMinutes}m ${remainingSeconds}s`;
    }

    // Set warning level
    if (remaining < 30 * 60 * 1000) {
      expiryWarning = "critical";
    } else if (remaining < 60 * 60 * 1000) {
      expiryWarning = "warning";
    } else {
      expiryWarning = "safe";
    }
  } else {
    timeRemaining = "Session expired";
    expiryWarning = "critical";
  }

  return {
    sessionDuration,
    timeRemaining,
    expiryWarning,
    sessionStart: startTime,
    expiryTime,
  };
};

export const getUserInitials = (name?: string): string => {
  return (
    name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase() || "U"
  );
};

