/**
 * Centralized auth token accessor
 * Checks sessionStorage first (default), then localStorage (persistent "Keep me signed in" sessions)
 * 
 * Use this instead of directly calling sessionStorage.getItem("opti_connect_token")
 * to ensure compatibility with both session-only and persistent authentication modes.
 */
export const getAuthToken = (): string | null => {
  return (
    sessionStorage.getItem("opti_connect_token") ||
    localStorage.getItem("opti_connect_token")
  );
};
